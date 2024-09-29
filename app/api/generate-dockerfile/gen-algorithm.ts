// app/api/claude-analyze/analyzeScript.ts
import fs from "fs";
import yaml from "js-yaml";
import xml2js from "xml2js";
import toml from "@iarna/toml";

export async function readRepopack(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const files: Record<string, string> = {};

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
    projectTypes: Array.from(projectTypes),
    languageVersion,
    dependencies: Array.from(dependencies),
    osRequirements: Array.from(osRequirements),
    environmentVariables: Array.from(environmentVariables),
    ports: Array.from(ports).map(Number),
    notes: notes.trim(),
  };
}

export function generateDockerfile(
  analysis: Awaited<ReturnType<typeof analyzeProject>>,
  files: Record<string, string>
) {
  const {
    projectTypes,
    languageVersion,
    dependencies,
    osRequirements,
    environmentVariables,
    ports,
  } = analysis;
  let dockerfileContent = "";
  let additionalNotes = ""; // Local variable to collect notes
  const baseImages = {
    "Node.js": "node",
    Python: "python",
    Java: "openjdk",
    Ruby: "ruby",
    PHP: "php",
    Go: "golang",
    ".NET": "mcr.microsoft.com/dotnet/sdk",
    Rust: "rust",
    "Dart/Flutter": "cirrusci/flutter",
    Swift: "swift",
  };

  if (projectTypes.length === 1) {
    const projectType = projectTypes[0];
    switch (projectType) {
      case "Node.js":
        {
          // Extract the exact Node.js version
          let nodeVersion =
            languageVersion.replace("Node.js ", "").trim() || "latest";

          // Clean version string
          nodeVersion = nodeVersion.replace(/[^\d.]/g, "");
          if (!nodeVersion) {
            nodeVersion = "latest";
          }

          const baseImage = `${baseImages["Node.js"]}:${nodeVersion}-alpine`;

          dockerfileContent += `FROM ${baseImage}\n`;
          dockerfileContent += "WORKDIR /app\n";

          // Copy package.json and lock files
          dockerfileContent += "COPY package*.json ./\n";
          if (files["yarn.lock"]) {
            dockerfileContent += "COPY yarn.lock ./\n";
          } else if (files["package-lock.json"]) {
            dockerfileContent += "COPY package-lock.json ./\n";
          } else if (files["pnpm-lock.yaml"]) {
            dockerfileContent += "COPY pnpm-lock.yaml ./\n";
          }

          // Install dependencies using the exact versions from lock files
          if (files["yarn.lock"]) {
            dockerfileContent += "RUN yarn install --frozen-lockfile\n";
          } else if (files["pnpm-lock.yaml"]) {
            dockerfileContent +=
              "RUN npm install -g pnpm && pnpm install --frozen-lockfile\n";
          } else {
            dockerfileContent += "RUN npm ci\n";
          }

          dockerfileContent += "COPY . .\n";

          if (
            projectTypes.includes("React") ||
            projectTypes.includes("Next.js")
          ) {
            dockerfileContent += "\n# Build the frontend\n";
            if (files["yarn.lock"]) {
              dockerfileContent += "RUN yarn build\n";
            } else if (files["pnpm-lock.yaml"]) {
              dockerfileContent += "RUN pnpm run build\n";
            } else {
              dockerfileContent += "RUN npm run build\n";
            }
          }

          ports.forEach((port) => {
            dockerfileContent += `EXPOSE ${port}\n`;
          });

          if (projectTypes.includes("Next.js")) {
            dockerfileContent += 'CMD ["npm", "start"]\n';
          } else if (
            projectTypes.includes("React Native") ||
            projectTypes.includes("Expo")
          ) {
            additionalNotes +=
              "Building React Native and Expo apps requires additional setup and may not fully work in Docker.\n";
            dockerfileContent += 'CMD ["npm", "start"]\n';
          } else {
            dockerfileContent += 'CMD ["node", "index.js"]\n';
          }
        }
        break;

      case "Python":
        {
          // Extract the exact Python version
          let pythonVersion =
            languageVersion.replace("Python ", "").trim() || "latest";

          const baseImage = `${baseImages["Python"]}:${pythonVersion}-slim`;

          dockerfileContent += `FROM ${baseImage}\n`;
          dockerfileContent += "WORKDIR /app\n";

          if (files["requirements.txt"]) {
            dockerfileContent += "COPY requirements.txt ./\n";
            dockerfileContent +=
              "RUN pip install --no-cache-dir -r requirements.txt\n";
          } else if (files["Pipfile"]) {
            dockerfileContent += "COPY Pipfile* ./\n";
            dockerfileContent +=
              "RUN pip install pipenv && pipenv install --system --deploy\n";
          } else if (files["pyproject.toml"]) {
            dockerfileContent += "COPY pyproject.toml poetry.lock ./\n";
            dockerfileContent +=
              "RUN pip install poetry && poetry install --no-dev --no-interaction --no-ansi\n";
          }

          dockerfileContent += "COPY . .\n";

          ports.forEach((port) => {
            dockerfileContent += `EXPOSE ${port}\n`;
          });

          dockerfileContent += 'CMD ["python", "app.py"]\n';
        }
        break;

      case "Swift":
        {
          let swiftVersion =
            languageVersion.replace("Swift ", "").trim() || "latest";
          const baseImage = `${baseImages["Swift"]}:${swiftVersion}`;

          dockerfileContent += `FROM ${baseImage}\n`;
          dockerfileContent += "WORKDIR /app\n";

          if (files["Package.swift"]) {
            dockerfileContent += "COPY Package.swift ./\n";
            dockerfileContent += "RUN swift package resolve\n";
          }

          dockerfileContent += "COPY . .\n";

          dockerfileContent += 'CMD ["swift", "run"]\n';
        }
        break;

      case "Android":
        {
          const baseImage = "openjdk:8-jdk";

          dockerfileContent += `FROM ${baseImage}\n`;
          dockerfileContent += "WORKDIR /app\n";
          dockerfileContent += "# Install Android SDK\n";
          dockerfileContent +=
            "RUN apt-get update && apt-get install -y wget unzip && rm -rf /var/lib/apt/lists/*\n";
          dockerfileContent +=
            "RUN wget https://dl.google.com/android/repository/commandlinetools-linux-6609375_latest.zip -O commandlinetools.zip \\\n";
          dockerfileContent += "  && mkdir -p /android-sdk/cmdline-tools \\\n";
          dockerfileContent +=
            "  && unzip commandlinetools.zip -d /android-sdk/cmdline-tools \\\n";
          dockerfileContent += "  && rm commandlinetools.zip\n";
          dockerfileContent += "ENV ANDROID_HOME /android-sdk\n";
          dockerfileContent +=
            "ENV PATH $PATH:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools\n";
          dockerfileContent += "RUN yes | sdkmanager --licenses\n";
          dockerfileContent +=
            'RUN sdkmanager "platform-tools" "platforms;android-28" "build-tools;28.0.3"\n';
          dockerfileContent += "COPY . .\n";
          dockerfileContent += "RUN ./gradlew build\n";
          additionalNotes +=
            "Note: Android projects require Android SDK and build tools.\n";
        }
        break;

      case "iOS":
        {
          additionalNotes +=
            "iOS projects require macOS to build and cannot be built in Docker containers on non-macOS hosts.\n";
        }
        break;

      default:
        additionalNotes += `No Dockerfile template available for project type: ${projectType}\n`;
        break;
    }
  } else {
    // Handle multiple project types
    additionalNotes +=
      "Multiple project types detected. Consider using Docker Compose or separate Dockerfiles for each service.\n";
  }

  return { dockerfileContent: dockerfileContent.trim(), additionalNotes };
}

export async function generateOutput(
  analysis: Awaited<ReturnType<typeof analyzeProject>>,
  dockerfileResult: ReturnType<typeof generateDockerfile>
) {
  const combinedNotes = [analysis.notes, dockerfileResult.additionalNotes]
    .filter(Boolean)
    .join("\n");

  console.log(dockerfileResult);
  return {
    projectType: analysis.projectTypes,
    languageVersion: analysis.languageVersion,
    dependencies: analysis.dependencies,
    dockerfile: dockerfileResult.dockerfileContent,
    osRequirements: analysis.osRequirements,
    ports: analysis.ports,
    environmentVariables: analysis.environmentVariables,
    notes: combinedNotes,
  };
}
