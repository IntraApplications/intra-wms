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
    if (!isVisible) {
      const timer = setTimeout(onClose, 300);
      return () => clearTimeout(timer);
    }

    const autoCloseTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(autoCloseTimer);
  }, [isVisible, onClose]);

  return isVisible ? (
    <div
      className={`fixed bottom-4 right-4 flex items-center w-96 bg-alert rounded-lg shadow-lg overflow-hidden
      ${isVisible ? "animate-slideIn" : "animate-slideOut"}`}
    >
      <div className="w-1 bg-red-500 h-full absolute left-0"></div>
      <div className="flex items-center p-4 pl-6 w-full relative">
        <div className="flex-shrink-0 mr-4 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            size="lg"
            className="text-red-500 dark:text-red-300 h-8 w-8"
          />
        </div>
        <div className="flex-grow pr-6">
          <h3 className="text-xs font-medium text-red-800 dark:text-red-200">
            {title || "An error occurred"}
          </h3>
          <div className="mt-1 text-xs text-red-600 dark:text-red-400">
            <p>{message}</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 inline-flex text-accent hover:text-white focus:outline-none transition-colors duration-200"
        >
          <FontAwesomeIcon
            icon={faTimes}
            className="h-4 w-4 text-secondaryBorder"
          />
        </button>
      </div>
    </div>
  ) : null;
}
