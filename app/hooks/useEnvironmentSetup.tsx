// useEnvironmentSetup.ts
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRepositoryAnalysis } from "@/hooks/useRepositoryAnalysis";
import { useNotificationContext } from "@/contexts/NotificationContext";

interface StepError {
  stepKey: string;
  message: string;
}

interface EnvironmentSetupResult {
  analysisResult: any | null;
  currentStep: number;
  completedSteps: string[];
  failedStep: StepError | null;
  stepDurations: { [key: string]: number };
  overallElapsedTime: number;
}

interface UseEnvironmentSetupProps {
  workspaceData: any;
  updateWorkspaceData: (data: any) => void;
  onComplete: (success: boolean) => void;
}

export const useEnvironmentSetup = ({
  workspaceData,
  updateWorkspaceData,
  onComplete,
}: UseEnvironmentSetupProps): EnvironmentSetupResult => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [failedStep, setFailedStep] = useState<StepError | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const { analyzeRepository } = useRepositoryAnalysis();
  const { showNotification } = useNotificationContext();

  const [stepDurations, setStepDurations] = useState<{ [key: string]: number }>(
    {}
  );
  const [overallStartTime, setOverallStartTime] = useState<number | null>(null);
  const [overallElapsedTime, setOverallElapsedTime] = useState<number>(0);

  const stepTimers = useRef<{
    [key: string]: {
      timer: NodeJS.Timeout;
      stepStartTime: number;
    };
  }>({});

  useEffect(() => {
    if (workspaceData.repository) {
      startProcess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceData.repository]);

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

  const startProcess = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setFailedStep(null);
    setAnalysisResult(null);
    setStepDurations({});
    setOverallElapsedTime(0);
    setOverallStartTime(Date.now());

    cloneRepositoryMutation.mutate();
  };

  // Clone Repository Mutation
  const cloneRepositoryMutation = useMutation(
    async () => {
      const response = await axios.post("/api/clone-repository", {
        repoFullName: workspaceData.repository,
      });
      return response.data.repoDir;
    },
    {
      onMutate: () => {
        setCurrentStep(0);
        setStepDurations((prev) => ({ ...prev, cloning: 0 }));
        // Start timer for cloning step
        const stepStartTime = Date.now();
        const timer = setInterval(() => {
          setStepDurations((prev) => ({
            ...prev,
            cloning: (Date.now() - stepStartTime) / 1000,
          }));
        }, 1000);
        // Save timer so we can clear it later
        stepTimers.current.cloning = { timer, stepStartTime };
      },
      onSuccess: (repoDir) => {
        // Update workspace data
        updateWorkspaceData({ repoDir });
        setCompletedSteps((prev) => [...prev, "cloning"]);

        // Clear timer and record final duration
        const { timer, stepStartTime } = stepTimers.current.cloning;
        clearInterval(timer);
        setStepDurations((prev) => ({
          ...prev,
          cloning: (Date.now() - stepStartTime) / 1000,
        }));

        // Proceed to next step
        processRepositoryMutation.mutate(repoDir);
      },
      onError: (error: any) => {
        // Handle error
        setFailedStep({
          stepKey: "cloning",
          message: error.response?.data?.error || "Failed to clone repository.",
        });
        showNotification({
          type: "error",
          title: "Cloning Failed",
          message:
            error.response?.data?.error || "An error occurred while cloning.",
        });
        onComplete(false);
      },
    }
  );

  // Process Repository Mutation
  const processRepositoryMutation = useMutation(
    async (repoDir: string) => {
      const response = await axios.post("/api/process-repository", {
        repoDir,
      });
      return {
        repoDir: response.data.repoDir,
        outputFilePath: response.data.outputFilePath,
      };
    },
    {
      onMutate: () => {
        setCurrentStep(1);
        setStepDurations((prev) => ({ ...prev, processing: 0 }));
        // Start timer for processing step
        const stepStartTime = Date.now();
        const timer = setInterval(() => {
          setStepDurations((prev) => ({
            ...prev,
            processing: (Date.now() - stepStartTime) / 1000,
          }));
        }, 1000);
        // Save timer so we can clear it later
        stepTimers.current.processing = { timer, stepStartTime };
      },
      onSuccess: (data) => {
        setCompletedSteps((prev) => [...prev, "processing"]);

        // Clear timer and record final duration
        const { timer, stepStartTime } = stepTimers.current.processing;
        clearInterval(timer);
        setStepDurations((prev) => ({
          ...prev,
          processing: (Date.now() - stepStartTime) / 1000,
        }));

        // Proceed to next step
        analyzeRepositoryMutation.mutate({
          repoDir: data.repoDir,
          outputFilePath: data.outputFilePath,
        });
      },
      onError: (error: any) => {
        // Handle error
        setFailedStep({
          stepKey: "processing",
          message:
            error.response?.data?.error || "Failed to process repository.",
        });
        showNotification({
          type: "error",
          title: "Processing Failed",
          message:
            error.response?.data?.error ||
            "An error occurred during processing.",
        });
        onComplete(false);
      },
    }
  );

  // Analyze Repository Mutation
  const analyzeRepositoryMutation = useMutation(
    async ({
      repoDir,
      outputFilePath,
    }: {
      repoDir: string;
      outputFilePath: string;
    }) => {
      const analysisData = await analyzeRepository(repoDir, outputFilePath);
      return analysisData;
    },
    {
      onMutate: () => {
        setCurrentStep(2);
        setStepDurations((prev) => ({ ...prev, analyzing: 0 }));
        // Start timer for analyzing step
        const stepStartTime = Date.now();
        const timer = setInterval(() => {
          setStepDurations((prev) => ({
            ...prev,
            analyzing: (Date.now() - stepStartTime) / 1000,
          }));
        }, 1000);
        // Save timer so we can clear it later
        stepTimers.current.analyzing = { timer, stepStartTime };
      },
      onSuccess: (analysisData) => {
        setCompletedSteps((prev) => [...prev, "analyzing"]);

        // Clear timer and record final duration
        const { timer, stepStartTime } = stepTimers.current.analyzing;
        clearInterval(timer);
        setStepDurations((prev) => ({
          ...prev,
          analyzing: (Date.now() - stepStartTime) / 1000,
        }));

        setAnalysisResult(analysisData);
        updateWorkspaceData({
          environmentAnalysis: analysisData,
        });

        showNotification({
          type: "success",
          title: "Environment Setup Complete",
          message: "Workspace environment is ready.",
        });

        onComplete(true);
      },
      onError: (error: any) => {
        // Handle error
        setFailedStep({
          stepKey: "analyzing",
          message:
            error.response?.data?.error || "Failed to analyze repository.",
        });
        showNotification({
          type: "error",
          title: "Analysis Failed",
          message:
            error.response?.data?.error || "An error occurred during analysis.",
        });
        onComplete(false);
      },
    }
  );

  return {
    analysisResult,
    currentStep,
    completedSteps,
    failedStep,
    stepDurations,
    overallElapsedTime,
  };
};
