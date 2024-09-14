import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useNotificationContext } from "./NotificationContext";
import { createClient } from "@/lib/supabase/supabase-client";

type WebSocketContextValue = {
  message: any;
  ws: WebSocket | null;
};

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const WebSocketProvider: React.FC = ({ children }) => {
  const [message, setMessage] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { showNotification } = useNotificationContext();
  const supabase = createClient();

  useEffect(() => {
    const socketConnection = io("http://localhost:3001");

    socketConnection.on("github_webhook", handleGithubWebhook);
    socketConnection.on("disconnect", handleDisconnect);

    setWs(socketConnection);

    // Cleanup when component unmounts
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  /**
   * Handles incoming GitHub webhook events and updates the database
   */
  const handleGithubWebhook = async (data: any) => {
    const { event, action, installationId, githubOrgName, githubOrgId } = data;

    try {
      if (event === "installation" && action === "created") {
        await updateWorkspace(installationId, githubOrgName, githubOrgId);
        showNotification({
          type: "success",
          title: "GitHub Connected",
          message: "GitHub installation was added and workspace updated.",
        });
      } else if (event === "installation" && action === "deleted") {
        await clearWorkspaceInstallation(installationId);
        showNotification({
          type: "warning",
          title: "GitHub Disconnected",
          message: "GitHub installation was removed and database updated.",
        });
      }
    } catch (err) {
      handleUpdateError(err, action);
    }

    setMessage(data); // Store the message in state
  };

  /**
   * Handles WebSocket disconnection event
   */
  const handleDisconnect = () => {
    console.log("Disconnected from WebSocket server");
  };

  /**
   * Updates the workspace with the new GitHub installation details
   */
  const updateWorkspace = async (
    installationId: string,
    githubOrgName: string,
    githubOrgId: string
  ) => {
    const { error } = await supabase
      .from("workspaces")
      .update({
        github_app_installation_id: installationId,
        github_org_name: githubOrgName,
        github_org_id: githubOrgId,
      })
      .eq("github_app_installation_id", installationId);

    if (error) {
      throw new Error(`Error updating workspace: ${error.message}`);
    }
  };

  /**
   * Clears the GitHub installation details from the workspace in the database
   */
  const clearWorkspaceInstallation = async (installationId: string) => {
    const { error } = await supabase
      .from("workspaces")
      .update({
        github_app_installation_id: null,
        github_org_name: null,
        github_org_id: null,
      })
      .eq("github_app_installation_id", installationId);

    if (error) {
      throw new Error(
        `Error clearing workspace installation: ${error.message}`
      );
    }
  };

  /**
   * Handles errors encountered when updating the workspace
   */
  const handleUpdateError = (err: Error, action: string) => {
    console.error(
      `Failed to update workspace after installation ${action}:`,
      err
    );
    showNotification({
      type: "error",
      title: action === "created" ? "Workspace Update Failed" : "Update Failed",
      message: `Failed to update workspace after GitHub installation ${action}.`,
    });
  };

  return (
    <WebSocketContext.Provider value={{ message, ws }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === null) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
