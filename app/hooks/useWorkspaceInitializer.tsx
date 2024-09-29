import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useGenerateDockerfile } from "@/hooks/useGenerateDockerfile";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

interface StepError {
  stepKey: string;
  stepName: string;
  message: string;
}

interface Step {
  name: string;
  key: string;
}

const steps: Step[] = [
  { name: "Cloning Repository", key: "cloning" },
  { name: "Processing Repository", key: "processing" },
  { name: "Analyzing Repository", key: "analyzing" },
];

export const useEnvironmentSetup = (onComplete: (success: boolean) => void) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [failedStep, setFailedStep] = useState<StepError | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [stepDurations, setStepDurations] = useState<{ [key: string]: number }>(
    {}
  );
  const [overallStartTime, setOverallStartTime] = useState<number | null>(null);
  const [overallElapsedTime, setOverallElapsedTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { generateDockerfile } = useGenerateDockerfile();
  const { showNotification } = useNotificationContext();
  const {
    repositoryName,
    setRepositoryURL,
    setRepoDir,
    setEnvironmentAnalysis,
  } = usePodCreationStore();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (overallStartTime !== null) {
      timer = setInterval(() => {
        setOverallElapsedTime((Date.now() - overallStartTime) / 1000);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [overallStartTime]);

  const executeStep = useCallback(
    async (step: Step, stepFunction: () => Promise<any>) => {
      setCurrentStep(steps.findIndex((s) => s.key === step.key));
      const stepStartTime = Date.now();

      try {
        const result = await stepFunction();
        setCompletedSteps((prev) => [...prev, step.key]);
        setStepDurations((prev) => ({
          ...prev,
          [step.key]: (Date.now() - stepStartTime) / 1000,
        }));
        return result;
      } catch (error) {
        setStepDurations((prev) => ({
          ...prev,
          [step.key]: (Date.now() - stepStartTime) / 1000,
        }));
        throw error;
      }
    },
    []
  );

  const cloneRepository = useCallback(async () => {
    try {
      const response = await axios.post("/api/clone-repository", {
        repoFullName: repositoryName,
      });
      const repoDir = response.data.repoDir;
      setRepoDir(repoDir);
      return repoDir;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to clone repository."
      );
    }
  }, [repositoryName, setRepoDir]);

  const processRepository = useCallback(async (repoDir: string) => {
    try {
      const response = await axios.post("/api/process-repository", { repoDir });
      return {
        repoDir: response.data.repoDir,
        outputFilePath: response.data.outputFilePath,
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to process repository."
      );
    }
  }, []);

  const generateWorkspaceData = useCallback(
    async (repoDir: string, outputFilePath: string) => {
      try {
        const analysisData = await generateDockerfile(
          repoDir,
          outputFilePath,
          setRepositoryURL
        );
        setAnalysisResult(analysisData);
        setEnvironmentAnalysis(analysisData);
      } catch (error) {
        throw new Error(
          error.response?.data?.error || "Failed to analyze repository."
        );
      }
    },
    [generateDockerfile, setRepositoryURL, setEnvironmentAnalysis]
  );

  const startProcess = useCallback(async () => {
    setIsProcessing(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    setFailedStep(null);
    setAnalysisResult(null);
    setStepDurations({});
    setOverallElapsedTime(0);
    setOverallStartTime(Date.now());

    try {
      const repoDir = await executeStep(steps[0], cloneRepository);
      const processData = await executeStep(steps[1], () =>
        processRepository(repoDir)
      );
      await executeStep(steps[2], () =>
        generateWorkspaceData(processData.repoDir, processData.outputFilePath)
      );

      showNotification({
        type: "success",
        title: "Environment Setup Complete",
        message: "Workspace environment is ready.",
      });

      onComplete(true);
    } catch (error) {
      const failedStepIndex = steps.findIndex(
        (step) => !completedSteps.includes(step.key)
      );
      setFailedStep({
        stepKey: steps[failedStepIndex].key,
        stepName: steps[failedStepIndex].name,
        message: error.message,
      });
      showNotification({
        type: "error",
        title: `${steps[failedStepIndex].name} Failed`,
        message: error.message,
      });
      onComplete(false);
    } finally {
      setIsProcessing(false);
    }
  }, [
    executeStep,
    cloneRepository,
    processRepository,
    generateWorkspaceData,
    showNotification,
    onComplete,
    completedSteps,
  ]);

  return {
    currentStep,
    completedSteps,
    failedStep,
    analysisResult,
    overallElapsedTime,
    stepDurations,
    startProcess,
    isProcessing,
  };
};
