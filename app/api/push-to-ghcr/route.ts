import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { spawn } from "child_process";
import crypto from "crypto";
import { githubApp } from "@/lib/github";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
});

interface DockerBuildStep {
  type: "overall" | "dockerfile";
  step: number;
  total: number;
  command: string;
  humanReadable?: string;
}

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

const explanationCache = new Map<string, string>();

const getHumanReadableExplanation = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return "No build output to summarize";
  }

  if (explanationCache.has(text)) {
    return explanationCache.get(text)!;
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 50,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `Summarize the Docker build output using a brief, descriptive phrase instead of a full sentence. For example: 'Installing dependencies', 'Copying files', 'Setting environment variables'. NOTE: ONLY SEND THE DESCRIPTION BACK, NO EXPLANATION. For example:

ERROR: failed to solve: process "/bin/sh -c npm install -g expo-cli" did not complete successfully: exit code: 254

should return something like 'Unable to install npm dependencies'.

Docker Build Output:
${text}`,
        },
      ],
    });

    const explanation =
      message.content?.[0]?.text || "No explanation available.";

    explanationCache.set(text, explanation.trim());

    return explanation.trim();
  } catch (error) {
    console.error("Error fetching explanation:", error);
    return "Error generating explanation.";
  }
};

const executeCommand = (
  command: string,
  args: string[],
  options: { [key: string]: any } = {},
  sendUpdate: (step: DockerBuildStep) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { shell: true, ...options });
    let buffer = "";

    const processLine = async (line: string) => {
      const step = parseDockerBuildStep(line);
      if (step) {
        step.humanReadable = await getHumanReadableExplanation(line);
        sendUpdate(step);
      } else if (line.trim()) {
        const humanReadable = await getHumanReadableExplanation(line);
        sendUpdate({
          type: "overall",
          step: -1,
          total: -1,
          command: "",
          humanReadable,
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

        if (!dockerfileContent || !repositoryName) {
          throw new Error(
            "Missing Dockerfile content or repository name. Please provide all required information."
          );
        }

        const uniqueTag = crypto.randomBytes(8).toString("hex");
        const imageName = `ghcr.io/${workspaceData.github_org_name.toLowerCase()}/${repositoryName.toLowerCase()}:${uniqueTag}`;

        sendUpdate({
          type: "overall",
          step: 0,
          total: 4,
          command: "Starting the pod creation process...",
        });

        sendUpdate({
          type: "overall",
          step: 1,
          total: 4,
          command: "Logging into Docker registry...",
        });
        await executeCommand(
          "docker",
          [
            "login",
            "ghcr.io",
            "-u",
            "intraapplications-github-app",
            "--password-stdin",
          ],
          { input: auth.token },
          sendUpdate
        );

        sendUpdate({
          type: "overall",
          step: 2,
          total: 4,
          command: "Building Docker image...",
        });
        await executeCommand(
          "docker",
          ["build", "-t", imageName, "-"],
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
        });
        await executeCommand("docker", ["push", imageName], {}, sendUpdate);

        sendUpdate({
          type: "overall",
          step: 4,
          total: 4,
          command: "Pod creation process finished successfully!",
        });
      } catch (error) {
        console.error("Error in GHCR process:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "An error occurred during the pod creation process.",
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
