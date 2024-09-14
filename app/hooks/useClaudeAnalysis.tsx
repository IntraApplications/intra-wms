import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface AnalysisInput {
  repoDir: string;
  outputFilePath: string;
}

interface AnalysisResponse {
  dockerfile: string;
  dependencies: string[];
  projectType: string;
  notes: string;

  // Add other properties if they exist in the response
}

export function useClaudeAnalysis() {
  const analysisMutation = useMutation<string, Error, AnalysisInput>({
    mutationFn: async ({ repoDir, outputFilePath }) => {
      const response = await axios.post<AnalysisResponse>(
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
