import fs from "fs";
import yaml from "js-yaml";
import xml2js from "xml2js";
import toml from "@iarna/toml";

export async function readRepopack(content: string) {
  const files: Record<string, string> = {};

  console.log("content");
  const repoFilesIndex = content.indexOf("Repository Files");
  if (repoFilesIndex === -1) {
    throw new Error("Repository Files section not found in repopack.txt");
  }

  const filesContent = content.slice(repoFilesIndex);

  const fileRegex =
    /={15,}\s*File:\s*(.*?)\s*={15,}\s*([\s\S]*?)(?=(?:\n={15,}\s*File:|\s*$))/g;
  let match;

  while ((match = fileRegex.exec(filesContent)) !== null) {
    const filePath = match[1].trim();
    const fileContent = match[2].trim();
    files[filePath] = fileContent;
  }

  console.log("Files Parsed:", Object.keys(files));

  return files;
}

export async function analyzeProject(files: Record<string, string>) {
  const projectTypes = new Set<string>();
  let languageVersion = "";
  const dependencies = new Set<string>();
  const osRequirements = new Set<string>();
  const environmentVariables = new Set<string>();
  const ports = new Set<number>();
  let notes = "";

  // Helper functions
  function parseJSON(content: string) {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  function parseYAML(content: string) {
    try {
      return yaml.load(content);
    } catch {
      return null;
    }
  }

  async function parseXML(content: string) {
    return new Promise((resolve) => {
      xml2js.parseString(content, (err, result) => {
        if (err) resolve(null);
        else resolve(result);
      });
    });
  }

  function parseTOML(content: string) {
    try {
      return toml.parse(content);
    } catch {
      return null;
    }
  }

  function extractEnvVariablesFromCode(content: string) {
    const envPatterns = [
      /process\.env\.([A-Z_][A-Z0-9_]*)/g,
      /os\.environ\.get\(['"]([A-Z_][A-Z0-9_]*)['"]\)/g,
      /ENV\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
      /\$ENV\{([A-Z_][A-Z0-9_]*)\}/g,
      /\$([A-Z_][A-Z0-9_]*)/g,
    ];
    envPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        environmentVariables.add(match[1]);
      }
    });
  }

  for (const [fileName, content] of Object.entries(files)) {
    const lowerFileName = fileName.toLowerCase();

    if (lowerFileName.endsWith("package.json")) {
      // Node.js project
      projectTypes.add("Node.js");
      const packageJson = parseJSON(content);
      if (!packageJson) continue;
      const engines = packageJson.engines || {};
      languageVersion = engines.node
        ? `Node.js ${engines.node}`
        : "Node.js latest";

      // Collect dependencies
      const deps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};
      Object.entries(deps).forEach(([dep, version]) =>
        dependencies.add(`${dep}@${version}`)
      );
      Object.entries(devDeps).forEach(([dep, version]) =>
        dependencies.add(`${dep}@${version}`)
      );

      // Detect frameworks
      if ("react" in deps || "react" in devDeps) projectTypes.add("React");
      if ("react-native" in deps || "react-native" in devDeps) {
        projectTypes.add("React Native");
        osRequirements.add("Android SDK");
        osRequirements.add("iOS SDK (Xcode)");
        notes += "React Native projects require Android and iOS build tools.\n";
      }
      if ("expo" in deps || "expo" in devDeps) {
        projectTypes.add("Expo");
        notes += "Expo requires specific SDK versions.\n";
      }
      if ("express" in deps || "express" in devDeps)
        projectTypes.add("Express");
      if ("next" in deps || "next" in devDeps) projectTypes.add("Next.js");

      // Extract scripts to find build commands and ports
      const scripts = packageJson.scripts || {};
      Object.values(scripts).forEach((script) => {
        const portMatches = script.match(/(--port|PORT)\s+(\d+)/g);
        if (portMatches) {
          portMatches.forEach((match) => {
            const port = match.split(/\s+/).pop();
            ports.add(parseInt(port, 10));
          });
        }
      });

      // Extract environment variables from scripts
      Object.values(scripts).forEach((script) => {
        const envVarMatches = script.match(/([A-Z_][A-Z0-9_]*)=/g);
        if (envVarMatches) {
          envVarMatches.forEach((match) => {
            environmentVariables.add(match.replace("=", ""));
          });
        }
      });
    } else if (
      lowerFileName.endsWith("requirements.txt") ||
      lowerFileName.endsWith("pipfile")
    ) {
      // Python project
      projectTypes.add("Python");
      if (!languageVersion) languageVersion = "Python latest";

      // Collect dependencies
      const lines = content.split("\n");
      lines.forEach((line) => {
        if (line && !line.startsWith("#")) dependencies.add(line.trim());
      });
    } else if (lowerFileName.endsWith("pyproject.toml")) {
      // Python project using Poetry
      projectTypes.add("Python");
      if (!languageVersion) languageVersion = "Python latest";

      const pyprojectData = parseTOML(content);
      if (
        pyprojectData &&
        pyprojectData.tool &&
        pyprojectData.tool.poetry &&
        pyprojectData.tool.poetry.dependencies
      ) {
        Object.entries(pyprojectData.tool.poetry.dependencies).forEach(
          ([pkg, ver]) => {
            if (typeof ver === "string") dependencies.add(`${pkg}==${ver}`);
            else if (ver.version) dependencies.add(`${pkg}==${ver.version}`);
          }
        );
      }
    } else if (lowerFileName.endsWith("pom.xml")) {
      // Java project using Maven
      projectTypes.add("Java");
      const pomData = await parseXML(content);
      if (pomData && pomData.project) {
        const properties = pomData.project.properties || {};
        languageVersion = properties["java.version"]
          ? `Java ${properties["java.version"][0]}`
          : "Java latest";
        notes += "Maven project detected.\n";

        // Collect dependencies
        const deps = pomData.project.dependencies
          ? pomData.project.dependencies[0].dependency || []
          : [];
        deps.forEach((dep) => {
          const groupId = dep.groupId[0];
          const artifactId = dep.artifactId[0];
          const version = dep.version ? dep.version[0] : "latest";
          dependencies.add(`${groupId}:${artifactId}:${version}`);
        });
      }
    } else if (lowerFileName.endsWith("build.gradle")) {
      // Check if it's an Android project
      if (
        content.includes("com.android.application") ||
        content.includes("com.android.library")
      ) {
        projectTypes.add("Android");
        languageVersion = "Java latest";
        osRequirements.add("Android SDK");
        notes += "Android projects require Android SDK to build.\n";

        // Collect dependencies from build.gradle
        const depMatches = content.match(
          /implementation ['"](.+?):(.+?):(.+?)['"]/g
        );
        if (depMatches) {
          depMatches.forEach((line) => {
            const match = line.match(
              /implementation ['"](.+?):(.+?):(.+?)['"]/
            );
            if (match) {
              const group = match[1];
              const name = match[2];
              const version = match[3];
              dependencies.add(`${group}:${name}:${version}`);
            }
          });
        }
      } else {
        // Java project using Gradle
        projectTypes.add("Java");
        languageVersion = "Java latest";
        notes += "Gradle project detected.\n";

        // Collect dependencies from build.gradle
        const depMatches = content.match(
          /implementation ['"](.+?):(.+?):(.+?)['"]/g
        );
        if (depMatches) {
          depMatches.forEach((line) => {
            const match = line.match(
              /implementation ['"](.+?):(.+?):(.+?)['"]/
            );
            if (match) {
              const group = match[1];
              const name = match[2];
              const version = match[3];
              dependencies.add(`${group}:${name}:${version}`);
            }
          });
        }
      }
    } else if (lowerFileName.endsWith("go.mod")) {
      // Go project
      projectTypes.add("Go");
      const goModContent = content;
      const versionMatch = goModContent.match(/^go (\d+\.\d+)/m);
      languageVersion = versionMatch ? `Go ${versionMatch[1]}` : "Go latest";

      // Collect dependencies
      const requireMatches = goModContent.match(
        /^require\s+([\S]+)\s+([\S]+)/gm
      );
      if (requireMatches) {
        requireMatches.forEach((line) => {
          const [, pkg, ver] = line.match(/^require\s+([\S]+)\s+([\S]+)/);
          dependencies.add(`${pkg}@${ver}`);
        });
      }
    } else if (lowerFileName.endsWith("gemfile")) {
      // Ruby project
      projectTypes.add("Ruby");
      if (!languageVersion) languageVersion = "Ruby latest";
      const gemMatches = content.match(
        /gem ['"]([\S]+)['"],\s*['"]([\S]+)['"]/g
      );
      if (gemMatches) {
        gemMatches.forEach((line) => {
          const [, gem, ver] = line.match(
            /gem ['"]([\S]+)['"],\s*['"]([\S]+)['"]/
          );
          dependencies.add(`${gem}@${ver}`);
        });
      }
    } else if (lowerFileName.endsWith("composer.json")) {
      // PHP project
      projectTypes.add("PHP");
      const composerJson = parseJSON(content);
      if (!composerJson) continue;
      languageVersion =
        composerJson.require && composerJson.require.php
          ? `PHP ${composerJson.require.php}`
          : "PHP latest";

      // Collect dependencies
      const deps = composerJson.require || {};
      Object.entries(deps).forEach(([dep, version]) =>
        dependencies.add(`${dep}:${version}`)
      );
    } else if (lowerFileName.endsWith(".csproj")) {
      // .NET project
      projectTypes.add(".NET");
      languageVersion = ".NET latest";

      const csprojData = await parseXML(content);
      if (csprojData && csprojData.Project && csprojData.Project.ItemGroup) {
        csprojData.Project.ItemGroup.forEach((group) => {
          if (group.PackageReference) {
            group.PackageReference.forEach((pkg) => {
              const include = pkg.$.Include;
              const version = pkg.$.Version;
              dependencies.add(`${include}@${version}`);
            });
          }
        });
      }
    } else if (lowerFileName.endsWith("cargo.toml")) {
      // Rust project
      projectTypes.add("Rust");
      languageVersion = "Rust latest";
      const cargoData = parseTOML(content);

      // Collect dependencies
      if (cargoData && cargoData.dependencies) {
        Object.entries(cargoData.dependencies).forEach(([pkg, ver]) => {
          if (typeof ver === "string") dependencies.add(`${pkg}=${ver}`);
          else if (ver.version) dependencies.add(`${pkg}=${ver.version}`);
        });
      }
    } else if (lowerFileName.endsWith(".swift")) {
      // Swift project
      projectTypes.add("Swift");
      if (!languageVersion) languageVersion = "Swift latest";
    } else if (lowerFileName.endsWith("package.swift")) {
      // Swift Package Manager
      projectTypes.add("Swift");
      if (!languageVersion) languageVersion = "Swift latest";
      // Parse Package.swift to get dependencies
      const depMatches = content.match(
        /\.package\(url:\s*['"](.+?)['"],\s*(?:from:|exact:)\s*['"](.+?)['"]\)/g
      );
      if (depMatches) {
        depMatches.forEach((line) => {
          const match = line.match(
            /\.package\(url:\s*['"](.+?)['"],\s*(?:from:|exact:)\s*['"](.+?)['"]\)/
          );
          if (match) {
            const url = match[1];
            const ver = match[2];
            dependencies.add(`${url}@${ver}`);
          }
        });
      }
    } else if (
      lowerFileName.endsWith(".xcodeproj") ||
      lowerFileName.endsWith(".xcworkspace") ||
      lowerFileName.endsWith("info.plist") ||
      lowerFileName.endsWith("project.pbxproj")
    ) {
      projectTypes.add("iOS");
      if (!languageVersion) languageVersion = "Swift latest";
      osRequirements.add("macOS");
      notes += "iOS projects require macOS to build.\n";
    } else if (
      lowerFileName.endsWith("podfile") ||
      lowerFileName.endsWith("podfile.lock")
    ) {
      projectTypes.add("iOS");
      if (!languageVersion) languageVersion = "Swift latest";
      osRequirements.add("macOS");
      notes += "iOS projects require macOS to build.\n";
      // Parse Podfile to get dependencies
      const podMatches = content.match(
        /pod ['"]([\w\/\-]+)['"](?:,\s*['"]([\S]+)['"])?/g
      );
      if (podMatches) {
        podMatches.forEach((line) => {
          const match = line.match(
            /pod ['"]([\w\/\-]+)['"](?:,\s*['"]([\S]+)['"])?/
          );
          if (match) {
            const pod = match[1];
            const ver = match[2] || "latest";
            dependencies.add(`${pod}@${ver}`);
          }
        });
      }
    } else if (lowerFileName.endsWith("pubspec.yaml")) {
      // Dart/Flutter project
      projectTypes.add("Dart/Flutter");
      const pubspecData = parseYAML(content);
      if (
        pubspecData &&
        pubspecData.environment &&
        pubspecData.environment.sdk
      ) {
        languageVersion = `Dart ${pubspecData.environment.sdk}`;
      }

      // Collect dependencies
      const deps = pubspecData.dependencies || {};
      Object.entries(deps).forEach(([dep, version]) =>
        dependencies.add(`${dep}:${version}`)
      );
    }

    // Extract environment variables from code files
    if (
      [
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".py",
        ".rb",
        ".php",
        ".sh",
        ".pl",
        ".go",
        ".rs",
        ".swift",
      ].some((ext) => lowerFileName.endsWith(ext))
    ) {
      extractEnvVariablesFromCode(content);
    }
  }

  return {
    projectTypes,
    languageVersion,
    dependencies,
    osRequirements,
    environmentVariables,
    ports,
    notes,
  };
}

export function generateDockerfile(
  projectTypes: Set<string>,
  languageVersion: string,
  dependencies: Set<string>,
  osRequirements: Set<string>,
  environmentVariables: Set<string>,
  ports: Set<number>,
  notes: string
): string {
  let dockerfile = "# Development Dockerfile\n\n";

  // Base image selection
  if (projectTypes.has("Node.js")) {
    dockerfile += `FROM node:${languageVersion.replace(
      "Node.js ",
      ""
    )}-alpine\n\n`;
  } else if (projectTypes.has("Python")) {
    dockerfile += `FROM python:${languageVersion.replace(
      "Python ",
      ""
    )}-alpine\n\n`;
  } else if (projectTypes.has("Java") || projectTypes.has("Android")) {
    dockerfile += `FROM openjdk:${languageVersion.replace(
      "Java ",
      ""
    )}-alpine\n\n`;
  } else if (projectTypes.has("Go")) {
    dockerfile += `FROM golang:${languageVersion.replace(
      "Go ",
      ""
    )}-alpine\n\n`;
  } else if (projectTypes.has("Ruby")) {
    dockerfile += `FROM ruby:${languageVersion.replace(
      "Ruby ",
      ""
    )}-alpine\n\n`;
  } else if (projectTypes.has("PHP")) {
    dockerfile += `FROM php:${languageVersion.replace("PHP ", "")}-alpine\n\n`;
  } else if (projectTypes.has(".NET")) {
    dockerfile += `FROM mcr.microsoft.com/dotnet/sdk:${languageVersion.replace(
      ".NET ",
      ""
    )}-alpine\n\n`;
  } else if (projectTypes.has("Rust")) {
    dockerfile += `FROM rust:${languageVersion.replace(
      "Rust ",
      ""
    )}-alpine\n\n`;
  } else if (projectTypes.has("Swift") || projectTypes.has("iOS")) {
    // Note: Swift doesn't have official Alpine images, so we'll use the slim version
    dockerfile += `FROM swift:${languageVersion.replace(
      "Swift ",
      ""
    )}-slim\n\n`;
  } else if (projectTypes.has("Dart/Flutter")) {
    // Note: Dart/Flutter doesn't have official Alpine images
    dockerfile += `FROM dart:${languageVersion.replace("Dart ", "")}\n\n`;
  } else {
    dockerfile += "FROM alpine:latest\n\n";
  }

  // Install basic utilities
  dockerfile += "RUN apk add --no-cache git\n\n";

  // Set working directory
  dockerfile += "WORKDIR /app\n\n";

  // Clone the repository
  //dockerfile += `# Clone the repository\n`;
  // dockerfile += `RUN git clone ${repoUrl} .\n\n`;

  // Install project-specific dependencies
  if (projectTypes.has("Node.js")) {
    dockerfile += "# Install Node.js dependencies\n";
    dockerfile += "RUN npm install\n";
    if (projectTypes.has("React Native") || projectTypes.has("Expo")) {
      dockerfile += "RUN npm install -g expo-cli\n";
    }
  } else if (projectTypes.has("Python")) {
    dockerfile += "# Install Python dependencies\n";
    dockerfile += "RUN pip install -r requirements.txt\n";
  } else if (projectTypes.has("Java") || projectTypes.has("Android")) {
    if (projectTypes.has("Android")) {
      dockerfile += "# Install Android SDK\n";
      dockerfile += "RUN apk add --no-cache android-tools\n";
    }
    if (fs.existsSync("pom.xml")) {
      dockerfile += "# Install Maven dependencies\n";
      dockerfile += "RUN mvn install\n";
    } else if (fs.existsSync("build.gradle")) {
      dockerfile += "# Install Gradle dependencies\n";
      dockerfile += "RUN gradle build\n";
    }
  } else if (projectTypes.has("Go")) {
    dockerfile += "# Download Go dependencies\n";
    dockerfile += "RUN go mod download\n";
  } else if (projectTypes.has("Ruby")) {
    dockerfile += "# Install Ruby dependencies\n";
    dockerfile += "RUN bundle install\n";
  } else if (projectTypes.has("PHP")) {
    dockerfile += "# Install PHP dependencies\n";
    dockerfile += "RUN composer install\n";
  } else if (projectTypes.has(".NET")) {
    dockerfile += "# Restore .NET dependencies\n";
    dockerfile += "RUN dotnet restore\n";
  } else if (projectTypes.has("Rust")) {
    dockerfile += "# Build Rust project\n";
    dockerfile += "RUN cargo build\n";
  } else if (projectTypes.has("Swift") || projectTypes.has("iOS")) {
    dockerfile += "# Resolve Swift package dependencies\n";
    dockerfile += "RUN swift package resolve\n";
  } else if (projectTypes.has("Dart/Flutter")) {
    dockerfile += "# Get Flutter dependencies\n";
    dockerfile += "RUN flutter pub get\n";
  }
  dockerfile += "\n";

  // Expose ports
  if (ports.size > 0) {
    dockerfile += "# Expose ports\n";
    ports.forEach((port) => {
      dockerfile += `EXPOSE ${port}\n`;
    });
    dockerfile += "\n";
  }

  // Add notes as comments
  if (notes) {
    dockerfile += "# Notes:\n";
    notes.split("\n").forEach((note) => {
      if (note.trim()) {
        dockerfile += `# ${note.trim()}\n`;
      }
    });
    dockerfile += "\n";
  }

  // Create a script to generate .env file
  dockerfile += "# Create script to generate .env file\n";
  dockerfile += "RUN echo '#!/bin/sh' > /app/generate_env.sh && \\\n";
  dockerfile +=
    "    echo 'env | grep -v \"^_\" > .env' >> /app/generate_env.sh && \\\n";
  dockerfile += "    chmod +x /app/generate_env.sh\n\n";

  // Set the entrypoint
  dockerfile += "# Set the entrypoint\n";
  if (projectTypes.has("Node.js")) {
    if (projectTypes.has("React Native") || projectTypes.has("Expo")) {
      dockerfile +=
        'ENTRYPOINT ["/bin/sh", "-c", "/app/generate_env.sh && expo start --web"]\n';
    } else {
      dockerfile +=
        'ENTRYPOINT ["/bin/sh", "-c", "/app/generate_env.sh && npm start"]\n';
    }
  } else {
    dockerfile +=
      'ENTRYPOINT ["/bin/sh", "-c", "/app/generate_env.sh && echo \'Development environment is ready. Run your specific development commands here.\'"]\n';
  }

  return dockerfile;
}

interface ProjectAnalysis {
  projectType: string[];
  languageVersions: Record<string, string>;
  dependencies: string[];
  dockerfile: string;
  osRequirements: string[];
  ports: number[];
  environmentVariables: string[];
  notes: string;
}

export async function analyzeProjectAndGenerateDockerfile(
  files: Record<string, string>
): Promise<ProjectAnalysis> {
  const {
    projectTypes,
    languageVersion,
    dependencies,
    osRequirements,
    environmentVariables,
    ports,
    notes,
  } = await analyzeProject(files);

  const dockerfile = generateDockerfile(
    projectTypes,
    languageVersion,
    dependencies,
    osRequirements,
    environmentVariables,
    ports,
    notes
  );

  // Parse language and version
  const [language, version] = languageVersion.split(" ");

  return {
    projectType: Array.from(projectTypes),
    languageVersions: { [language]: version },
    dependencies: Array.from(dependencies),
    dockerfile: dockerfile,
    osRequirements: Array.from(osRequirements),
    ports: Array.from(ports),
    environmentVariables: Array.from(environmentVariables),
    notes: notes,
  };
}
// Usage example:
// const files = await readRepopack("path/to/repopack.txt");
// const dockerfile = await analyzeProjectAndGenerateDockerfile(files);
// console.log(dockerfile);
