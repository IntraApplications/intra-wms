import React, { useState, useCallback, useEffect } from "react";
import Button from "@/_common/components/Button";
import ProgressDots from "@/_common/components/ProgressDots";
import VCSSelection from "./steps/VCSSelection";
import RepositorySelection from "./steps/RepositorySelection";
import EnvironmentSetup from "./steps/PodInitializer";
import Configuration from "./steps/Configuration";
import ReviewSetup from "./steps/ReviewSetup";
import LoadingPage from "./steps/LoadingPage";
import { CodeOutlined, ChevronRight } from "@mui/icons-material";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import { AnimatePresence, motion } from "framer-motion";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";
import useCreatePod from "@/hooks/useCreatePod";

interface PodCreationModalProps {
  onClose: () => void;
}

const steps = [
  { title: "VCS Integration", component: VCSSelection },
  { title: "Repository Selection", component: RepositorySelection },
  { title: "Environment Setup", component: EnvironmentSetup },
  { title: "Configuration", component: Configuration },
  //{ title: "Review", component: ReviewSetup },
  { title: "Creating Pod", component: LoadingPage },
];

const PodCreationModal: React.FC<PodCreationModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isEnvironmentSetupComplete, setIsEnvironmentSetupComplete] =
    useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<any[]>([]);

  const { isConnected, initiateInstall } = useGitHubIntegration();
  const podCreationData = usePodCreationStore((state) => state);
  const { createPod } = useCreatePod();

  const createPodSpace = useCallback(() => {
    setCurrentStep(steps.length - 1); // Move to the LoadingPage step
    createPod.mutate(podCreationData);
  }, [createPod, podCreationData]);

  const CurrentStepComponent = steps[currentStep].component;
  useEffect(() => {
    console.log("IS LOADINGGGG");
    if (createPod.isPending) {
      console.log(createPod.isPending);

      createPod.onMessage = (data: any) => {
        console.log("MESSAGEFDSFSDFDS");

        console.log(data);
        setLoadingMessages((prevMessages) => [...prevMessages, data]);
      };
    }
  }, [createPod.isPending]);

  const handleNext = useCallback(() => {
    if (currentStep === 0 && podCreationData.vcs === "GitHub" && !isConnected) {
      initiateInstall();
      return;
    }
    if (currentStep === steps.length - 2) {
      createPodSpace();
    } else if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      onClose();
    }
  }, [
    currentStep,
    podCreationData.vcs,
    isConnected,
    initiateInstall,
    createPodSpace,
    onClose,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 0 && currentStep < steps.length - 1) {
      setDirection(-1);
      setCurrentStep((prevStep) => prevStep - 1);
    }
  }, [currentStep]);

  const isNextEnabled = useCallback(() => {
    if (currentStep === 0) {
      return !!podCreationData.vcs;
    } else if (currentStep === 1) {
      return !!podCreationData.repositoryName;
    } else if (currentStep === 2) {
      return isEnvironmentSetupComplete;
    }
    return currentStep < steps.length - 1;
  }, [
    currentStep,
    podCreationData.vcs,
    podCreationData.repositoryName,
    isEnvironmentSetupComplete,
  ]);

  const handleEnvironmentSetupComplete = useCallback((success: boolean) => {
    setIsEnvironmentSetupComplete(success);
  }, []);

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

  const isLastStep = currentStep === steps.length - 1;

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
              {currentStep === steps.length - 1 ? (
                <LoadingPage messages={loadingMessages} />
              ) : (
                <CurrentStepComponent
                  onComplete={handleEnvironmentSetupComplete}
                />
              )}
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
          disabled={currentStep === 0 || isLastStep}
        />
        <div className="flex-grow flex justify-center">
          <ProgressDots currentStep={currentStep} totalSteps={steps.length} />
        </div>
        <Button
          text={isLastStep ? "Close" : "Continue"}
          size="small"
          type="button"
          colorType="tertiary"
          handleClick={isLastStep ? onClose : handleNext}
          disabled={!isNextEnabled()}
        />
      </div>
    </div>
  );
};

export default PodCreationModal;
