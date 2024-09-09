import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useNotificationContext } from "./NotificationContext"; // Import NotificationContext

// Define the shape of the context value
type WebSocketContextValue = {
  message: any;
  ws: WebSocket | null;
};

// Create WebSocket context
const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const WebSocketProvider: React.FC = ({ children }) => {
  const [message, setMessage] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Access the notification context to trigger notifications globally
  const { showNotification } = useNotificationContext();

  useEffect(() => {
    // Connect to WebSocket server
    const socketConnection = io("http://localhost:3001");

    // Listen for broadcast messages from WebSocket
    socketConnection.on("github_webhook", (message) => {
      setMessage(message);

      // Automatically trigger notifications based on WebSocket events
      if (message?.event === "installation" && message?.action === "created") {
        showNotification({
          type: "success",
          title: "GitHub Connected",
          message: "A new GitHub installation was added.",
        });
      } else if (
        message?.event === "installation" &&
        message?.action === "deleted"
      ) {
        showNotification({
          type: "warning",
          title: "GitHub Disconnected",
          message: "A GitHub installation was removed.",
        });
      }
    });

    // Handle disconnect
    socketConnection.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    setWs(socketConnection);

    // Cleanup on unmount
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

// Custom hook to use the WebSocket context
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === null) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
