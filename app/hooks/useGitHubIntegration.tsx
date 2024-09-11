"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/supabase-client";
import { githubApp } from "@/lib/github";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { RequestError } from "octokit";
import { create } from "domain";

interface GitHubIntegrationState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  orgName: string | null;
  githubOrgName: string | null;
}

export function useGitHubIntegration() {
  const [state, setState] = useState<GitHubIntegrationState>({
    isLoading: true,
    error: null,
    isConnected: false,
    orgName: null,
    githubOrgName: null,
  });

  const { showNotification } = useNotificationContext();

  useEffect(() => {
    checkInstallation();
  }, []);

  useEffect(() => {
    if (state.error) {
      showNotification({
        type: "error",
        title: "GitHub Integration Error",
        message: state.error,
      });
    }
  }, [state.error]);

  const checkInstallation = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("organizations")
        .select("name, github_org_name, github_app_installation_id")
        .eq("name", "pingl") // Use dynamic organization name
        .single();

      if (fetchError || !data) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isConnected: false,
          error: "No connected organizations found.",
        }));
        return;
      }

      const {
        name: orgName,
        github_org_name: githubOrgName,
        github_app_installation_id: installationId,
      } = data;

      if (!installationId) {
        // "No GitHub installation found for this organization.",
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isConnected: false,
          orgName,
          githubOrgName,
        }));
        return;
      }

      // Step 2: Verify if the installation is valid using GitHub's API
      const octokit = await githubApp.getInstallationOctokit(
        Number(installationId)
      );

      const { data: installationData } =
        await octokit.rest.apps.getInstallation({
          installation_id: Number(installationId),
        });

      console.log(installationData);

      if (!installationData) {
        //  "GitHub app is no longer integrated or has no accessible repositories.",
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isConnected: false,
          orgName,
          githubOrgName,
        }));
        return;
      }

      // Step 3: Store fetched repositories and update state
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isConnected: true,
        orgName,
        githubOrgName,
      }));
    } catch (err) {
      // RequestError - octokit
      if (err.status === 404) {
        // installation has not been found
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isConnected: false,
        }));
        return;
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isConnected: false,
        error: "Github ",
      }));
      console.error("Error checking installation:", err);
    }
  };

  const initiateInstall = async () => {
    setState((prev) => ({ ...prev, error: null }));

    try {
      const response = await fetch("/api/github-app-install");
      const data = await response.json();
      window.open(data.installUrl, "_blank");
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "Failed to initiate GitHub App installation.",
      }));
      console.error("Error initiating GitHub App installation:", err);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    ...state,
    initiateInstall,
    checkInstallation,
  };
}
