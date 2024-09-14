// app/api/claude-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/supabase-server";
import { githubApp } from "@/lib/github";
import { prompt } from "./prompt";
import fs from "fs";

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { outputFilePath, repoDir } = await request.json(); // Receive the file path and repo directory

  const supabase = createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the installation ID for the current user's organization
    const { data: workspaceData, error: workspaceError } = await supabase
      .from("workspaces")
      .select("github_app_installation_id")
      .single();

    if (workspaceError || !workspaceData?.github_app_installation_id) {
      return NextResponse.json(
        { error: "No GitHub installation found" },
        { status: 400 }
      );
    }

    // Get an Octokit instance for this installation

    // Fetch repository data using Octokit

    // const prompt = `${repopackOutput}`;
    /*
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    */
    const assistant = await openai.beta.assistants.create({
      name: "Code analyzer",
      instructions: prompt,

      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });

    const aapl10k = await openai.files.create({
      file: fs.createReadStream(outputFilePath),
      purpose: "assistants",
    });

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: prompt,
          attachments: [
            { file_id: aapl10k.id, tools: [{ type: "file_search" }] },
          ],
          // Attach the new file to the message.
        },
      ],
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    const messages = await openai.beta.threads.messages.list(thread.id, {
      run_id: run.id,
    });

    const message = messages.data.pop()!;
    let responseContent = "";
    if (message.content[0].type === "text") {
      const { text } = message.content[0];
      const { annotations } = text;
      const citations: string[] = [];

      let index = 0;
      for (let annotation of annotations) {
        text.value = text.value.replace(annotation.text, "[" + index + "]");
        const { file_citation } = annotation;
        if (file_citation) {
          const citedFile = await openai.files.retrieve(file_citation.file_id);
          citations.push("[" + index + "]" + citedFile.filename);
        }
        index++;
      }
      responseContent = text.value;
      // Remove any code block delimiters and extra text
      responseContent = responseContent.replace(
        /```json\n([\s\S]*?)\n```/g,
        "$1"
      );
      responseContent = responseContent.replace(/```([\s\S]*?)```/g, "$1");
      responseContent = responseContent.replace(/^[\s\S]*?{/, "{");
      responseContent = responseContent.replace(/}[\s\S]*?$/, "}");
    }
    let analysisData;
    try {
      analysisData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Response content:", responseContent);
      throw new Error("Failed to parse JSON response from OpenAI.");
    }

    console.log(analysisData);
    return NextResponse.json(analysisData);
  } catch (error) {
    console.error("Error in  analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}
