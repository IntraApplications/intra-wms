"use server";

import { createClient } from "@/lib/supabase/supabase-server";
import { redirect } from "next/navigation";
import { z } from "zod";

const workspaceNameSchema = z.object({
  workspaceName: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .max(25, "Workspace name cannot exceed 25 characters"),
  workspaceURL: z
    .string()
    .min(10, "Workspace URL must be at least 10 characters")
    .max(35, "Workspace URL cannot exceed 35 characters"),
});

export async function handleWorkspaceCreation(formData: FormData) {
  const workspaceName = formData.get("workspaceName") as string;
  const workspaceURL = formData.get("workspaceURL") as string;

  // Validate the input data with Zod
  const parsedData = workspaceNameSchema.safeParse({
    workspaceName,
    workspaceURL,
  });
  if (!parsedData.success) {
    const errors = parsedData.error.format();
    return { success: false, errors }; // Return errors
  }

  const supabase = createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { success: false, error: "Unable to get current user." };
  }

  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  // Create the workspace
  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name: workspaceName,
      url: workspaceURL,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return { success: false, error: "Failed to create workspace." };
  }

  // Redirect on success
  //redirect(`/dashboard/workspaces/${data.id}`);
  redirect(`/dashboard/workspaces`);
}
