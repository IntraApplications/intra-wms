// PodCreation.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNotificationContext } from "@/contexts/NotificationContext";
import Image from "next/image";
import IntraLogo from "@/_assets/intra-icon-large-transparent.png";

/**
 * Interface representing a single message in the pod creation process.
 */
interface PodCreationMessage {
  type?: "overall" | "end" | string;
  step?: number;
  humanReadable?: string;
  error?: string;
}

/**
 * Props interface for the PodCreation component.
 */
interface PodCreationProps {
  messages: PodCreationMessage[];
}

/**
 * Array of steps involved in the pod creation process.
 */
const STEPS = [
  "Initializing",
  "Authenticating",
  "Building Workspace",
  "Pushing Workspace",
];

/**
 * Props interface for the Header component.
 */
interface HeaderProps {}

/**
 * Header Component
 * Renders the Intra logo and header text with animation.
 */
const Header: React.FC<HeaderProps> = React.memo(() => (
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
));

/**
 * Props interface for the ProgressSection component.
 */
interface ProgressSectionProps {
  currentStep: number;
  steps: string[];
  progressControls: any;
}

/**
 * ProgressSection Component
 * Renders the current step, step number, and animated progress bar.
 */
const ProgressSection: React.FC<ProgressSectionProps> = React.memo(
  ({ currentStep, steps, progressControls }) => {
    const progressPercentage = (currentStep / (steps.length - 1)) * 100;

    return (
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
            animate={progressControls}
          />
        </div>
      </div>
    );
  }
);

/**
 * Props interface for the LogSection component.
 */
interface LogSectionProps {
  currentLog: string;
  error: string | null;
}

/**
 * LogSection Component
 * Renders the current log message and any error messages.
 */
const LogSection: React.FC<LogSectionProps> = React.memo(
  ({ currentLog, error }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-secondary rounded-lg p-3 text-xs font-mono border border-secondary-border"
    >
      <p className="text-tertiary-border">$ {currentLog}</p>
      {error && <p className="text-red-400 mt-2">Error: {error}</p>}
    </motion.div>
  )
);

/**
 * PodCreation Component
 * Manages the pod creation process by processing incoming messages and updating the UI accordingly.
 */
const PodCreation: React.FC<PodCreationProps> = ({ messages }) => {
  // State variables
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentLog, setCurrentLog] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Notification context for displaying notifications
  const { showNotification } = useNotificationContext();

  // Ref to keep track of last processed message index
  const lastProcessedIndex = useRef<number>(0);

  // Controls for animating the progress bar
  const progressControls = useAnimation();

  /**
   * Processes new incoming messages to update the UI.
   */
  useEffect(() => {
    const newMessages = messages.slice(lastProcessedIndex.current);

    newMessages.forEach((message: PodCreationMessage) => {
      try {
        // Handle overall progress updates
        if (
          message.type === "overall" &&
          message.step !== undefined &&
          message.step !== -1
        ) {
          setCurrentStep(message.step);
          const progress = (message.step / (STEPS.length - 1)) * 100;
          progressControls.start({
            width: `${progress}%`,
            transition: { duration: 0.5, ease: "easeInOut" },
          });
        }

        // Update current log if available
        if (message.humanReadable) {
          setCurrentLog(message.humanReadable);
        }

        // Handle errors
        if (message.error) {
          setError(message.error);
          showNotification({
            type: "error",
            title: "Pod Creation Error",
            message: message.error,
          });
        } else if (message.type === "end") {
          // Handle completion
          showNotification({
            type: "success",
            title: "Pod Creation Complete",
            message: "Your pod has been successfully created.",
          });
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    });

    // Update the last processed index
    lastProcessedIndex.current = messages.length;
  }, [messages, showNotification, progressControls]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-primary text-neutral p-4">
      {/* Header Section */}
      <Header />

      {/* Progress and Log Sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-xl"
      >
        {/* Progress Section */}
        <ProgressSection
          currentStep={currentStep}
          steps={STEPS}
          progressControls={progressControls}
        />

        {/* Log Section */}
        <LogSection currentLog={currentLog} error={error} />
      </motion.div>
    </div>
  );
};

export default PodCreation;
