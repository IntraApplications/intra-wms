import React, { useEffect, useState, useRef } from "react";
import { useRepositoryAnalysis } from "@/hooks/useRepositoryAnalysis";
import { useNotificationContext } from "@/contexts/NotificationContext";
import Button from "@/_common/components/Button";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleNotch,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

interface EnvironmentSetupProps {
  onComplete: (success: boolean) => void;
}

interface StepError {
  stepKey: string;
  message: string;
}

const steps = [
  { name: "Cloning Repository", key: "cloning" },
  { name: "Processing Repository", key: "processing" },
  { name: "Analyzing Repository", key: "analyzing" },
];

const EnvironmentSetup: React.FC<EnvironmentSetupProps> = ({ onComplete }) => {
  const repositoryName = usePodCreationStore((state) => state.repositoryName);
  const setRepoDir = usePodCreationStore((state) => state.setRepoDir);
  const setEnvironmentAnalysis = usePodCreationStore(
    (state) => state.setEnvironmentAnalysis
  );

  const setVCS = usePodCreationStore((state) => state.setVCS);

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [failedStep, setFailedStep] = useState<StepError | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const { analyzeRepository } = useRepositoryAnalysis();
  const { showNotification } = useNotificationContext();

  const [stepDurations, setStepDurations] = useState<{ [key: string]: number }>(
    {}
  );
  const [stepTimers, setStepTimers] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});
  const [overallStartTime, setOverallStartTime] = useState<number | null>(null);
  const [overallElapsedTime, setOverallElapsedTime] = useState<number>(0);

  const hasStartedProcess = useRef(false);

  useEffect(() => {
    if (repositoryName && !hasStartedProcess.current) {
      hasStartedProcess.current = true;
      startProcess();
    }
  }, [repositoryName]);

  useEffect(() => {
    let overallTimer: NodeJS.Timeout | null = null;
    if (overallStartTime !== null) {
      overallTimer = setInterval(() => {
        setOverallElapsedTime((Date.now() - overallStartTime) / 1000);
      }, 1000);
    }
    return () => {
      if (overallTimer) {
        clearInterval(overallTimer);
      }
    };
  }, [overallStartTime]);

  const startProcess = async () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setFailedStep(null);
    setAnalysisResult(null);
    setStepDurations({});
    setOverallElapsedTime(0);
    setOverallStartTime(Date.now());

    try {
      // Step 1: Clone the repository
      const repoDir = await executeStep(steps[0], cloneRepository);

      // Step 2: Process the repository
      const processData = await executeStep(steps[1], () =>
        processRepository(repoDir)
      );

      // Step 3: Analyze the repository
      await executeStep(steps[2], () =>
        analyzeRepo(processData.repoDir, processData.outputFilePath)
      );

      showNotification({
        type: "success",
        title: "Environment Setup Complete",
        message: "Workspace environment is ready.",
      });

      // Notify parent component that setup is complete
      onComplete(true);
    } catch (error) {
      // Notify parent component that setup failed
      onComplete(false);
    }
  };

  const executeStep = async (
    step: { name: string; key: string },
    stepFunction: () => Promise<any>
  ) => {
    setCurrentStep(steps.findIndex((s) => s.key === step.key));

    // Initialize step duration and start timer
    setStepDurations((prev) => ({ ...prev, [step.key]: 0 }));
    const stepStartTime = Date.now();

    const timer = setInterval(() => {
      setStepDurations((prev) => ({
        ...prev,
        [step.key]: (Date.now() - stepStartTime) / 1000,
      }));
    }, 1000);

    setStepTimers((prev) => ({ ...prev, [step.key]: timer }));

    try {
      const result = await stepFunction();
      setCompletedSteps((prev) => [...prev, step.key]);

      // Clear timer and record final duration
      clearInterval(timer);
      setStepDurations((prev) => ({
        ...prev,
        [step.key]: (Date.now() - stepStartTime) / 1000,
      }));
      return result;
    } catch (error) {
      // Clear timer and record final duration
      clearInterval(timer);
      setStepDurations((prev) => ({
        ...prev,
        [step.key]: (Date.now() - stepStartTime) / 1000,
      }));
      throw error;
    }
  };

  const cloneRepository = async () => {
    try {
      const response = await axios.post("/api/clone-repository", {
        repoFullName: repositoryName,
      });
      // Store repoDir for subsequent steps
      const repoDir = response.data.repoDir;
      setRepoDir(repoDir);
      return repoDir; // Return repoDir for the next step
    } catch (error) {
      setFailedStep({
        stepKey: steps[0].key,
        message: error.response?.data?.error || "Failed to clone repository.",
      });
      showNotification({
        type: "error",
        title: "Cloning Failed",
        message:
          error.response?.data?.error || "An error occurred while cloning.",
      });
      onComplete(false);
      throw error;
    }
  };

  const processRepository = async (repoDir: string) => {
    try {
      const response = await axios.post("/api/process-repository", {
        repoDir, // Use the repoDir passed as a parameter
      });
      return {
        repoDir: response.data.repoDir,
        outputFilePath: response.data.outputFilePath,
      };
    } catch (error) {
      setFailedStep({
        stepKey: steps[1].key,
        message: error.response?.data?.error || "Failed to process repository.",
      });
      showNotification({
        type: "error",
        title: "Processing Failed",
        message:
          error.response?.data?.error || "An error occurred during processing.",
      });
      onComplete(false);
      throw error;
    }
  };

  const analyzeRepo = async (repoDir: string, outputFilePath: string) => {
    try {
      const analysisData = await analyzeRepository(repoDir, outputFilePath);
      setAnalysisResult(analysisData);
      setEnvironmentAnalysis(analysisData);
    } catch (error) {
      setFailedStep({
        stepKey: steps[2].key,
        message: error.response?.data?.error || "Failed to analyze repository.",
      });
      showNotification({
        type: "error",
        title: "Analysis Failed",
        message:
          error.response?.data?.error || "An error occurred during analysis.",
      });
      onComplete(false);
      throw error;
    }
  };

  const renderStepIcon = (stepKey: string, index: number) => {
    if (failedStep?.stepKey === stepKey) {
      return (
        <FontAwesomeIcon
          icon={faTimesCircle}
          className={`${iconSizeClass} text-red-500`}
        />
      );
    } else if (completedSteps.includes(stepKey)) {
      return (
        <FontAwesomeIcon
          icon={faCheckCircle}
          className={`${iconSizeClass} text-green-500 animate-checkmark`}
        />
      );
    } else if (currentStep === index && !failedStep) {
      return (
        <FontAwesomeIcon
          icon={faCircleNotch}
          className={`${iconSizeClass} text-blue-500 animate-spin`}
        />
      );
    } else {
      return (
        <div
          className={`${iconSizeClass} h-5 w-5 border border-gray-500 rounded-full`}
        />
      );
    }
  };

  const iconSizeClass = "text-xl"; // Adjusted icon size for consistency

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white mb-4">
          Environment Setup
        </h1>
        <p className="text-gray-400 text-[13px]">
          Setting up your workspace environment. Please wait while we complete
          the steps below.
        </p>
        {overallStartTime !== null && (
          <p className="text-gray-400 text-sm mt-2">
            Total Elapsed Time: {overallElapsedTime.toFixed(0)} seconds
          </p>
        )}
      </div>

      <div className="mb-6">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center mb-4">
            {renderStepIcon(step.key, index)}
            <div className="ml-4 flex flex-col">
              <span className="text-white text-sm">{step.name}</span>
              {stepDurations[step.key] !== undefined && (
                <span className="text-gray-400 text-xs">
                  Duration: {stepDurations[step.key].toFixed(0)} seconds
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {failedStep && (
        <div className="mb-6">
          <p className="text-red-500 text-sm">
            Error in {steps.find((s) => s.key === failedStep.stepKey)?.name}:{" "}
            {failedStep.message}
          </p>
        </div>
      )}

      {analysisResult && (
        <div className="bg-dashboard border border-border rounded-[5px] p-4 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4">
            Environment Analysis
          </h2>
          <div className="text-gray-400 text-sm space-y-2">
            <p>
              <strong className="text-white">Project Type:</strong>{" "}
              {analysisResult.projectType}
            </p>
            <p>
              <strong className="text-white">Language Version:</strong>{" "}
              {analysisResult.languageVersion}
            </p>
            <p>
              <strong className="text-white">Dependencies:</strong>{" "}
              {analysisResult.dependencies.join(", ")}
            </p>
            {analysisResult.environmentVariables && (
              <p>
                <strong className="text-white">Environment Variables:</strong>{" "}
                {analysisResult.environmentVariables.join(", ")}
              </p>
            )}
            {analysisResult.notes && (
              <p>
                <strong className="text-white">Notes:</strong>{" "}
                {analysisResult.notes}
              </p>
            )}
          </div>
          <div className="mt-6">
            <h3 className="text-white text-md font-semibold mb-2">
              Dockerfile
            </h3>
            <pre className="bg-gray-800 text-gray-300 p-4 rounded-md overflow-x-auto text-sm">
              {analysisResult.dockerfile}
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

export default EnvironmentSetup;
