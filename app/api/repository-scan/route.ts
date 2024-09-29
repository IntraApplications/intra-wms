import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { promises as fs } from "fs";
import os from "os";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const { repositoryURL } = await request.json();
  const supabase = createClient();
  let tempDir;

  try {
    // Authenticate the user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "repopack-"));

    // Define the output file path
    // Define ignore patterns
    const includePatterns = `
  package.json,yarn.lock,pnpm-lock.yaml,.babelrc,tsconfig.json,metro.config.js,app.json,expo.json,android/app/build.gradle,ios/Podfile,index.js,App.js,requirements.txt,Pipfile,pyproject.toml,tox.ini,setup.py,wsgi.py,go.mod,go.sum,Cargo.toml,Cargo.lock,composer.json,composer.lock,build.gradle,settings.gradle,pom.xml,mvnw,mvnw.cmd,.mvn/wrapper/maven-wrapper.properties,src/main/resources/application.yml,src/main/resources/application.properties,src/main/resources/logback.xml,Dockerfile,docker-compose.yml,.dockerignore,.env,.env.production,.env.development,.env.local,.env.test,.gitlab-ci.yml,.travis.yml,circle.yml,Jenkinsfile,.github/workflows/*.yml,terraform.tf,terraform.tfvars,terragrunt.hcl,cloudformation.yml,cloudformation.json,nx.json,lerna.json,next.config.js,gatsby-config.js,vue.config.js,nuxt.config.js,angular.json,capacitor.config.json,Makefile,CMakeLists.txt,webpack.config.js,rollup.config.js,vite.config.js
    `;

    // Run repopack and capture the output
    const { stderr } = await execAsync(
      `npx repopack --remote ${repositoryURL} --output repopack-output.xml --include "${includePatterns}"`,
      { cwd: tempDir }
    );

    if (stderr) {
      return NextResponse.json(
        {
          error: "Failed to analyze repository",
          details: stderr,
        },
        { status: 500 }
      );
    }

    const outputPath = path.join(tempDir, "repopack-output.xml");
    const mergedRepositoryFile = await fs.readFile(outputPath, "utf-8");

    return NextResponse.json({ mergedRepositoryFile });
  } catch (error) {
    console.error("Error processing repository:", error);
    return NextResponse.json(
      {
        error: "Failed to process repository",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error("Error cleaning up temporary directory:", cleanupError);
      }
    }
  }
}
