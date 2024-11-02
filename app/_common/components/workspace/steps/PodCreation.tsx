import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import IntraLogo from "@/_assets/intra-icon-large-transparent.png";

interface PodCreationMessage {
  type?: "overall" | "end" | string;
  step?: number;
  humanReadable?: string;
  error?: string;
}

interface PodCreationProps {
  messages: PodCreationMessage[];
}

const STEPS = [
  "Initializing",
  "Authenticating",
  "Building Workspace",
  "Pushing Workspace",
];

const PodCreation: React.FC<PodCreationProps> = ({ messages }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentMessage, setCurrentMessage] = useState<string>(
    "Preparing your workspace..."
  );

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (
        latestMessage.type === "overall" &&
        latestMessage.step !== undefined
      ) {
        setCurrentStep(latestMessage.step);
      }
      if (latestMessage.humanReadable) {
        setCurrentMessage(latestMessage.humanReadable);
      }
    }
  }, [messages]);

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

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
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span className="font-semibold">{STEPS[currentStep]}</span>
            <span className="text-accent">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <div className="bg-secondary h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-tertiary h-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-md font-medium text-gray-400 tracking-wide"
              style={{
                textShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
              }}
            >
              {currentMessage}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PodCreation;
