"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/_lib/supabase";
import { githubApp } from "@/_lib/github";
import { useNotificationContext } from "@/contexts/NotificationContext";

export function useGitHubIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installationId, setInstallationId] = useState<string | null>(null);
  const [repos, setRepos] = useState<any[]>([]);

  // Handle GitHub integration errors and show error notifications
  const { showNotification } = useNotificationContext();

  useEffect(() => {
    if (error) {
      showNotification({
        type: "error",
        title: "GitHub Integration Error",
        message: error,
      });
    }
  }, [error]);

  // Initiate GitHub App installation process
  const initiateInstall = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/github-app-install");
      const data = await response.json();
      window.open(data.installUrl, "_blank");
    } catch (err) {
      setError("Failed to initiate GitHub App installation.");
      console.error("Error initiating GitHub App installation:", err);
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  // Fetch GitHub Installation ID from Supabase and check if the app is still integrated
  const checkInstallation = async (orgName: string) => {
    console.log("testtttfdsfdfsd");
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Fetch installation ID from the Supabase database
      const { data, error: fetchError } = await supabase
        .from("organizations")
        .select("github_app_installation_id")
        .eq("github_org_name", orgName) // Use dynamic organization name
        .single();

      if (fetchError || !data) {
        throw new Error(
          "Failed to retrieve GitHub installation ID from the database."
        );
      }

      const fetchedInstallationId = data.github_app_installation_id;
      setInstallationId(fetchedInstallationId);

      // Step 2: Verify if the installation is still integrated via GitHub's API
      const octokit = await githubApp.getInstallationOctokit(
        Number(fetchedInstallationId)
      );

      const { data: repoData } =
        await octokit.rest.apps.listReposAccessibleToInstallation({
          installation_id: Number(fetchedInstallationId),
        });

      if (!repoData || repoData.repositories.length === 0) {
        throw new Error(
          "No repositories found or GitHub app is no longer integrated."
        );
      }

      // Step 3: Store fetched repositories
      setRepos(repoData.repositories);
    } catch (err) {
      setError(
        "Unable to verify the GitHub app installation or fetch repositories."
      );
      console.error("Error checking installation:", err);
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  return { isLoading, error, initiateInstall, checkInstallation, repos };
}
