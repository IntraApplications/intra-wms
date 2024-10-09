import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { spawn } from "child_process";
import crypto from "crypto";
import { githubApp } from "@/lib/github";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic AI client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
});

// Define an interface for Docker build steps
interface DockerBuildStep {
  type: "overall" | "dockerfile"; // Type of step: overall process or specific Dockerfile command
  step: number; // Current step number
  total: number; // Total number of steps
  command: string; // Command being executed
  humanReadable?: string; // Optional human-readable description
}

// Function to parse a line of Docker build output into a DockerBuildStep object
const parseDockerBuildStep = (line: string): DockerBuildStep | null => {
  // Try to match standard Docker build output, e.g., "Step 1/5 : FROM node:14-alpine"
  const overallMatch = line.match(/Step (\d+)\/(\d+)\s*:\s*(.*)/);
  if (overallMatch) {
    return {
      type: "overall",
      step: parseInt(overallMatch[1]),
      total: parseInt(overallMatch[2]),
      command: overallMatch[3].trim(),
    };
  }

  // Try to match Docker BuildKit output, e.g., "#1 [2/3] RUN npm install"
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

  // If line doesn't match any known patterns, return null
  return null;
};

function generateGithubUrlWithToken(repoUrl: string, token: string) {
  console.log("TESTTT");
  console.log(repoUrl);
  const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\.git/);
  if (!urlParts || urlParts.length < 3) {
    throw new Error("Invalid GitHub repository URL");
  }

  const owner = urlParts[1];
  const repo = urlParts[2];

  return `https://x-access-token:${token}@github.com/${owner.toLowerCase()}/${repo.toLowerCase()}.git`;
}

// Initialize a cache to store explanations for build output lines
const explanationCache = new Map<string, string>();

// Function to get a human-readable explanation for a line of Docker build output
const getHumanReadableExplanation = async (text: string): Promise<string> => {
  // If text is empty or whitespace, return a default message
  if (!text.trim()) {
    return "No build output to summarize";
  }

  // Check if explanation is already in cache
  if (explanationCache.has(text)) {
    return explanationCache.get(text)!;
  }

  try {
    // Use Anthropic AI to generate a human-readable explanation
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", // Specify the AI model to use
      max_tokens: 50, // Limit the response length
      temperature: 0, // Set temperature for deterministic output
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

    // Extract the explanation text from the response
    const explanation =
      message.content?.[0]?.text || "No explanation available.";

    // Store the explanation in the cache
    explanationCache.set(text, explanation.trim());

    return explanation.trim();
  } catch (error) {
    // Log any errors and return a default error message
    console.error("Error fetching explanation:", error);
    return "Error generating explanation.";
  }
};

// Function to execute a shell command and process its output
const executeCommand = (
  command: string, // Command to execute
  args: string[], // Arguments for the command
  options: { [key: string]: any } = {}, // Additional options
  sendUpdate: (step: DockerBuildStep) => void // Callback to send updates
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`Executing command: ${command} ${args.join(" ")}`);
    // Spawn a child process to execute the command
    const proc = spawn(command, args, { shell: true, ...options });
    let buffer = ""; // Buffer to accumulate output data

    // Function to process a single line of output
    const processLine = async (line: string) => {
      // Try to parse the line into a DockerBuildStep
      const step = parseDockerBuildStep(line);
      if (step) {
        // If parsed successfully, get a human-readable explanation
        step.humanReadable = await getHumanReadableExplanation(line);
        // Send the step update
        sendUpdate(step);
      } else if (line.trim()) {
        // If line is non-empty but not parsed as a step, get an explanation
        const humanReadable = await getHumanReadableExplanation(line);
        // Send an update with step set to -1 indicating an unparsed line
        sendUpdate({
          type: "overall",
          step: -1,
          total: -1,
          command: "",
          humanReadable,
        });
      }
    };

    // Handler for data events (both stdout and stderr)
    const handleData = async (data: Buffer) => {
      const text = data.toString(); // Convert buffer to string
      console.log(text); // Log output for debugging
      buffer += text; // Append to buffer
      const lines = buffer.split("\n"); // Split buffer into lines
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      // Process each complete line
      for (const line of lines) {
        await processLine(line);
      }
    };

    // Attach handlers to stdout and stderr
    proc.stdout.on("data", handleData);
    proc.stderr.on("data", handleData);

    // Handle process errors
    proc.on("error", (error) => {
      console.error("ERRORRRR");
      console.error(error);
      reject(error);
    });

    // Handle process close event
    proc.on("close", async (code) => {
      // Process any remaining data in buffer

      console.log("CLOSEEEEE");
      if (buffer) {
        await processLine(buffer);
      }
      if (code === 0) {
        resolve(); // Command executed successfully
      } else {
        reject(new Error(`Command failed with exit code ${code}`)); // Command failed
      }
    });

    // If input is provided in options, write it to stdin
    if (options.input) {
      proc.stdin.write(options.input);
      proc.stdin.end();
    }
  });
};

// Handler for GET requests
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder(); // Encoder for sending data over the stream
  const stream = new ReadableStream({
    async start(controller) {
      // Function to send updates to the client
      const sendUpdate = (step: DockerBuildStep) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(step)}\n\n`));
      };

      try {
        // Create Supabase client for database interactions
        const supabase = createClient();
        // Get the authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // If user is not authenticated, throw an error
          throw new Error("Not authenticated. Please log in and try again.");
        }

        // Fetch workspace data from the database
        const { data: workspaceData, error: workspaceError } = await supabase
          .from("workspaces")
          .select("id, github_app_installation_id, github_org_name")
          .single();

        if (workspaceError || !workspaceData?.github_app_installation_id) {
          // If workspace data is missing or GitHub is not connected, throw an error
          throw new Error(
            "GitHub is not connected. Please connect your GitHub account and try again."
          );
        }

        // Get the GitHub App installation ID
        const installationId = workspaceData.github_app_installation_id;
        // Get an authenticated Octokit client for the GitHub App installation
        const octokit = await githubApp.getInstallationOctokit(
          Number(installationId)
        );
        // Authenticate and get the installation token
        const auth = await octokit.auth({ type: "installation" });

        // Extract query parameters from the request URL
        const { searchParams } = new URL(request.url);
        const dockerfileContent = searchParams.get("dockerfileContent"); // Dockerfile content
        const repositoryName = searchParams.get("repositoryName"); // Repository name
        const repositoryURL = searchParams.get("repositoryURL"); // Repository name
        const environmentVariablesParam = searchParams.get(
          "environmentVariables"
        ); // Environment variables as JSON string

        if (
          !dockerfileContent ||
          !repositoryName ||
          !environmentVariablesParam
        ) {
          // If required parameters are missing, throw an error
          throw new Error(
            "Missing Dockerfile content, repository name, or environment variables. Please provide all required information."
          );
        }

        // Parse the environmentVariables JSON string back into an array
        let environmentVariables: string[] = [];
        try {
          environmentVariables = JSON.parse(environmentVariablesParam);
          if (!Array.isArray(environmentVariables)) {
            throw new Error("environmentVariables is not an array");
          }
        } catch (error) {
          // If parsing fails, throw an error
          throw new Error(
            "Invalid environmentVariables format. Must be a JSON array."
          );
        }
        // Generate a unique tag for the Docker image
        const uniqueTag = crypto.randomBytes(8).toString("hex");
        // Construct the full image name, e.g., ghcr.io/org_name/repo_name:tag
        const imageName = `ghcr.io/${workspaceData.github_org_name.toLowerCase()}/${repositoryName.toLowerCase()}:${uniqueTag}`;

        // Send initial update indicating the start of the process
        sendUpdate({
          type: "overall",
          step: 0,
          total: 4,
          command: "Starting the pod creation process...",
        });

        // Step 1: Log into the Docker registry
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
            "ghcr.io", // GitHub Container Registry
            "-u",
            "intraapplications-github-appp", // Username (GitHub App)
            "--password-stdin", // Read password (token) from stdin
          ],
          { input: process.env.NEXT_PUBLIC_GHCR_TOKEN }, // Provide token as input
          sendUpdate // Callback to send updates
        );

        // Step 2: Build the Docker image
        sendUpdate({
          type: "overall",
          step: 2,
          total: 4,
          command: "Building Docker image...",
        });

        const buildArgs: string[] = [];
        for (const envVar of environmentVariables) {
          const [key, value] = envVar.split("=");
          // Use single quotes to wrap the value and escape any single quotes in the value
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
          ], // Include build arguments
          {
            input: dockerfileContent, // Dockerfile content as input
            env: { ...process.env, DOCKER_BUILDKIT: "1" }, // Enable BuildKit
          },
          sendUpdate // Callback to send updates
        );

        // Step 3: Push the image to the registry
        sendUpdate({
          type: "overall",
          step: 3,
          total: 4,
          command: "Pushing Docker image to registry...",
        });
        await executeCommand(
          "docker",
          ["push", imageName], // Push the image to the registry
          {},
          sendUpdate // Callback to send updates
        );

        // Step 4: Process finished successfully
        sendUpdate({
          type: "overall",
          step: 4,
          total: 4,
          command: "Pod creation process finished successfully!",
        });
      } catch (error) {
        // Handle any errors that occurred during the process
        console.error("Error in GHCR process:", error);
        // Send an error message to the client
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "An error occurred during the pod creation process.",
            })}\n\n`
          )
        );
      } finally {
        // Send a final message indicating the end of the stream
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "end" })}\n\n`)
        );
        controller.close(); // Close the stream
      }
    },
    cancel() {
      // Handle cancellation if needed (not implemented)
    },
  });

  // Return a Response with the stream, setting headers for Server-Sent Events
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream", // Set content type for SSE
      "Cache-Control": "no-cache", // Disable caching
      Connection: "keep-alive", // Keep the connection alive
    },
  });
}
