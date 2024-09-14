// EnvironmentSetup.tsx
import React, { useEffect, useState, useRef } from "react";
import { useClaudeAnalysis } from "@/hooks/useClaudeAnalysis";
import { useNotificationContext } from "@/contexts/NotificationContext";
import Button from "@/_common/components/Button";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleNotch,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

interface EnvironmentSetupProps {
  workspaceData: any;
  updateWorkspaceData: (data: any) => void;
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

const EnvironmentSetup: React.FC<EnvironmentSetupProps> = ({
  workspaceData,
  updateWorkspaceData,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [failedStep, setFailedStep] = useState<StepError | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const { analyzeRepository } = useClaudeAnalysis();
  const { showNotification } = useNotificationContext();

  const hasStartedProcess = useRef(false);

  useEffect(() => {
    if (workspaceData.repository && !hasStartedProcess.current) {
      hasStartedProcess.current = true;
      startProcess();
    }
  }, [workspaceData.repository]);

  const startProcess = async () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setFailedStep(null);
    setAnalysisResult(null);

    try {
      // Step 1: Clone the repository
      setCurrentStep(0);
      await cloneRepository();
      setCompletedSteps((prev) => [...prev, steps[0].key]);

      // Step 2: Process the repository
      setCurrentStep(1);
      const processData = await processRepository();
      setCompletedSteps((prev) => [...prev, steps[1].key]);

      // Step 3: Analyze the repository
      setCurrentStep(2);
      await analyzeRepo(processData.repoDir, processData.outputFilePath);
      setCompletedSteps((prev) => [...prev, steps[2].key]);

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

  const iconSizeClass = "text-xl"; // Adjusted icon size for consistency

  const cloneRepository = async () => {
    try {
      const response = await axios.post("/api/clone-repository", {
        repoFullName: workspaceData.repository,
      });
      // Store repoDir for subsequent steps
      updateWorkspaceData({ repoDir: response.data.repoDir });
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

  const processRepository = async () => {
    try {
      const response = await axios.post("/api/process-repository", {
        repoDir: workspaceData.repoDir,
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
      updateWorkspaceData({
        environmentAnalysis: analysisData,
      });
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
          className={`${iconSizeClass} h-6 w-6 border border-gray-500 rounded-full`}
        />
      );
    }
  };

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
      </div>

      <div className="mb-6">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center mb-4">
            {renderStepIcon(step.key, index)}
            <span className="ml-4 text-white text-sm">{step.name}</span>
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
              <strong className="text-white">Dependencies:</strong>{" "}
              {analysisResult.dependencies.join(", ")}
            </p>
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
        </div>
      )}

      <Button
        text={
          analysisResult
            ? "Re-run Environment Setup"
            : "Start Environment Setup"
        }
        type="button"
        colorType="tertiary"
        size="small"
        handleClick={() => {
          hasStartedProcess.current = true;
          startProcess();
        }}
      />
    </div>
  );
};

export default EnvironmentSetup;
