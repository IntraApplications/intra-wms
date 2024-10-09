// PodInitializer.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleNotch,
  faTimesCircle,
  faRocket,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

import { useGenerateDockerfile } from "@/hooks/useGenerateDockerfile";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";
import { EnvironmentAnalysisData } from "@/stores/podCreationStore";

// Type definitions

/**
 * Represents a single initialization step.
 */
interface InitializationStep {
  name: string;
  key: string;
}

/**
 * Represents the props for the PodInitializer component.
 */
interface PodInitializerProps {
  onComplete: (success: boolean) => void;
}

/**
 * Represents error information for a failed step.
 */
interface StepError {
  stepKey: string;
  message: string;
}

/**
 * Represents the data returned after processing the repository.
 */
interface ProcessRepositoryResult {
  mergedRepositoryFile: string;
}

/**
 * Represents the data returned after cloning the repository.
 */
interface CloneRepositoryResult {
  repoDir: string;
}

/**
 * Represents the duration information for each step.
 */
interface StepDurations {
  [key: string]: number;
}

// Constants

/**
 * Defines the steps involved in pod initialization.
 */
const INITIALIZATION_STEPS: InitializationStep[] = [
  { name: "Downloading Repository", key: "cloning" },
  { name: "Processing Repository", key: "processing" },
  { name: "Analyzing Repository", key: "analyzing" },
];

/**
 * Flag to control the display of environment analysis data.
 */
const SHOW_ENVIRONMENT_ANALYSIS_DATA = false;

// Sub-components

/**
 * Represents a single initialization step item in the UI.
 */
interface InitializationStepItemProps {
  step: InitializationStep;
  isCompleted: boolean;
  isCurrent: boolean;
  isFailed: boolean;
  duration: number;
}

const InitializationStepItem: React.FC<InitializationStepItemProps> =
  React.memo(({ step, isCompleted, isCurrent, isFailed, duration }) => {
    /**
     * Renders the appropriate icon based on the step status.
     */
    const renderStepIcon = () => {
      if (isFailed) {
        return (
          <FontAwesomeIcon
            icon={faTimesCircle}
            className="text-red-500 text-xl"
          />
        );
      } else if (isCompleted) {
        return (
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 text-xl animate-checkmark"
          />
        );
      } else if (isCurrent) {
        return (
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="text-blue-500 text-xl animate-spin"
          />
        );
      } else {
        return (
          <div className="h-5 w-5 border border-gray-500 rounded-full text-xl" />
        );
      }
    };

    return (
      <div className="flex items-center mb-4">
        {renderStepIcon()}
        <div className="ml-4 flex flex-col">
          <span className="text-white text-sm">{step.name}</span>
          <span className="text-gray-400 text-xs">
            Duration: {duration.toFixed(0)} seconds
          </span>
        </div>
      </div>
    );
  });

/**
 * Represents the completion message after the initialization process.
 */
interface CompletionMessageProps {
  isSuccess: boolean;
  elapsedTime: number;
}

const CompletionMessage: React.FC<CompletionMessageProps> = React.memo(
  ({ isSuccess, elapsedTime }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center ${
        isSuccess ? "text-green-400" : "text-red-400"
      } mb-6`}
    >
      <FontAwesomeIcon
        icon={isSuccess ? faRocket : faExclamationTriangle}
        className="mr-2"
      />
      <span className="text-sm font-medium">
        {isSuccess
          ? "Setup Complete: Your workspace is ready to configure!"
          : "Setup Failed"}
      </span>
    </motion.div>
  )
);

// Main Component

/**
 * PodInitializer Component
 * Manages the initialization process of a pod by executing predefined steps.
 */
const PodInitializer: React.FC<PodInitializerProps> = ({ onComplete }) => {
  // Accessing global state from the pod creation store
  const {
    repositoryName,
    repositoryURL,
    environmentAnalysis,
    setRepositoryDir,
    setEnvironmentAnalysis,
  } = usePodCreationStore((state) => state);

  // Accessing custom hooks
  const { generateDockerfile } = useGenerateDockerfile();
  const { showNotification } = useNotificationContext();

  // State variables for managing the initialization process
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [failedStep, setFailedStep] = useState<StepError | null>(null);
  const [stepDurations, setStepDurations] = useState<StepDurations>({});
  const [overallStartTime, setOverallStartTime] = useState<number | null>(null);
  const [overallElapsedTime, setOverallElapsedTime] = useState<number>(0);
  const [isProcessComplete, setIsProcessComplete] = useState<boolean>(false);

  // Refs for managing timers and process state
  const hasStartedProcess = useRef<boolean>(false);
  const overallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to start the initialization process when the component mounts and repositoryName is available
  useEffect(() => {
    if (repositoryName && !hasStartedProcess.current) {
      hasStartedProcess.current = true;
      startProcess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryName]); // Ignoring dependencies as startProcess is defined below

  // Effect to track overall elapsed time
  useEffect(() => {
    if (overallStartTime !== null && !isProcessComplete) {
      overallTimerRef.current = setInterval(() => {
        setOverallElapsedTime((Date.now() - overallStartTime) / 1000);
      }, 1000);
    }

    // Cleanup function to clear the timer when component unmounts
    return () => {
      if (overallTimerRef.current) {
        clearInterval(overallTimerRef.current);
      }
    };
  }, [overallStartTime, isProcessComplete]);

  // Effect to stop the overall timer when the process is complete
  useEffect(() => {
    if (isProcessComplete && overallTimerRef.current) {
      clearInterval(overallTimerRef.current);
    }
  }, [isProcessComplete]);

  /**
   * Starts the pod initialization process by executing each step sequentially.
   */
  const startProcess = useCallback(async () => {
    // Reset all state variables for a fresh start
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setFailedStep(null);
    setStepDurations({});
    setOverallElapsedTime(0);
    setIsProcessComplete(false);
    setOverallStartTime(Date.now());

    try {
      // Execute each step sequentially
      const repoDir = await executeStep(
        INITIALIZATION_STEPS[0],
        cloneRepository
      );
      const scannedRepoData = await executeStep(
        INITIALIZATION_STEPS[1],
        processRepository
      );
      await executeStep(INITIALIZATION_STEPS[2], () =>
        generateWorkspaceData(scannedRepoData.mergedRepositoryFile)
      );

      // Process completed successfully
      setIsProcessComplete(true);
      showNotification({
        type: "success",
        title: "Pod Initialization Complete",
        message:
          "Your pod has been initialized and is ready for configuration review.",
      });
      onComplete(true);
    } catch (error) {
      // Process failed
      setIsProcessComplete(true);
      // The error handling is done within executeStep
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies are managed within executeStep

  /**
   * Executes a single step in the initialization process.
   * @param step - The step to execute.
   * @param stepFunction - The function that performs the step.
   * @returns The result of the stepFunction.
   */
  const executeStep = useCallback(
    async (
      step: InitializationStep,
      stepFunction: () => Promise<any>
    ): Promise<any> => {
      // Update the current step index
      const stepIndex = INITIALIZATION_STEPS.findIndex(
        (s) => s.key === step.key
      );
      setCurrentStepIndex(stepIndex);

      const stepStartTime = Date.now();

      // Start the step timer to track duration
      stepTimerRef.current = setInterval(() => {
        setStepDurations((prevDurations) => ({
          ...prevDurations,
          [step.key]: (Date.now() - stepStartTime) / 1000,
        }));
      }, 1000);

      try {
        // Execute the step function
        const result = await stepFunction();

        // Mark the step as completed
        setCompletedSteps((prevSteps) => [...prevSteps, step.key]);

        // Clear the step timer
        if (stepTimerRef.current) {
          clearInterval(stepTimerRef.current);
        }

        // Set final duration for the step
        setStepDurations((prevDurations) => ({
          ...prevDurations,
          [step.key]: (Date.now() - stepStartTime) / 1000,
        }));

        return result;
      } catch (error) {
        // Clear the step timer in case of error
        if (stepTimerRef.current) {
          clearInterval(stepTimerRef.current);
        }

        // Set final duration for the failed step
        setStepDurations((prevDurations) => ({
          ...prevDurations,
          [step.key]: (Date.now() - stepStartTime) / 1000,
        }));

        // Handle the step error
        handleStepError(
          step.key,
          `Failed to ${step.name.toLowerCase()}.`,
          error
        );
        throw error; // Re-throw the error to stop the process
      }
    },
    []
  );

  /**
   * Clones the repository.
   * @returns The directory of the cloned repository.
   */
  const cloneRepository =
    useCallback(async (): Promise<CloneRepositoryResult> => {
      const response = await axios.post("/api/clone-repository", {
        repoFullName: repositoryName,
      });
      setRepositoryDir(response.data.repoDir);
      return response.data.repoDir;
    }, [repositoryName, setRepositoryDir]);

  /**
   * Processes the cloned repository.
   * @returns The merged repository file data.
   */
  const processRepository =
    useCallback(async (): Promise<ProcessRepositoryResult> => {
      const response = await axios.post("/api/process-repository", {
        repositoryURL,
      });
      return { mergedRepositoryFile: response.data.mergedRepositoryFile };
    }, [repositoryURL]);

  /**
   * Generates workspace data based on the processed repository.
   * @param mergedRepositoryFile - The merged repository file from the processing step.
   */
  const generateWorkspaceData = useCallback(
    async (mergedRepositoryFile: string) => {
      const analysisData = await generateDockerfile({
        mergedRepositoryFile,
        repositoryURL,
      });
      setEnvironmentAnalysis(analysisData);
    },
    [generateDockerfile, repositoryURL, setEnvironmentAnalysis]
  );

  /**
   * Handles errors that occur during step execution.
   * @param stepKey - The key of the step where the error occurred.
   * @param defaultMessage - The default error message.
   * @param error - The error object.
   */
  const handleStepError = useCallback(
    (stepKey: string, defaultMessage: string, error: any) => {
      const errorMessage = error.response?.data?.error || defaultMessage;
      setFailedStep({ stepKey, message: errorMessage });
      showNotification({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
      setIsProcessComplete(true);
      onComplete(false);
    },
    [showNotification, onComplete]
  );

  /**
   * Determines if the environment analysis is complete.
   * @param analysis - The environment analysis data.
   * @returns True if the analysis is complete, otherwise false.
   */
  const isEnvironmentAnalysisComplete = useCallback(
    (analysis: EnvironmentAnalysisData | null): boolean => {
      return !!analysis?.dockerfile;
    },
    []
  );

  /**
   * Renders the appropriate icon for each initialization step.
   * @param stepKey - The key of the step.
   * @param index - The index of the step.
   * @returns A JSX element representing the step icon.
   */
  const renderStepIcon = useCallback(
    (stepKey: string, index: number): JSX.Element => {
      const isFailed = failedStep?.stepKey === stepKey;
      const isCompleted = completedSteps.includes(stepKey);
      const isCurrent = currentStepIndex === index && !isFailed;

      if (isFailed) {
        return (
          <FontAwesomeIcon
            icon={faTimesCircle}
            className="text-red-500 text-xl"
          />
        );
      } else if (isCompleted) {
        return (
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 text-xl animate-checkmark"
          />
        );
      } else if (isCurrent) {
        return (
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="text-blue-500 text-xl animate-spin"
          />
        );
      } else {
        return (
          <div className="h-5 w-5 border border-gray-500 rounded-full text-xl" />
        );
      }
    },
    [completedSteps, currentStepIndex, failedStep]
  );

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white mb-4">
          Pod Initialization
        </h1>
        <p className="text-gray-400 text-[13px]">
          Initializing your pod. Please wait while we complete the steps below.
        </p>
        {overallStartTime !== null && (
          <p className="text-gray-400 text-sm mt-2">
            Total Elapsed Time: {overallElapsedTime.toFixed(0)} seconds
          </p>
        )}
      </div>

      {/* Steps Display Section */}
      <div className="mb-6">
        {INITIALIZATION_STEPS.map((step, index) => (
          <InitializationStepItem
            key={step.key}
            step={step}
            isCompleted={completedSteps.includes(step.key)}
            isCurrent={currentStepIndex === index && !failedStep}
            isFailed={failedStep?.stepKey === step.key}
            duration={stepDurations[step.key] || 0}
          />
        ))}
      </div>

      {/* Error Message Display */}
      {failedStep && (
        <div className="mb-6">
          <p className="text-red-500 text-sm">
            Error in{" "}
            {INITIALIZATION_STEPS.find((s) => s.key === failedStep.stepKey)
              ?.name || "a step"}
            : {failedStep.message}
          </p>
        </div>
      )}

      {/* Completion Message Display */}
      {isProcessComplete && (
        <CompletionMessage
          isSuccess={!failedStep}
          elapsedTime={overallElapsedTime}
        />
      )}

      {/* Environment Analysis Data Display */}
      {SHOW_ENVIRONMENT_ANALYSIS_DATA &&
        isEnvironmentAnalysisComplete(environmentAnalysis) && (
          <div className="bg-dashboard border border-border rounded-[5px] p-4 mb-6">
            <h2 className="text-white text-lg font-semibold mb-4">
              Pod Environment Analysis
            </h2>
            <div className="text-gray-400 text-sm space-y-2">
              <p>
                <strong className="text-white">Project Type:</strong>{" "}
                {environmentAnalysis.projectType}
              </p>
              <p>
                <strong className="text-white">Language Version:</strong>{" "}
                {environmentAnalysis.languageVersion}
              </p>
              <p>
                <strong className="text-white">Dependencies:</strong>{" "}
                {environmentAnalysis.dependencies.join(", ")}
              </p>
              {environmentAnalysis.environmentVariables && (
                <p>
                  <strong className="text-white">Environment Variables:</strong>{" "}
                  {environmentAnalysis.environmentVariables.join(", ")}
                </p>
              )}
              {environmentAnalysis.notes && (
                <p>
                  <strong className="text-white">Notes:</strong>{" "}
                  {environmentAnalysis.notes}
                </p>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-white text-md font-semibold mb-2">
                Dockerfile
              </h3>
              <pre className="bg-gray-800 text-gray-300 p-4 rounded-md overflow-x-auto text-sm">
                {environmentAnalysis.dockerfile}
              </pre>
            </div>
            {overallElapsedTime > 0 && (
              <p className="text-gray-400 text-sm mt-4">
                Total Setup Time: {overallElapsedTime.toFixed(0)} seconds
              </p>
            )}
          </div>
        )}
    </div>
  );
};

export default PodInitializer;
