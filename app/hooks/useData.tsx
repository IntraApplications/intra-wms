// hooks/useIntraData.ts

import { useEffect, useState } from "react";
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

interface UserState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

interface WorkspaceState {
  isLoading: boolean;
  error: string | null;
  workspace: Workspace | null;
}

export function useUser() {
  const [state, setState] = useState<UserState>({
    isLoading: true,
    error: null,
    user: null,
  });

  const { showNotification } = useNotificationContext();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (state.error) {
      showNotification({
        type: "error",
        title: "User Data Error",
        message: state.error,
      });
    }
  }, [state.error]);

  const fetchUser = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      setState((prev) => ({ ...prev, isLoading: false, user }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to fetch user data.",
      }));
      console.error("Error fetching user:", err);
    }
  };

  return {
    ...state,
    refetchUser: fetchUser,
  };
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>({
    isLoading: true,
    error: null,
    workspace: null,
  });

  const { showNotification } = useNotificationContext();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchWorkspace(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (state.error) {
      showNotification({
        type: "error",
        title: "Workspace Data Error",
        message: state.error,
      });
    }
  }, [state.error]);

  const fetchWorkspace = async (userId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      setState((prev) => ({ ...prev, isLoading: false, workspace: data }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to fetch workspace data.",
      }));
      console.error("Error fetching workspace:", err);
    }
  };

  return {
    ...state,
    refetchWorkspace: () => user && fetchWorkspace(user.id),
  };
}
