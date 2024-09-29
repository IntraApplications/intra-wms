import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNotificationContext } from "@/contexts/NotificationContext";
import Image from "next/image";
import IntraLogo from "@/_assets/intra-icon-large-transparent.png";

interface LoadingPageProps {
  messages: any[];
}

const steps = [
  "Initializing",
  "Authenticating",
  "Building Workspace",
  "Pushing Workspace",
];

const LoadingPage: React.FC<LoadingPageProps> = ({ messages }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLog, setCurrentLog] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotificationContext();

  const lastProcessedIndex = useRef(0);
  const progressAnimation = useAnimation();

  useEffect(() => {
    const newMessages = messages.slice(lastProcessedIndex.current);
    newMessages.forEach((message) => {
      try {
        const parsedMessage = message;
        if (parsedMessage.type === "overall" && parsedMessage.step !== -1) {
          setCurrentStep(parsedMessage.step);
          const progress = (parsedMessage.step / (steps.length - 1)) * 100;
          progressAnimation.start({
            width: `${progress}%`,
            transition: { duration: 0.5, ease: "easeInOut" },
          });
        }
        if (parsedMessage.humanReadable) {
          setCurrentLog(parsedMessage.humanReadable);
        }
        if (parsedMessage.error) {
          setError(parsedMessage.error);
          showNotification({
            type: "error",
            title: "Pod Creation Error",
            message: parsedMessage.error,
          });
        } else if (parsedMessage.type === "end") {
          showNotification({
            type: "success",
            title: "Pod Creation Complete",
            message: "Your pod has been successfully created.",
          });
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    lastProcessedIndex.current = messages.length;
  }, [messages, showNotification, progressAnimation]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-primary text-neutral p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <Image
          src={IntraLogo}
          alt="Intra Logo"
          width={60}
          height={60}
          className="mb-4 mx-auto"
        />
        <h1 className="text-2xl font-bold mb-1">Preparing Your Workspace</h1>
        <p className="text-base text-accent">Hang tight, we're almost there!</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <div className="mb-4">
          <div className="flex justify-between mb-2 text-sm">
            <span className="font-semibold">{steps[currentStep]}</span>
            <span className="text-accent">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="bg-secondary h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-tertiary h-full"
              initial={{ width: "0%" }}
              animate={progressAnimation}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-secondary rounded-lg p-3 text-xs font-mono border border-secondary-border"
        >
          <p className="text-tertiary-border">$ {currentLog}</p>
          {error && <p className="text-red-400 mt-2">Error: {error}</p>}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingPage;
