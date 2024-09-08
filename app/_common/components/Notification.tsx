import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

type NotificationType = "success" | "info" | "warning" | "error";

type NotificationProps = {
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
};

const iconMap = {
  success: faCheckCircle,
  info: faInfoCircle,
  warning: faExclamationCircle,
  error: faExclamationTriangle,
};

const colorMap = {
  success: "text-green-500",
  info: "text-blue-500",
  warning: "text-yellow-500",
  error: "text-red-500",
};

export default function Notification({
  type,
  title,
  message,
  onClose,
  duration = 5000,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(onClose, 300);
      return () => clearTimeout(timer);
    }

    const autoCloseTimer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(autoCloseTimer);
  }, [isVisible, onClose, duration]);

  const icon = iconMap[type];
  const colorClass = colorMap[type];

  return isVisible ? (
    <div
      className={`fixed bottom-4 right-4 w-96 bg-[#212121] rounded-md shadow-lg overflow-hidden
      ${isVisible ? "animate-slideIn" : "animate-slideOut"}`}
    >
      {/* Vertical bar on the left side */}
      <div className={`w-2 bg-secondary h-full absolute left-0`}></div>
      <div className="flex items-start p-4 pl-6 relative">
        <FontAwesomeIcon
          icon={icon}
          className={`${colorClass} h-5 w-5 mt-0.5 mr-3 flex-shrink-0`}
        />
        <div className="flex-grow">
          <h3 className={`${colorClass} text-sm font-medium`}>{title}</h3>
          <p className="text-gray-300 text-xs mt-1">{message}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-300 absolute right-2 top-2 focus:outline-none  flex-shrink-0"
        >
          <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
        </button>
      </div>
    </div>
  ) : null;
}
