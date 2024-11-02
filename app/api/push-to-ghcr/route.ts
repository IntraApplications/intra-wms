import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { spawn } from "child_process";
import crypto from "crypto";
import { githubApp } from "@/lib/github";

// Pre-generated human-readable messages
const humanReadableMessages = {
  init: "Initializing workspace",
  login: "Logging into Docker registry",
  build: "Building Docker image",
  push: "Pushing workspace to registry",
  complete: "Workspace ready!",
};

// Define an interface for Docker build steps
interface DockerBuildStep {
  type: "overall" | "dockerfile";
  step: number;
  total: number;
  command: string;
  humanReadable?: string;
}

// Function to parse a line of Docker build output into a DockerBuildStep object
const parseDockerBuildStep = (line: string): DockerBuildStep | null => {
  const overallMatch = line.match(/Step (\d+)\/(\d+)\s*:\s*(.*)/);
  if (overallMatch) {
    return {
      type: "overall",
      step: parseInt(overallMatch[1]),
      total: parseInt(overallMatch[2]),
      command: overallMatch[3].trim(),
    };
  }

  const dockerfileMatch = line.match(
    /^\s*#(\d+)\s+\[(\d+)\/(\d+)\]\s+(\w+)\s+(.*)$/
  );
  if (dockerfileMatch) {
    return {
      type: "dockerfile",
      step: parseInt(dockerfileMatch[2]),
      total: parseInt(dockerfileMatch[3]),
      command: `${dockerfileMatch[4]} ${dockerfileMatch[5]}`.trim(),
    };
  }

  return null;
};

function generateGithubUrlWithToken(repoUrl: string, token: string) {
  const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\.git/);
  if (!urlParts || urlParts.length < 3) {
    throw new Error("Invalid GitHub repository URL");
  }

  const owner = urlParts[1];
  const repo = urlParts[2];

  return `https://x-access-token:${token}@github.com/${owner.toLowerCase()}/${repo.toLowerCase()}.git`;
}

// Function to execute a shell command and process its output
const executeCommand = (
  command: string,
  args: string[],
  options: { [key: string]: any } = {},
  sendUpdate: (step: DockerBuildStep) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`Executing command: ${command} ${args.join(" ")}`);
    const proc = spawn(command, args, { shell: true, ...options });
    let buffer = "";

    const processLine = async (line: string) => {
      const step = parseDockerBuildStep(line);
      if (step) {
        step.humanReadable = humanReadableMessages[step.type] || "Processing";
        sendUpdate(step);
      } else if (line.trim()) {
        sendUpdate({
          type: "overall",
          step: -1,
          total: -1,
          command: "",
          humanReadable: "Processing",
        });
      }
    };

    const handleData = async (data: Buffer) => {
      const text = data.toString();
      console.log(text);
      buffer += text;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        await processLine(line);
      }
    };

    proc.stdout.on("data", handleData);
    proc.stderr.on("data", handleData);

    proc.on("error", (error) => {
      console.error("Error:", error);
      reject(error);
    });

    proc.on("close", async (code) => {
      if (buffer) {
        await processLine(buffer);
      }
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    if (options.input) {
      proc.stdin.write(options.input);
      proc.stdin.end();
    }
  });
};

// Handler for GET requests
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (step: DockerBuildStep) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(step)}\n\n`));
      };

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated. Please log in and try again.");
        }

        const { data: workspaceData, error: workspaceError } = await supabase
          .from("workspaces")
          .select("id, github_app_installation_id, github_org_name")
          .single();

        if (workspaceError || !workspaceData?.github_app_installation_id) {
          throw new Error(
            "GitHub is not connected. Please connect your GitHub account and try again."
          );
        }

        const installationId = workspaceData.github_app_installation_id;
        const octokit = await githubApp.getInstallationOctokit(
          Number(installationId)
        );
        const auth = await octokit.auth({ type: "installation" });

        const { searchParams } = new URL(request.url);
        const dockerfileContent = searchParams.get("dockerfileContent");
        const repositoryName = searchParams.get("repositoryName");
        const repositoryURL = searchParams.get("repositoryURL");
        const environmentVariablesParam = searchParams.get(
          "environmentVariables"
        );

        if (
          !dockerfileContent ||
          !repositoryName ||
          !environmentVariablesParam
        ) {
          throw new Error(
            "Missing required information. Please provide all required data."
          );
        }

        let environmentVariables: string[] = [];
        try {
          environmentVariables = JSON.parse(environmentVariablesParam);
          if (!Array.isArray(environmentVariables)) {
            throw new Error("environmentVariables is not an array");
          }
        } catch (error) {
          throw new Error(
            "Invalid environmentVariables format. Must be a JSON array."
          );
        }

        const uniqueTag = crypto.randomBytes(8).toString("hex");
        const imageName = `ghcr.io/${workspaceData.github_org_name.toLowerCase()}/${repositoryName.toLowerCase()}:${uniqueTag}`;

        sendUpdate({
          type: "overall",
          step: 0,
          total: 4,
          command: "Starting the workspace creation process...",
          humanReadable: humanReadableMessages.init,
        });

        sendUpdate({
          type: "overall",
          step: 1,
          total: 4,
          command: "Logging into Docker registry...",
          humanReadable: humanReadableMessages.login,
        });
        await executeCommand(
          "docker",
          [
            "login",
            "ghcr.io",
            "-u",
            "intraapplications-github-appp",
            "--password-stdin",
          ],
          { input: process.env.NEXT_PUBLIC_GHCR_TOKEN },
          sendUpdate
        );

        sendUpdate({
          type: "overall",
          step: 2,
          total: 4,
          command: "Building Docker image...",
          humanReadable: humanReadableMessages.build,
        });

        const buildArgs: string[] = [];
        for (const envVar of environmentVariables) {
          const [key, value] = envVar.split("=");
          const escapedValue = value?.replace(/'/g, "'\\''") ?? "";
          buildArgs.push("--build-arg", `INTRA_${key}='${escapedValue}'`);
        }

        await executeCommand(
          "docker",
          [
            "build",
            "-t",
            imageName,
            generateGithubUrlWithToken(repositoryURL, auth.token),
            ...buildArgs,
          ],
          {
            input: dockerfileContent,
            env: { ...process.env, DOCKER_BUILDKIT: "1" },
          },
          sendUpdate
        );

        sendUpdate({
          type: "overall",
          step: 3,
          total: 4,
          command: "Pushing Docker image to registry...",
          humanReadable: humanReadableMessages.push,
        });
        await executeCommand("docker", ["push", imageName], {}, sendUpdate);

        sendUpdate({
          type: "overall",
          step: 4,
          total: 4,
          command: "Workspace creation process finished successfully!",
          humanReadable: humanReadableMessages.complete,
        });
      } catch (error) {
        console.error("Error in workspace creation process:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "An error occurred during the workspace creation process.",
            })}\n\n`
          )
        );
      } finally {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "end" })}\n\n`)
        );
        controller.close();
      }
    },
    cancel() {
      // Handle cancellation if needed
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
