// hooks/useGitHubIntegration.ts
import { useState } from "react";

interface GitHubRepo {
  id: string;
  full_name: string;
}

export function useGitHubIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);

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
      setIsLoading(false);
    }
  };

  const checkInstallation = async (installationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/github-app-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installation_id: installationId }),
      });
      const data = await response.json();
      if (data.success) {
        setRepos(data.repos);
      } else {
        throw new Error(data.error || "Failed to process installation");
      }
    } catch (err) {
      setError("Unable to verify the installation. Please try again.");
      console.error("Error checking installation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, repos, initiateInstall, checkInstallation };
}
