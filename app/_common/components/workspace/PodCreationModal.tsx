import React, { useState, useCallback, useEffect } from "react";
import Button from "@/_common/components/Button";
import ProgressDots from "@/_common/components/ProgressDots";
import VCSSelection from "./steps/VCSSelection";
import RepositorySelection from "./steps/RepositorySelection";
import PodInitializer from "./steps/PodInitializer";
import Configuration from "./steps/Configuration";
import ReviewSetup from "./steps/ReviewSetup";
import PodCreation from "./steps/PodCreation";
import { CodeOutlined, ChevronRight } from "@mui/icons-material";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import { AnimatePresence, motion } from "framer-motion";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";
import useCreatePod from "@/hooks/useCreatePod";

// Define the props for the PodCreationModal component
interface PodCreationModalProps {
  onClose: () => void;
}

// Define the structure of each step in the modal
interface Step {
  title: string;
  component: React.FC<StepComponentProps>;
}

// Props for step components that require a completion callback
interface StepComponentProps {
  onComplete?: (success: boolean) => void;
}

// Enum to represent each step index for better readability
enum StepIndex {
  VCSIntegration = 0,
  RepositorySelection,
  EnvironmentSetup,
  Configuration,
  // Review, // Uncomment if Review step is needed
  CreatingPod,
}

// Define the steps involved in pod creation
const steps: Step[] = [
  { title: "VCS Integration", component: VCSSelection },
  { title: "Repository Selection", component: RepositorySelection },
  { title: "Pod Initializer", component: PodInitializer },
  { title: "Configuration", component: Configuration },
  // { title: "Review", component: ReviewSetup }, // Uncomment if Review step is needed
  { title: "Creating Pod", component: PodCreation },
];

/**
 * Header component displaying the navigation path and current step title.
 */
const PodCreationHeader: React.FC<{ currentStep: number }> = ({
  currentStep,
}) => (
  <div className="border-b border-gray-700 min-h-[54px] h-[54px] px-6 flex justify-between items-center">
    <div className="flex items-center text-[11px] text-gray-400">
      <CodeOutlined fontSize="small" className="mr-2" />
      <span>Team - Engineering</span>
      <ChevronRight fontSize="small" className="mx-2" />
      <span>Virtual Pods</span>
      <ChevronRight fontSize="small" className="mx-2" />
      <span>New Pod</span>
      <ChevronRight fontSize="small" className="mx-2" />
      <span className="text-tertiaryBorder">{steps[currentStep].title}</span>
    </div>
  </div>
);

/**
 * Footer component containing navigation buttons and progress indicators.
 */
const PodCreationFooter: React.FC<{
  currentStep: number;
  totalSteps: number;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  isNextEnabled: boolean;
}> = ({
  currentStep,
  totalSteps,
  isLastStep,
  onBack,
  onNext,
  isNextEnabled,
}) => (
  <div className="border-t border-gray-700 min-h-[54px] h-[54px] px-6 flex items-center justify-between">
    <Button
      text="Back"
      size="small"
      type="button"
      colorType="secondary"
      handleClick={onBack}
      disabled={currentStep === StepIndex.VCSIntegration || isLastStep}
    />
    <div className="flex-grow flex justify-center">
      <ProgressDots currentStep={currentStep} totalSteps={totalSteps} />
    </div>
    <Button
      text={isLastStep ? "Close" : "Continue"}
      size="small"
      type="button"
      colorType="tertiary"
      handleClick={isLastStep ? onNext : onNext}
      disabled={!isNextEnabled}
    />
  </div>
);

/**
 * Main PodCreationModal component handling the multi-step pod creation process.
 */
const PodCreationModal: React.FC<PodCreationModalProps> = ({ onClose }) => {
  // State variables to manage current step, animation direction, environment setup status, and loading messages
  const [currentStep, setCurrentStep] = useState<StepIndex>(
    StepIndex.VCSIntegration
  );
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isEnvironmentSetupComplete, setIsEnvironmentSetupComplete] =
    useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<string[]>([]);

  // Custom hooks for GitHub integration and pod creation
  const { isConnected, initiateInstall } = useGitHubIntegration();
  const podCreationData = usePodCreationStore((state) => state);
  const { createPod } = useCreatePod();

  /**
   * Initiates the pod creation process and navigates to the PodCreation step.
   */
  const createPodSpace = useCallback(() => {
    setCurrentStep(StepIndex.CreatingPod);
    createPod.mutate(podCreationData);
  }, [createPod, podCreationData]);

  // Current step component based on the currentStep state
  const CurrentStepComponent = steps[currentStep].component;

  /**
   * Effect to handle incoming messages during the pod creation process.
   */
  useEffect(() => {
    if (createPod.isPending) {
      createPod.onMessage = (data: string) => {
        setLoadingMessages((prevMessages) => [...prevMessages, data]);
      };
    }
  }, [createPod.isPending, createPod]);

  /**
   * Handler for the "Next" button click.
   * It manages navigation between steps and initiates pod creation when appropriate.
   */
  const handleNext = useCallback(() => {
    // Handle GitHub installation initiation
    if (
      currentStep === StepIndex.VCSIntegration &&
      podCreationData.vcs === "GitHub" &&
      !isConnected
    ) {
      initiateInstall();
      return;
    }

    // Initiate pod creation on the penultimate step
    if (
      currentStep ===
      StepIndex.Configuration /* Replace with Review step index if needed */
    ) {
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

  /**
   * Handler for the "Back" button click.
   * It navigates to the previous step.
   */
  const handleBack = useCallback(() => {
    if (
      currentStep > StepIndex.VCSIntegration &&
      currentStep < StepIndex.CreatingPod
    ) {
      setDirection(-1);
      setCurrentStep((prevStep) => prevStep - 1);
    }
  }, [currentStep]);

  /**
   * Determines whether the "Next" button should be enabled based on the current step's requirements.
   */
  const isNextEnabled = useCallback(() => {
    switch (currentStep) {
      case StepIndex.VCSIntegration:
        return !!podCreationData.vcs;
      case StepIndex.RepositorySelection:
        return !!podCreationData.repositoryName;
      case StepIndex.EnvironmentSetup:
        return isEnvironmentSetupComplete;
      case StepIndex.Configuration:
        // Add any specific checks for Configuration step if needed
        return true;
      // case StepIndex.Review:
      //   return true; // Or add specific checks
      default:
        return currentStep < steps.length - 1;
    }
  }, [
    currentStep,
    podCreationData.vcs,
    podCreationData.repositoryName,
    isEnvironmentSetupComplete,
  ]);

  /**
   * Callback function to handle completion of the environment setup step.
   */
  const handleEnvironmentSetupComplete = useCallback((success: boolean) => {
    setIsEnvironmentSetupComplete(success);
  }, []);

  // Animation variants for framer-motion
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

  // Transition settings for framer-motion animations
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
      {/* Header Section */}
      <PodCreationHeader currentStep={currentStep} />

      {/* Main Content Area with Animations */}
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
              {currentStep === StepIndex.CreatingPod ? (
                <PodCreation messages={loadingMessages} />
              ) : (
                <CurrentStepComponent
                  onComplete={handleEnvironmentSetupComplete}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Section */}
      <PodCreationFooter
        currentStep={currentStep}
        totalSteps={steps.length}
        isLastStep={isLastStep}
        onBack={handleBack}
        onNext={handleNext}
        isNextEnabled={isNextEnabled()}
      />
    </div>
  );
};

export default PodCreationModal;
