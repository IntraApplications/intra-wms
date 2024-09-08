"use client";

import { useState, useEffect } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CodeOutlined, ChevronRight, DvrOutlined } from "@mui/icons-material";
import Button from "@/_common/components/Button";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

export default function WorkspacePage() {
  const [hasWorkspaces, setHasWorkspaces] = useState(false);

  // Custom hook for GitHub integration
  const { isLoading, error, initiateInstall, checkInstallation } =
    useGitHubIntegration();

  // WebSocket context for receiving messages and showing notifications
  const { message, showNotification } = useWebSocketContext();

  // Effect to check for GitHub installation on component mount
  useEffect(() => {
    checkInstallation("PinglMobile");
  }, []);

  // Handle GitHub integration errors and show error notifications
  useEffect(() => {
    if (error) {
      showNotification({
        type: "error",
        title: "GitHub Integration Error",
        message: error,
      });
    }
  }, [error]);

  return (
    <div className="h-full">
      <div className="border-b border-border w-full h-11 flex items-center">
        <div className="ml-5 flex gap-2 items-center">
          <CodeOutlined fontSize="medium" className="text-tertiaryBorder" />
          <p className="text-xs text-accent">Team - Engineering</p>
          <ChevronRight fontSize="small" className="text-sidenav" />
          <p className="text-xs text-white">Virtual Workspaces</p>
        </div>
      </div>

      <div className="flex justify-center items-center h-[calc(100vh-44px)]">
        <div className="h-[600px] w-[1100px]">
          {hasWorkspaces ? (
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
    </div>
  );
}
