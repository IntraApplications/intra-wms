// app/api/github/repositories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { githubApp } from "@/lib/github";

export async function GET(request: NextRequest) {
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
      .select("id, github_app_installation_id")
      .single();

    if (workspaceError || !workspaceData?.github_app_installation_id) {
      return NextResponse.json(
        { error: "GitHub is not connected." },
        { status: 400 }
      );
    }

    const installationId = Number(workspaceData.github_app_installation_id);
    const octokit = await githubApp.getInstallationOctokit(installationId);

    // Fetch repositories
    const repositories = [];

    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const { data } =
        await octokit.rest.apps.listReposAccessibleToInstallation({
          per_page: 100,
          page,
        });

      repositories.push(...data.repositories);

      if (data.total_count > repositories.length) {
        page += 1;
      } else {
        hasNextPage = false;
      }
    }

    return NextResponse.json({ repositories });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories." },
      { status: 500 }
    );
  }
}
