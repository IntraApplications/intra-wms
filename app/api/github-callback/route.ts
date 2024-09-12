import { NextRequest, NextResponse } from "next/server";
import { githubApp } from "@/lib/github";
import { createClient } from "@/lib/supabase/supabase-server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const installation_id = searchParams.get("installation_id");
  const setup_action = searchParams.get("setup_action");

  if (installation_id && setup_action === "install") {
    try {
      const octokit = await githubApp.getInstallationOctokit(
        Number(installation_id)
      );

      // Fetch the installation details
      const { data: installationData } =
        await octokit.rest.apps.getInstallation({
          installation_id: Number(installation_id),
        });

      // Fetch the organization details to get the org ID
      const { data: orgData } = await octokit.rest.orgs.get({
        org: installationData?.account?.login,
      });

      const supabase = createClient();
      // First, get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User error:", userError);
        throw new Error("Unable to get current user.");
      }

      // Then, fetch the user's workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .select("id, name")
        .eq("user_id", user.id)
        .single();

      if (workspaceError) {
        console.error("Workspace error:", workspaceError);
        throw new Error("Unable to fetch user's workspace.");
      }

      // Update the workspace with GitHub installation data
      const { error: updateError } = await supabase
        .from("workspaces")
        .update({
          github_org_name: installationData?.account?.login,
          github_org_id: orgData.id,
          github_app_installation_id: installation_id,
        })
        .eq("id", workspace.id);

      console.log(updateError);
      console.log("TESFDSDS");
      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Failed to update workspace with GitHub data.");
      }

      // Return an HTML page that will communicate with the opener and then close itself
      return new NextResponse(
        `
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'github-installation-success',
                  installationId: '${installation_id}',
                  orgName: '${installationData?.account?.login}',
                  orgId: '${orgData.id}'
                }, '*');
                window.close();
              }
            </script>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    } catch (error) {
      console.error("Error processing GitHub callback:", error);
      return NextResponse.json(
        { error: "Failed to process GitHub installation" },
        { status: 500 }
      );
    }
  }

  // Handle other cases or errors
  return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
}
