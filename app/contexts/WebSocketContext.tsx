import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import io from "socket.io-client";
import Notification from "@/_common/components/Notification"; // Import the Notification component

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

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  // Ref to track if a notification has been shown for a specific message
  const hasShownNotificationRef = useRef(new Set()); // Use Set to track unique messages

  useEffect(() => {
    console.log("testt");
    // Connect to WebSocket server
    const socketConnection = io("http://localhost:3001"); // Change this URL to your WebSocket server
    console.log(socketConnection);

    // Listen for connection
    socketConnection.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    // Listen for broadcast messages
    socketConnection.on("github_webhook", (message) => {
      showNotification({
        title: "Github Disconnected",
        message: "Github integration disconnected",
        type: "info",
      });
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Handle disconnect
    socketConnection.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    setSocket(socketConnection);

    // Cleanup on unmount
    return () => {
      socketConnection.disconnect();
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
    hasShownNotificationRef.current.clear(); // Reset ref when a notification is cleared
  };

  return (
    <WebSocketContext.Provider value={{ message, ws, showNotification }}>
      {children}
      {/* Render notifications at the root */}
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
