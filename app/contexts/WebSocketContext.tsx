import React, { createContext, useContext, useEffect, useState } from "react";
import Notification from "@/_common/components/Notification"; // Import the Notification component we created earlier

// Define the shape of a notification
type NotificationData = {
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
};

// Define the shape of the context value
type WebSocketContextValue = {
  message: any;
  ws: WebSocket | null;
  showNotification: (notification: NotificationData) => void;
};

// Create WebSocket context
const WebSocketContext = createContext<WebSocketContextValue | null>(null);

// WebSocket provider to wrap the entire app
export const WebSocketProvider: React.FC = ({ children }) => {
  const [message, setMessage] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000"); // Replace with your WebSocket URL
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data);

      // Check if the message is a GitHub webhook
      if (data.type === "github_webhook") {
        showNotification({
          type: "info",
          title: "GitHub Webhook Received",
          message: `Event: ${data.event}, Repository: ${data.repository}`,
        });
      }
    };

    return () => {
      socket.close(); // Clean up WebSocket on component unmount
    };
  }, []);

  const showNotification = (notification: NotificationData) => {
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      notification,
    ]);
  };

  const removeNotification = (index: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((_, i) => i !== index)
    );
  };

  return (
    <WebSocketContext.Provider value={{ message, ws, showNotification }}>
      {children}
      {notifications.map((notification, index) => (
        <Notification
          key={index}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => removeNotification(index)}
        />
      ))}
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
