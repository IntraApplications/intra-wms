// app/api/claude-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/supabase-server";
import fs from "fs";
import { prompt } from "./prompt";

import { promisify } from "util";

const readFile = promisify(fs.readFile);

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
  const { outputFilePath } = await request.json();

  const supabase = createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileContents = await readFile(outputFilePath, "utf-8");

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
              text: `Analyze the following codebase information:\n\n${fileContents}`,
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
