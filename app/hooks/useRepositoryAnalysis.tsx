import { EnvironmentAnalysisData } from "@/stores/podCreationStore";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface AnalysisInput {
  repoDir: string;
  outputFilePath: string;
}

export function useRepositoryAnalysis() {
  const analysisMutation = useMutation<string, Error, AnalysisInput>({
    mutationFn: async ({ repoDir, outputFilePath }) => {
      const response = await axios.post<EnvironmentAnalysisData>(
        "/api/claude-analyze",
        {
          repoDir,
          outputFilePath,
        }
      );

      if (response.data) {
        return response.data;
      } else {
        throw new Error("Invalid response format from AI API");
      }
    },
    onError: (error) => {
      console.error("Error in AI analysis:", error);
    },
  });

  const analyzeRepository = (repoDir: string, outputFilePath: string) => {
    return analysisMutation.mutateAsync({ repoDir, outputFilePath });
  };

  return {
    analyzeRepository,
    isAnalyzing: analysisMutation.isPending,
    error: analysisMutation.error,
  };
}
