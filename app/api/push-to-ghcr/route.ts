import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { App } from "octokit";
import fs from "fs";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { dockerfileContent, organizationData, repositoryName } =
    await request.json();

  const { data: org } = await supabase
    .from("organizations")
    .select("github_org_name, github_app_installation_id")
    .eq("id", organizationData.id)
    .single();

  if (!org) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  const installationId = org.github_app_installation_id;

  // Initialize GitHub App
  const app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
  });

  try {
    const octokit = await app.getInstallationOctokit(installationId);

    // Check if the repository exists
    try {
      await octokit.rest.repos.get({
        owner: org.github_org_name,
        repo: repositoryName,
      });
    } catch (error: any) {
      if (error.status === 404) {
        // Repository does not exist, create it
        await octokit.rest.repos.createInOrg({
          org: org.github_org_name,
          name: repositoryName,
          private: true,
        });
      } else {
        throw error;
      }
    }

    // Create or update the Dockerfile in the repository
    const filePath = "Dockerfile";
    const fileContent = Buffer.from(dockerfileContent).toString("base64");

    let sha: string | undefined;

    try {
      // Try to get the file first to obtain its SHA
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner: org.github_org_name,
        repo: repositoryName,
        path: filePath,
      });

      if (!Array.isArray(fileData) && fileData.type === "file") {
        sha = fileData.sha;

        // Update the existing Dockerfile
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: org.github_org_name,
          repo: repositoryName,
          path: filePath,
          message: "Update Dockerfile",
          content: fileContent,
          sha: sha,
        });
      }
    } catch (error: any) {
      if (error.status === 404) {
        // File doesn't exist, create it
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: org.github_org_name,
          repo: repositoryName,
          path: filePath,
          message: "Create Dockerfile",
          content: fileContent,
        });
      } else {
        throw error;
      }
    }

    // Create or update the GitHub Actions workflow
    const workflowFilePath = ".github/workflows/docker-image.yml";
    const workflowContent = `
name: Build and Push Docker Image

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Log in to GHCR
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/\${{ github.repository }}:latest
`;

    let workflowSha: string | undefined;

    try {
      // Try to get the workflow file to obtain its SHA
      const { data: workflowFileData } = await octokit.rest.repos.getContent({
        owner: org.github_org_name,
        repo: repositoryName,
        path: workflowFilePath,
      });

      if (
        !Array.isArray(workflowFileData) &&
        workflowFileData.type === "file"
      ) {
        workflowSha = workflowFileData.sha;

        // Update the existing workflow file
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: org.github_org_name,
          repo: repositoryName,
          path: workflowFilePath,
          message: "Update GitHub Actions workflow",
          content: Buffer.from(workflowContent).toString("base64"),
          sha: workflowSha,
        });
      }
    } catch (error: any) {
      if (error.status === 404) {
        // Workflow file doesn't exist, create it
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: org.github_org_name,
          repo: repositoryName,
          path: workflowFilePath,
          message: "Add GitHub Actions workflow",
          content: Buffer.from(workflowContent).toString("base64"),
        });
      } else {
        throw error;
      }
    }

    // The image will be built and pushed by GitHub Actions
    const imageName = `ghcr.io/${org.github_org_name}/${repositoryName}:latest`;

    return NextResponse.json({ success: true, imageName });
  } catch (error) {
    console.error("Error pushing to GHCR:", error);
    return NextResponse.json(
      { error: "Failed to push to GHCR" },
      { status: 500 }
    );
  }
}
