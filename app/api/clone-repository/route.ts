// app/api/clone-repository/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { githubApp } from "@/lib/github";
import fs from "fs/promises";
import path from "path";
import { simpleGit } from "simple-git";

export async function POST(request: NextRequest) {
  const { repoFullName } = await request.json();
  const supabase = createClient();

  try {
    // Authenticate the user
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

    // Get repository details
    const [owner, repo] = repoFullName.split("/");
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

    // Create a unique directory name
    const uniqueDirName = `${owner}-${repo}-${Date.now()}`;
    const repoDir = path.join(process.cwd(), "tmp", uniqueDirName);

    // Ensure the directory doesn't exist, then clone
    await fs.rm(repoDir, { recursive: true, force: true });
    await fs.mkdir(repoDir, { recursive: true });
    await simpleGit().clone(repoData.clone_url, repoDir);

    // Return the repository directory path
    return NextResponse.json({ repoDir });
  } catch (error) {
    console.error("Error cloning repository:", error);
    return NextResponse.json(
      {
        error: "Failed to clone repository",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
