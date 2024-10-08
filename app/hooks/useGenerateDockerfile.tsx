import { useNotificationContext } from "@/contexts/NotificationContext";
import { EnvironmentAnalysisData } from "@/stores/podCreationStore";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface GenerateDockerfileInput {
  mergedRepositoryFile: string;
  repositoryURL: string;
}

export function useGenerateDockerfile() {
  const { showNotification } = useNotificationContext();
  const generateDockerfileMutation = useMutation({
    mutationFn: async ({
      mergedRepositoryFile,
      repositoryURL,
    }: GenerateDockerfileInput) => {
      const response = await axios.post<EnvironmentAnalysisData>(
        "/api/generate-dockerfile",
        {
          mergedRepositoryFile,
          repositoryURL,
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

      showNotification({
        type: "error",
        title: "Error creating dockerfile",
        message: error.message,
      });
    },
  });

  const generateDockerfile = ({
    mergedRepositoryFile,
    repositoryURL,
  }: GenerateDockerfileInput) => {
    return generateDockerfileMutation.mutateAsync({
      mergedRepositoryFile,
      repositoryURL,
    });
  };

  return {
    generateDockerfile,
    isGenerating: generateDockerfileMutation.isPending,
    error: generateDockerfileMutation.error,
  };
}
