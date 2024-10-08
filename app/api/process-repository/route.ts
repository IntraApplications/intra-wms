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

    const ignorePatterns = [
      // Logs
      "**/*.log",

      ".tamagui/",

      "assets/animations/test.json",

      "tamagui-web.css",

      // Temporary files and directories
      "tmp/",
      "temp/",

      // Build outputs
      "build/",
      "dist/",
      "out/",
      "web-build/",

      // Dependency directories
      "node_modules/",
      "bower_components/",
      "jspm_packages/",
      "vendor/",

      // Version control
      ".git/",
      ".svn/",
      ".hg/",

      // IDE and editor files
      ".vscode/",
      ".idea/",
      "*.sublime-*",

      // OS generated files
      ".DS_Store",
      "Thumbs.db",

      // Test coverage output
      "coverage/",

      // Yarn and npm files
      ".yarn/",
      ".npm/",
      "yarn-error.log",
      "npm-debug.log",

      // Environment and secret files
      ".env",
      ".env.local",
      ".env.*.local",

      // Expo specific
      ".expo/",
      ".expo-shared/",
      "*.jks",
      "*.p8",
      "*.p12",
      "*.key",
      "*.mobileprovision",
      "*.orig.*",

      // Android specific
      "android/",

      // iOS specific
      "ios/",

      // Large asset files
      "**/*.mp4",
      "**/*.tiff",
      "**/*.avi",
      "**/*.flv",
      "**/*.mov",
      "**/*.wmv",

      // Miscellaneous
      "*.bak",
      "*.swp",
      "*.swo",
      "__tests__/",
      "test/",
      "tests/",
      "doc/",
      "docs/",
    ].join(",");

    // Run repopack with the ignore patterns
    const { stdout, stderr } = await execAsync(
      `npx repopack --remote ${repositoryURL} --output repopack-output.xml --ignore "${ignorePatterns}"`,
      { cwd: tempDir }
    );
    console.log("TESFDFDSFDSFSDFSDF");
    console.log(stdout);
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
