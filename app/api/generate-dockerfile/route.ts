import { NextRequest, NextResponse } from "next/server";
import { githubApp } from "@/lib/github";
import { createClient } from "@/lib/supabase/supabase-server";
import {
  analyzeProject,
  analyzeProjectAndGenerateDockerfile,
  generateDockerfile,
  generateOutput,
  readRepopack,
} from "./gen-algorithm";

// Commented out AI-related imports
// import OpenAI from "openai";
// import Anthropic from "@anthropic-ai/sdk";
// import { prompt } from "./prompt";

function parseRepopackContent(content: string): Record<string, string> {
  const files: Record<string, string> = {};
  const fileRegex =
    /={15,}\s*File:\s*(.*?)\s*={15,}\s*([\s\S]*?)(?=(?:\n={15,}\s*File:|\s*$))/g;
  let match;

  while ((match = fileRegex.exec(content)) !== null) {
    const filePath = match[1].trim();
    const fileContent = match[2].trim();
    files[filePath] = fileContent;
  }

  return files;
}

// Commented out AI-related initialization
// const anthropic = new Anthropic({
//   apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
// });

// const openai = new OpenAI({
//   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// });

// Commented out function to remove comments from JSON-like string
// const removeComments = (jsonString: string) => {
//   return jsonString
//     .replace(/\/\/.*$/gm, "")
//     .replace(/\/\*[\s\S]*?\*\//g, "")
//     .trim();
// };

export async function POST(request: NextRequest) {
  const { repositoryURL, mergedRepositoryFile } = await request.json();

  const supabase = createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: workspaceData, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id, github_app_installation_id, github_org_name")
      .single();

    if (workspaceError || !workspaceData?.github_app_installation_id) {
      return NextResponse.json(
        { error: "GitHub is not connected." },
        { status: 400 }
      );
    }

    const installationId = workspaceData.github_app_installation_id;
    const octokit = await githubApp.getInstallationOctokit(
      Number(installationId)
    );

    const auth = await octokit.auth({
      type: "installation",
    });

    const files = await readRepopack(mergedRepositoryFile);
    const dockerfile = await analyzeProjectAndGenerateDockerfile(files);

    console.log("TESTFDSF");
    console.log(dockerfile);

    // Add the remote repository URL to the Dockerfile

    return NextResponse.json(dockerfile);

    // Commented out AI-based analysis
    /*
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 8192,
      temperature: 0.2,
      system: prompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the following codebase information:\n\n${mergedRepositoryFile}, 
              also we are downloading the repo from the remote ${generateGithubUrlWithToken(
                repositoryURL,
                auth.token
              )}
               into the docker image, 
              rather then downloading from the path. so include this remote download in the docker file, and not the current directory

              Additionally, include the following in the Dockerfile to handle environment variables:
                1.  RUN echo '#!/bin/sh' > /app/generate_env.sh && \
                    echo 'env | grep INTRA_ > .env' >> /app/generate_env.sh && \
                    chmod +x /app/generate_env.sh
  
                2.  Set the entrypoint to run this script before starting the application:
                    ENTRYPOINT ["/bin/sh", "-c", "/app/generate_env.sh && {start_command}"]

              NOTE run the app in dev mode, for example, if its a next app, use 'npm run dev' not 'npm start'.
              run dev mode application types. springboot, nextjs, express, etc.
              Note, PARSE ALL ENVIRONMENT VARIABLES, AND KEEP THEM AS IT, DO NOT ADD INTRA_ TO THE BEGINNING OF THEM, AS THIS WILL BE DONE IN THE CODE,`,
            },
          ],
        },
      ],
    });

    let analysisData;
    if (msg.content[0].type === "text") {
      const responseContent = msg.content[0].text;
      console.log("Claude's response:", responseContent);

      const findAndParseJSON = (str) => {
        const regex = /\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g;
        const matches = str.match(regex);
        if (matches) {
          for (const match of matches) {
            try {
              return JSON.parse(match);
            } catch (e) {
              console.log("Failed to parse JSON:", match);
            }
          }
        }
        throw new Error("No valid JSON object found in the response.");
      };

      try {
        analysisData = findAndParseJSON(responseContent);
        console.log("Parsed analysis data:", analysisData);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Response content:", responseContent);
        throw new Error("Failed to parse JSON response from Claude.");
      }
    } else {
      throw new Error("Unexpected content type in Claude's response.");
    }

    return NextResponse.json(analysisData);
    */
  } catch (error) {
    console.error("Error in analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}
