// app/dashboard/workspaces/page.tsx
"use client";

import { useState, useEffect } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CodeOutlined, ChevronRight, DvrOutlined } from "@mui/icons-material";
import Button from "@/_common/components/Button";
import ErrorNotification from "@/_common/components/ErrorNotification";
import { useSearchParams } from "next/navigation";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";

export default function WorkspacePage() {
  // State for managing workspaces and UI
  const [hasWorkspaces, setHasWorkspaces] = useState(false);
  const [errorNotification, setErrorNotification] = useState(null);

  // Custom hook for GitHub integration
  const { isLoading, error, repos, initiateInstall, checkInstallation } =
    useGitHubIntegration();

  // Next.js router hooks
  const searchParams = useSearchParams();

  // Effect to check for GitHub installation on component mount or URL change
  useEffect(() => {
    const installation_id = searchParams.get("installation_id");
    if (installation_id) {
      checkInstallation(installation_id);
    }
  }, [searchParams, checkInstallation]);

  // Handler for creating a new workspace
  const handleCreateWorkspace = async (repoName: string) => {
    try {
      const response = await fetch("/api/create-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_name: repoName }),
      });
      const data = await response.json();
      console.log("Workspace creation response:", data);
      setHasWorkspaces(true);
    } catch (err) {
      console.error("Error creating workspace:", err);
      setErrorNotification({
        title: "Workspace Creation Failed",
        message: "Unable to create workspace. Please try again later.",
      });
    }
  };

  // Update error notification when there's an error from the GitHub integration
  useEffect(() => {
    if (error) {
      setErrorNotification({
        title: "GitHub Integration Error",
        message: error,
      });
    }
  }, [error]);

  return (
    <div className="h-full">
      {/* Breadcrumb Section */}
      <div className="border-b border-border w-full h-11 flex items-center">
        <div className="ml-5 flex gap-2 items-center">
          <CodeOutlined fontSize="medium" className="text-tertiaryBorder" />
          <p className="text-xs text-accent">Team - Engineering</p>
          <ChevronRight fontSize="small" className="text-sidenav" />
          <p className="text-xs text-white">Virtual Workspaces</p>
        </div>
      </div>

      <div className="flex justify-center mt-20">
        <div className="h-[600px] w-[1100px]">
          {hasWorkspaces || repos.length > 0 ? (
            <div className="flex justify-between">
              <h1 className="text-accent text-2xl">Virtual Workspaces</h1>
              <Button
                text={"Create new workspace"}
                type={"button"}
                size="xs"
                icon={faPlus}
                handleClick={initiateInstall}
                loading={isLoading}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center text-center max-w-[400px]">
                <DvrOutlined
                  style={{ fontSize: "50px" }}
                  className="text-white text-5xl mb-6"
                />
                <h1 className="text-white text-md mb-2">Virtual Workspaces</h1>
                <p className="text-sidenav text-[13px] mb-8">
                  Workspaces give your team a dedicated space to code,
                  collaborate, and manage projects. Install the Intra GitHub App
                  to start working efficiently and track progress in real-time.
                </p>
                <Button
                  text={"Install Intra GitHub App"}
                  type={"button"}
                  size="xxs"
                  icon={faPlus}
                  handleClick={initiateInstall}
                  loading={isLoading}
                  className="mt-10"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {errorNotification && (
        <ErrorNotification
          title={errorNotification.title}
          message={errorNotification.message}
          onClose={() => setErrorNotification(null)}
        />
      )}
    </div>
  );
}
