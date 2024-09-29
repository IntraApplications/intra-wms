"use client";

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
      const { repositoryName, environmentAnalysis } = data;

      return new Promise((resolve, reject) => {
        const eventSource = new EventSource(
          `/api/push-to-ghcr?dockerfileContent=${encodeURIComponent(
            environmentAnalysis.dockerfile
          )}&repositoryName=${encodeURIComponent(repositoryName)}`
        );

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Live update:", data);
            createPod.onMessage(data);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("EventSource failed:", error);
          eventSource.close();
          reject(new Error("Failed to create pod"));
        };

        eventSource.addEventListener("done", (event) => {
          eventSource.close();
          resolve({ message: "Pod creation completed successfully" });
        });
      });
    },
    onMutate: (variables) => {
      // Optionally show a loading indicator
    },
    onError: (error, variables, context) => {
      showNotification({
        type: "error",
        title: "Error creating pod",
        message: error.message,
      });

      console.error("Error creating pod:", error);
    },
    onSuccess: (data, variables, context) => {
      showNotification({
        type: "success",
        title: "Success",
        message: "Pod created successfully!",
      });
    },
    onSettled: () => {
      // Always executed after error or success
    },
  });

  // Add a custom method to handle live updates
  createPod.onMessage = (data: any) => {
    // This method will be overridden in the component to update the UI
  };

  return { createPod };
}

export default useCreatePod;
