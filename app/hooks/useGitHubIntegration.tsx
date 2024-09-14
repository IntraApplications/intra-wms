"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/supabase-client";
import { githubApp } from "@/lib/github";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { RequestError } from "@octokit/request-error";
import { useIntraData } from "./useData";
import { useState, useEffect } from "react";

export function useGitHubIntegration() {
  const supabase = createClient();
  const { showNotification } = useNotificationContext();
  const { workspace } = useIntraData();
  const [isImmediateLoading, setIsImmediateLoading] = useState(true);

  const {
    data: installationData,
    isPending,
    error,
    refetch: refetchInstallation,
  } = useQuery({
    queryKey: ["githubInstallation", workspace?.id],
    queryFn: async () => {
      // No need to check for !workspace here since the query won't run if enabled is false
      const { data: workspaceData, error } = await supabase
        .from("workspaces")
        .select(
          "id, github_app_installation_id, github_org_name, github_org_id"
        )
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

      const octokit = await githubApp.getInstallationOctokit(
        Number(workspaceData.github_app_installation_id)
      );

      try {
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
    },
    staleTime: 0,
    gcTime: 0,
    enabled: !!workspace, // The query will run only when workspace is truthy
  });

  useEffect(() => {
    if (!isPending) {
      setIsImmediateLoading(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (error) {
      showNotification({
        type: "error",
        title: "GitHub Integration Error",
        message: (error as Error).message,
      });
    }
  }, [error, showNotification]);

  const initiateInstall = async () => {
    try {
      const response = await fetch("/api/github-app-install");
      const data = await response.json();
      window.open(data.installUrl, "_blank");
    } catch (err) {
      showNotification({
        type: "error",
        title: "GitHub Integration Error",
        message: "Failed to initiate GitHub App installation.",
      });
    }
  };

  return {
    isConnected: installationData?.isConnected ?? false,
    githubOrgName: installationData?.githubOrgName ?? null,
    installationId: installationData?.installationId ?? null,
    isPending: isPending,
    error,
    initiateInstall,
    refetchInstallation,
  };
}
