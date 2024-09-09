import React, { createContext, useState, useContext } from "react";
import Notification from "@/_common/components/Notification";

// Define the shape of a notification
type NotificationData = {
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
};

type NotificationContextValue = {
  showNotification: (notification: NotificationData) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export const NotificationProvider: React.FC = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

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
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Render notifications globally */}
      {notifications.map((notification, index) => (
        <Notification
          key={index}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => removeNotification(index)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the Notification context
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};
