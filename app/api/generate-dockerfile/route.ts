// app/api/claude-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { githubApp } from "@/lib/github";
import { createClient } from "@/lib/supabase/supabase-server";
import fs from "fs";
import { prompt } from "./prompt";

import { promisify } from "util";

const readFile = promisify(fs.readFile);

function generateGithubUrlWithToken(repoUrl, token) {
  // Extract the owner and repo name from the given GitHub URL
  const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\.git/);
  if (!urlParts || urlParts.length < 3) {
    throw new Error("Invalid GitHub repository URL");
  }

  const owner = urlParts[1];
  const repo = urlParts[2];

  // Construct the full GitHub URL with the token
  const cloneUrlWithToken = `https://x-access-token:${token}@github.com/${owner.toLowerCase()}/${repo.toLowerCase()}.git`;
  return cloneUrlWithToken;
}

// Output: https://x-access-token:ghp_1234567890abcdefghij@github.com/IntraApplications/intra-websocket-hub.git

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Function to remove comments from JSON-like string
const removeComments = (jsonString: string) => {
  // Remove single-line (//) and multi-line (/* */) comments
  return jsonString
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();
};

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

    // Get the workspace data
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

    // Get an Octokit instance for this installation
    const octokit = await githubApp.getInstallationOctokit(
      Number(installationId)
    );

    const auth = await octokit.auth({
      type: "installation",
    });

    console.log(auth.token); // The installation token

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 8192,
      temperature: 0,
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
              )} into the docker image, 
              rather then downloading from the path. so include this remote download in the docker file, and not the current directory`,
              // THIS prompt is effective for generating a docker file, and building the repo contents from a remote repo, rather
              // then storing it locally in a temp file
            },
          ],
        },
      ],
    });

    /*
    const assistant = await openai.beta.assistants.create({
      name: "Code analyzer",
      instructions: prompt,
      model: "gpt-4o",
      temperature: 0.2,
      top_p: 0.95,
    });

    const fileUpload = await openai.files.create({
      file: fs.createReadStream(outputFilePath),
      purpose: "assistants",
    });

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: prompt,
          attachments: [
            { file_id: fileUpload.id, tools: [{ type: "file_search" }] },
          ],
        },
      ],
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    const messages = await openai.beta.threads.messages.list(thread.id, {
      run_id: run.id,
    });

    const message = messages.data.pop();
    let responseContent = "";

    if (message && message.content[0].type === "text") {
      const { text } = message.content[0];
      responseContent = text.value;

      // Remove code blocks
      responseContent = responseContent.replace(/```json([\s\S]*?)```/g, "$1");
      responseContent = responseContent.replace(/```([\s\S]*?)```/g, "$1");

      // Remove comments from the JSON
      responseContent = removeComments(responseContent);

      // Extract JSON content
      const jsonStartIndex = responseContent.indexOf("{");
      const jsonEndIndex = responseContent.lastIndexOf("}");
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        responseContent = responseContent.slice(
          jsonStartIndex,
          jsonEndIndex + 1
        );
      } else {
        throw new Error("No valid JSON object found in the response.");
      }

      // Parse the JSON content
      let analysisData;
      try {
        analysisData = JSON.parse(responseContent);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Response content:", responseContent);
        throw new Error("Failed to parse JSON response from assistant.");
      }
          */

    let analysisData;
    if (msg.content[0].type === "text") {
      const responseContent = msg.content[0].text;
      console.log("Claude's response:", responseContent);

      // Function to find and parse the first valid JSON object in the string
      const findAndParseJSON = (str) => {
        const regex = /\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g;
        const matches = str.match(regex);
        if (matches) {
          for (const match of matches) {
            try {
              return JSON.parse(match);
            } catch (e) {
              console.log("Failed to parse JSON:", match);
              // Continue to the next match if parsing fails
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
  } catch (error) {
    console.error("Error in analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}
