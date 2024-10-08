import React, { useEffect, useState, useRef } from "react";
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

// Type definition for an initialization step
type InitializationStep = {
  name: string;
  key: string;
};

// Define the steps for pod initialization
const INITIALIZATION_STEPS: InitializationStep[] = [
  { name: "Downloading Repository", key: "cloning" },
  { name: "Processing Repository", key: "processing" },
  { name: "Analyzing Repository", key: "analyzing" },
];

// Flag to control display of environment analysis data
const SHOW_ENVIRONMENT_ANALYSIS_DATA = true;

// Props interface for the component
interface PodInitializerProps {
  onComplete: (success: boolean) => void;
}

// Interface for step error information
interface StepError {
  stepKey: string;
  message: string;
}

const PodInitializer: React.FC<PodInitializerProps> = ({ onComplete }) => {
  // Access global state from the pod creation store
  const {
    repositoryName,
    repositoryURL,
    environmentAnalysis,
    setRepositoryDir,
    setEnvironmentAnalysis,
  } = usePodCreationStore((state) => state);

  // State variables for managing the initialization process
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [failedStep, setFailedStep] = useState<StepError | null>(null);
  const [stepDurations, setStepDurations] = useState<{ [key: string]: number }>(
    {}
  );
  const [overallStartTime, setOverallStartTime] = useState<number | null>(null);
  const [overallElapsedTime, setOverallElapsedTime] = useState<number>(0);
  const [isProcessComplete, setIsProcessComplete] = useState<boolean>(false);

  // Refs for managing timers and process state
  const hasStartedProcess = useRef<boolean>(false);
  const overallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Custom hooks
  const { generateDockerfile } = useGenerateDockerfile();
  const { showNotification } = useNotificationContext();

  // Start the initialization process when the component mounts and repositoryName is available
  useEffect(() => {
    if (repositoryName && !hasStartedProcess.current) {
      hasStartedProcess.current = true;
      startProcess();
    }
  }, [repositoryName]);

  // Track overall elapsed time
  useEffect(() => {
    if (overallStartTime !== null && !isProcessComplete) {
      // Start the overall timer
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

  // Stop the overall timer when the process is complete
  useEffect(() => {
    if (isProcessComplete && overallTimerRef.current) {
      clearInterval(overallTimerRef.current);
    }
  }, [isProcessComplete]);

  /**
   * Main function to start the initialization process
   */
  const startProcess = async () => {
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
      await executeStep(INITIALIZATION_STEPS[0], cloneRepository);

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
          "Your pod has been initialized and is ready for configuration review",
      });
      onComplete(true);
    } catch (error) {
      // Process failed
      setIsProcessComplete(true);
      onComplete(false);
    }
  };

  /**
   * Execute a single step in the process
   * @param step - The step to execute
   * @param stepFunction - The function that performs the step
   */
  const executeStep = async (
    step: InitializationStep,
    stepFunction: () => Promise<any>
  ) => {
    // Update the current step index
    setCurrentStepIndex(
      INITIALIZATION_STEPS.findIndex((s) => s.key === step.key)
    );
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
      handleStepError(step.key, `Failed to ${step.name.toLowerCase()}.`, error);
      throw error; // Re-throw the error to stop the process
    }
  };

  /**
   * Step 1: Clone the repository
   */
  const cloneRepository = async () => {
    const response = await axios.post("/api/clone-repository", {
      repoFullName: repositoryName,
    });
    setRepositoryDir(response.data.repoDir);
    return response.data.repoDir;
  };

  /**
   * Step 2: Process the repository
   */
  const processRepository = async () => {
    const response = await axios.post("/api/process-repository", {
      repositoryURL,
    });
    return { mergedRepositoryFile: response.data.mergedRepositoryFile };
  };

  /**
   * Step 3: Generate workspace data
   * @param mergedRepositoryFile - The merged repository file from the previous step
   */
  const generateWorkspaceData = async (mergedRepositoryFile: string) => {
    const analysisData = await generateDockerfile({
      mergedRepositoryFile,
      repositoryURL,
    });
    setEnvironmentAnalysis(analysisData);
  };

  /**
   * Handle errors that occur during steps
   * @param stepKey - The key of the step where the error occurred
   * @param defaultMessage - Default error message
   * @param error - The error object
   */
  const handleStepError = (
    stepKey: string,
    defaultMessage: string,
    error: any
  ) => {
    const errorMessage = error.response?.data?.error || defaultMessage;
    setFailedStep({ stepKey, message: errorMessage });
    showNotification({
      type: "error",
      title: "Error",
      message: errorMessage,
    });
    setIsProcessComplete(true);
    onComplete(false);
  };

  /**
   * Check if environment analysis is complete
   * @param analysis - The environment analysis data
   * @returns True if the analysis is complete, false otherwise
   */
  const isEnvironmentAnalysisComplete = (
    analysis: EnvironmentAnalysisData | null
  ): boolean => {
    return !!analysis?.dockerfile;
  };

  /**
   * Render the icon for each step
   * @param stepKey - The key of the step
   * @param index - The index of the step
   */
  const renderStepIcon = (stepKey: string, index: number) => {
    const iconClass = "text-xl";
    if (failedStep?.stepKey === stepKey) {
      // Step failed
      return (
        <FontAwesomeIcon
          icon={faTimesCircle}
          className={`${iconClass} text-red-500`}
        />
      );
    } else if (completedSteps.includes(stepKey)) {
      // Step completed successfully
      return (
        <FontAwesomeIcon
          icon={faCheckCircle}
          className={`${iconClass} text-green-500 animate-checkmark`}
        />
      );
    } else if (currentStepIndex === index && !failedStep) {
      // Current step in progress
      return (
        <FontAwesomeIcon
          icon={faCircleNotch}
          className={`${iconClass} text-blue-500 animate-spin`}
        />
      );
    } else {
      // Step not yet started
      return (
        <div
          className={`${iconClass} h-5 w-5 border border-gray-500 rounded-full`}
        />
      );
    }
  };

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      {/* Header section */}
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

      {/* Steps display section */}
      <div className="mb-6">
        {INITIALIZATION_STEPS.map((step, index) => (
          <div key={step.key} className="flex items-center mb-4">
            {renderStepIcon(step.key, index)}
            <div className="ml-4 flex flex-col">
              <span className="text-white text-sm">{step.name}</span>
              <span className="text-gray-400 text-xs">
                Duration: {stepDurations[step.key]?.toFixed(0) || 0} seconds
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Error message display */}
      {failedStep && (
        <div className="mb-6">
          <p className="text-red-500 text-sm">
            Error in{" "}
            {
              INITIALIZATION_STEPS.find((s) => s.key === failedStep.stepKey)
                ?.name
            }
            : {failedStep.message}
          </p>
        </div>
      )}

      {/* Completion message display */}
      {isProcessComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex items-center ${
            failedStep ? "text-red-400" : "text-green-400"
          } mb-6`}
        >
          <FontAwesomeIcon
            icon={failedStep ? faExclamationTriangle : faRocket}
            className="mr-2"
          />
          <span className="text-sm font-medium">
            {failedStep
              ? "Setup Failed"
              : "Setup Complete: Your workspace is ready to use!"}
          </span>
        </motion.div>
      )}

      {/* Environment analysis data display (if enabled) */}
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
