import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

type ErrorNotificationProps = {
  title: string;
  message: string;
  onClose: () => void;
};

export default function ErrorNotification({
  title,
  message,
  onClose,
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to finish
    }, 3000); // Auto close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-start justify-between w-96 p-4 bg-alert rounded-lg shadow-lg 
      ${isVisible ? "animate-slideIn" : "animate-slideOut"}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-500 dark:text-red-300 h-6 w-6"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {title || "An error occurred"}
          </h3>
          <div className="text-sm text-red-600 dark:text-red-400">
            <p>{message}</p>
          </div>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={() => setIsVisible(false)}
          className="inline-flex text-secondary brightness-125 hover:brightness-200 focus:outline-none"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
}
