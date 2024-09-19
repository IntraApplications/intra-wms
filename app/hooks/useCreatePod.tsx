"use client";

import axios from "axios";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { createClient } from "@/lib/supabase/supabase-client";
import { useMutation } from "@tanstack/react-query";
import { useIntraData } from "./useData";
import { PodCreationState } from "@/stores/podCreationStore";

function useCreatePod() {
  const supabase = createClient();
  const { showNotification } = useNotificationContext();
  const { workspace } = useIntraData();

  const createPod = useMutation({
    mutationFn: async (data: PodCreationState) => {
      const { dockerfileContent, organizationData, repositoryName } = data;

      const response = await axios.post("/api/push-to-ghcr", {
        dockerfileContent,
        organizationData,
        repositoryName,
      });

      return response.data;
    },
    onMutate: (variables) => {
      // Optionally show a loading indicator
    },
    onError: (error, variables, context) => {
      // Handle error
      showNotification("Failed to create pod. Please try again.", "error");
      console.error("Error creating pod:", error);
    },
    onSuccess: (data, variables, context) => {
      // Handle success
      showNotification("Pod created successfully!", "success");
    },
    onSettled: () => {
      // Always executed after error or success
    },
  });

  return { createPod };
}

export default useCreatePod;
