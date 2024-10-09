"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/supabase-client";
import { githubApp } from "@/lib/github";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { RequestError } from "@octokit/request-error";
import { useIntraData } from "./useData";
import { useState, useEffect, useCallback } from "react";

// Define the structure of the installation data
interface InstallationData {
  isConnected: boolean;
  githubOrgName: string | null;
  installationId: number | null;
}

// Define the return type of the hook
interface UseGitHubIntegrationReturn extends InstallationData {
  isPending: boolean;
  error: Error | null;
  initiateInstall: () => Promise<void>;
  refetchInstallation: () => void;
}

/**
 * Custom Hook: useGitHubIntegration
 * Manages the GitHub integration status and actions.
 *
 * @returns An object containing the integration status, error information, and action methods.
 */
export function useGitHubIntegration(): UseGitHubIntegrationReturn {
  const supabase = createClient();
  const { showNotification } = useNotificationContext();
  const { workspace } = useIntraData();
  const [isImmediateLoading, setIsImmediateLoading] = useState<boolean>(true);

  /**
   * Fetches installation data from Supabase and GitHub.
   *
   * @returns InstallationData object containing connection status and organization details.
   */
  const fetchInstallationData = async (): Promise<InstallationData> => {
    if (!workspace) {
      throw new Error("Workspace is not available.");
    }

    // Fetch workspace data from Supabase
    const { data: workspaceData, error } = await supabase
      .from("workspaces")
      .select("id, github_app_installation_id, github_org_name, github_org_id")
      .eq("id", workspace.id)
      .single();

    if (error) {
      throw new Error("Failed to fetch workspace data.");
    }

    if (!workspaceData.github_app_installation_id) {
      return {
        isConnected: false,
        githubOrgName: null,
        installationId: null,
      };
    }

    // Initialize Octokit with the installation ID
    const octokit = await githubApp.getInstallationOctokit(
      Number(workspaceData.github_app_installation_id)
    );

    try {
      // Verify installation validity
      await octokit.rest.apps.getInstallation({
        installation_id: Number(workspaceData.github_app_installation_id),
      });

      return {
        isConnected: true,
        githubOrgName: workspaceData.github_org_name,
        installationId: workspaceData.github_app_installation_id,
      };
    } catch (err) {
      throw new Error("An error occurred while checking GitHub integration.");
    }
  };

  // Use React Query to manage fetching and caching installation data
  const {
    data: installationData,
    isPending,
    error,
    refetch: refetchInstallation,
  } = useQuery<InstallationData, Error>({
    queryKey: ["githubInstallation", workspace?.id],
    queryFn: fetchInstallationData,
    staleTime: 0,
    gcTime: 0,
    enabled: !!workspace, // Only run the query if workspace is available
  });

  /**
   * Effect to update loading state after the query is no longer pending.
   */
  useEffect(() => {
    if (!isPending) {
      setIsImmediateLoading(false);
    }
  }, [isPending]);

  /**
   * Effect to display notifications in case of errors.
   */
  useEffect(() => {
    if (error) {
      showNotification({
        type: "error",
        title: "GitHub Integration Error",
        message: error.message,
      });
    }
  }, [error, showNotification]);

  /**
   * Initiates the GitHub App installation process.
   * Opens the installation URL in a new browser tab.
   */
  const initiateInstall = useCallback(async () => {
    try {
      const response = await fetch("/api/github-app-install");
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      if (!data.installUrl) {
        throw new Error("Installation URL not found.");
      }
      window.open(data.installUrl, "_blank");
    } catch (err) {
      console.error("Failed to initiate GitHub App installation:", err);
      showNotification({
        type: "error",
        title: "GitHub Integration Error",
        message: "Failed to initiate GitHub App installation.",
      });
    }
  }, [showNotification]);

  return {
    isConnected: installationData?.isConnected ?? false,
    githubOrgName: installationData?.githubOrgName ?? null,
    installationId: installationData?.installationId ?? null,
    isPending: isPending,
    error: error ?? null,
    initiateInstall,
    refetchInstallation,
  };
}
