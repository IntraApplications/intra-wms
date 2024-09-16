// PodCreationModal.tsx
import React, { useState, useCallback } from "react";
import Button from "@/_common/components/Button";
import ProgressDots from "@/_common/components/ProgressDots";
import VCSSelection from "./steps/VCSSelection";
import RepositorySelection from "./steps/RepositorySelection";
import EnvironmentSetup from "./steps/EnvironmentSetup";
import Configuration from "./steps/Configuration";
import ReviewSetup from "./steps/ReviewSetup";
import { CodeOutlined, ChevronRight } from "@mui/icons-material";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import { AnimatePresence, motion } from "framer-motion";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

interface PodCreationModalProps {
  onClose: () => void;
}

const steps = [
  { title: "VCS Integration", component: VCSSelection },
  { title: "Repository Selection", component: RepositorySelection },
  { title: "Environment Setup", component: EnvironmentSetup },
  { title: "Configuration", component: Configuration },
  { title: "Review", component: ReviewSetup },
];

const PodCreationModal: React.FC<PodCreationModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 for forward, -1 for backward
  const [isEnvironmentSetupComplete, setIsEnvironmentSetupComplete] =
    useState<boolean>(false);

  const { isConnected, initiateInstall } = useGitHubIntegration();

  const vcs = usePodCreationStore((state) => state.vcs);
  const repositoryName = usePodCreationStore((state) => state.repositoryName);

  const handleNext = useCallback(() => {
    if (currentStep === 0 && vcs === "GitHub" && !isConnected) {
      initiateInstall();
      return;
    }
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      onClose();
    }
  }, [currentStep, vcs, isConnected, initiateInstall, onClose]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prevStep) => prevStep - 1);
    }
  }, [currentStep]);

  const CurrentStepComponent = steps[currentStep].component;

  const isNextEnabled = useCallback(() => {
    if (currentStep === 0) {
      return !!vcs;
    } else if (currentStep === 1) {
      return !!repositoryName;
    } else if (currentStep === 2) {
      return isEnvironmentSetupComplete;
    }
    return true;
  }, [currentStep, vcs, repositoryName, isEnvironmentSetupComplete]);

  const handleEnvironmentSetupComplete = useCallback((success: boolean) => {
    setIsEnvironmentSetupComplete(success);
  }, []);

  // Animation variants for Framer Motion
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const transition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 },
  };

  return (
    <div
      className="bg-primary rounded-[5px] border border-border overflow-hidden flex flex-col pod-modal"
      style={{
        width: "800px",
        height: "650px",
      }}
    >
      <div className="border-b border-gray-700 min-h-[54px] h-[54px] px-6 flex justify-between items-center">
        <div className="flex items-center text-[11px] text-gray-400">
          <CodeOutlined fontSize="small" className="mr-2" />
          <span>Team - Engineering</span>
          <ChevronRight fontSize="small" className="mx-2" />
          <span>Virtual Pods</span>
          <ChevronRight fontSize="small" className="mx-2" />
          <span>New Pod</span>
          <ChevronRight fontSize="small" className="mx-2" />
          <span className="text-tertiaryBorder">
            {steps[currentStep].title}
          </span>
        </div>
      </div>
      <div className="flex-grow overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 flex flex-col"
          >
            <div className="p-6 flex-grow overflow-y-auto">
              <CurrentStepComponent
                onComplete={handleEnvironmentSetupComplete}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="border-t border-gray-700 min-h-[54px] h-[54px] px-6 flex items-center justify-between">
        <Button
          text="Back"
          size="small"
          type="button"
          colorType="secondary"
          handleClick={handleBack}
          disabled={currentStep === 0}
        />
        <div className="flex-grow flex justify-center">
          <ProgressDots currentStep={currentStep} totalSteps={steps.length} />
        </div>
        <Button
          text={currentStep === steps.length - 1 ? "Create" : "Continue"}
          size="small"
          type="button"
          colorType="tertiary"
          handleClick={handleNext}
          disabled={!isNextEnabled()}
        />
      </div>
    </div>
  );
};

export default PodCreationModal;
