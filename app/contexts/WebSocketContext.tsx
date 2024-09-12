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

  useEffect(() => {
    const socketConnection = io("http://localhost:3001");
    const supabase = createClient();

    socketConnection.on("github_webhook", async (data) => {
      const { event, action, installationId, githubOrgName, githubOrgId } =
        data;

      if (event === "installation" && action === "created") {
        try {
          // Update the existing workspace with GitHub details
          const { error } = await supabase
            .from("workspaces")
            .update({
              github_app_installation_id: installationId,
              github_org_name: githubOrgName,
              github_org_id: githubOrgId,
            })
            .eq("github_app_installation_id", installationId);

          if (error) {
            console.error("Error updating workspace:", error);
            throw error;
          }

          showNotification({
            type: "success",
            title: "GitHub Connected",
            message: "GitHub installation was added and workspace updated.",
          });
        } catch (err) {
          console.error(
            "Failed to update workspace after installation creation:",
            err
          );
          showNotification({
            type: "error",
            title: "Workspace Update Failed",
            message: "Failed to update workspace with GitHub details.",
          });
        }
      } else if (event === "installation" && action === "deleted") {
        try {
          // Update the database to reflect the deleted installation
          const { error } = await supabase
            .from("workspaces")
            .update({
              github_app_installation_id: null,
              github_org_name: null,
              github_org_id: null,
            })
            .eq("github_app_installation_id", installationId);

          if (error) {
            console.error("Error updating database:", error);
            throw error;
          }

          showNotification({
            type: "warning",
            title: "GitHub Disconnected",
            message: "GitHub installation was removed and database updated.",
          });
        } catch (err) {
          console.error(
            "Failed to update database after installation deletion:",
            err
          );
          showNotification({
            type: "error",
            title: "Update Failed",
            message: "Failed to update database after GitHub disconnection.",
          });
        }
      }
      await setTimeout(() => {
        setMessage(data);
      }, 2000);
    });

    socketConnection.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    setWs(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [showNotification]);

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
