// app/api/claude-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import {
  readRepopack,
  analyzeProject,
  generateDockerfile,
  generateOutput,
} from "./analyzer";

export async function POST(request: NextRequest) {
  const { outputFilePath, repoDir } = await request.json();

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
      .select("github_app_installation_id")
      .single();

    if (workspaceError || !workspaceData?.github_app_installation_id) {
      return NextResponse.json(
        { error: "No GitHub installation found" },
        { status: 400 }
      );
    }

    // Use the script to analyze the repository
    const files = await readRepopack(outputFilePath);

    if (Object.keys(files).length === 0) {
      return NextResponse.json(
        {
          error:
            "No files were parsed from repopack.txt. Please check the file format.",
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeProject(files);
    const dockerfileResult = generateDockerfile(analysis, files);
    const output = await generateOutput(analysis, dockerfileResult);

    return NextResponse.json(output);
  } catch (error) {
    console.error("Error in analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}
