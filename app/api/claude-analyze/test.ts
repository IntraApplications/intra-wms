// app/api/claude-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/supabase-server";
import { githubApp } from "@/lib/github";
import fs from "fs";

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

import OpenAI from "openai";
const openai = new OpenAI();

main();

export async function POST(request: NextRequest) {
  const { repopackOutput } = await request.json();

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

    const installationId = workspaceData.github_app_installation_id;

    // Get an Octokit instance for this installation
    const octokit = await githubApp.getInstallationOctokit(
      Number(installationId)
    );

    // Fetch repository data using Octokit

    const prompt = `${repopackOutput}`;
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
      instructions:
        "I want you to analyze this project carefully and create a docker file that can be used to deploy this application in a workspaces environment,",

      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });
    let vectorStore = await openai.beta.vectorStores.create({
      name: "Repository",
    });

    await openai.beta.vectorStores.fileBatches.uploadAndPoll(
      vectorStore.id,
      fs.createReadStream("/fs")
    );

    await openai.beta.assistants.update(assistant.id, {
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });

    const aapl10k = await openai.files.create({
      file: fs.createReadStream("edgar/aapl-10k.pdf"),
      purpose: "assistants",
    });

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: "Analyze the file",
          // Attach the new file to the message.
          attachments: [
            { file_id: aapl10k.id, tools: [{ type: "file_search" }] },
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

    const message = messages.data.pop()!;
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

      console.log(text.value);
      console.log(citations.join("\n"));
    }
    const analysis = text?.value;

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error in Claude analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
  f;
}
