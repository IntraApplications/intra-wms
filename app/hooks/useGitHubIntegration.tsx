"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/supabase-client";
import { githubApp } from "@/lib/github";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { RequestError } from "octokit";
import { useUser, useWorkspace } from "./useData";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { Workspaces } from "@mui/icons-material";

interface GitHubIntegrationState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

export function useGitHubIntegration() {
  const [state, setState] = useState<GitHubIntegrationState>({
    isLoading: true,
    error: null,
    isConnected: false,
  });

  const { showNotification } = useNotificationContext();
  const { user, isLoading: userLoading } = useUser();
  const { workspace, isLoading: workspaceLoading } = useWorkspace();
  const { message } = useWebSocketContext();

  useEffect(() => {
    if (!userLoading && !workspaceLoading) {
      checkInstallation();
    }
  }, [user, workspace, userLoading, workspaceLoading, message]);

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
    const supabase = createClient();

    try {
      const { data: workspace } = await supabase
        .from("workspaces")
        .select(
          "id, github_app_installation_id, github_org_name, github_org_id"
        )
        .single();

      if (!workspace?.github_app_installation_id) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isConnected: false,
        }));
        return;
      }

      const octokit = await githubApp.getInstallationOctokit(
        Number(workspace.github_app_installation_id)
      );

      try {
        await octokit.rest.apps.getInstallation({
          installation_id: Number(workspace.github_app_installation_id),
        });
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isConnected: true,
          githubOrgName: workspace.github_org_name,
        }));
      } catch (err) {
        // this error is thrown if the installation id does not exist anymore
        // meaning the installation deleted, rather than checking for a deleted event
        if (err instanceof RequestError && err.status === 404) {
          // Installation not found, clear the data

          await supabase
            .from("workspaces")
            .update({
              github_app_installation_id: null,
              github_org_name: null,
              github_org_id: null,
            })
            .eq("id", workspace.id);

          setState((prev) => ({
            ...prev,
            isLoading: false,
            isConnected: false,
            githubOrgName: null,
          }));

          showNotification({
            type: "warning",
            title: "GitHub Disconnected",
            message: "GitHub installation was removed. Please reconnect.",
          });
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isConnected: false,
            error: "An error occurred while checking GitHub integration.",
          }));
        }
        console.error("Error checking installation:", err);
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isConnected: false,
        error: "An error occurred while checking GitHub integration.",
      }));
      console.error("Error checking installation:", err);
    }
  };

  const initiateInstall = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

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
    orgName: workspace?.name ?? null,
    githubOrgName: workspace?.github_org_name ?? null,
    initiateInstall,
    checkInstallation,
  };
}
