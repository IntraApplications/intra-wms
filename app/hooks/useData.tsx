// hooks/useIntraData.ts

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/supabase-client";
import { useNotificationContext } from "@/contexts/NotificationContext";

interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface Workspace {
  id: string;
  name: string;
  // Add other workspace properties as needed
}

const supabase = createClient();

export function useUser() {
  const { showNotification } = useNotificationContext();

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user as User;
    },
    onError: (error) => {
      showNotification({
        type: "error",
        title: "User Data Error",
        message: error.message,
      });
    },
    staleTime: 0,
    gcTime: 0, // 5 minutes
  });
}

export function useWorkspace() {
  const { showNotification } = useNotificationContext();
  const { data: user } = useUser();

  return useQuery({
    queryKey: ["workspace"],
    queryFn: async () => {
      if (!user) throw new Error("User not found");
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data as Workspace;
    },
    enabled: !!user,
    onError: (error) => {
      showNotification({
        type: "error",
        title: "Workspace Data Error",
        message: error.message,
      });
    },
    staleTime: 0,
    gcTime: 0, // 5 minutes
  });
}

export function useIntraData() {
  const userQuery = useUser();
  const workspaceQuery = useWorkspace();

  return {
    user: userQuery.data,
    workspace: workspaceQuery.data,
    isLoading: userQuery.isLoading || workspaceQuery.isLoading,
    isPending: userQuery.isPending || workspaceQuery.isPending,
    error: userQuery.error || workspaceQuery.error,
    refetchUser: userQuery.refetch,
    refetchWorkspace: workspaceQuery.refetch,
  };
}
