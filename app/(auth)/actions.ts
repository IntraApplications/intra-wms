"use server";

import { createClient } from "@/lib/supabase/supabase-server";
import { redirect } from "next/navigation";
import { z } from "zod";

// Define Zod schema for validation
const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Handle Login
export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate the input data with Zod
  const parsedData = authSchema.safeParse({ email, password });
  if (!parsedData.success) {
    const errors = parsedData.error.format();
    return { success: false, errors }; // Return errors
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Redirect on success
  redirect("/dashboard/workspaces/");
}

// Handle Signup
export async function handleSignup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate the input data with Zod
  const parsedData = authSchema.safeParse({ email, password });
  if (!parsedData.success) {
    const errors = parsedData.error.format();
    return { success: false, errors }; // Return errors
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/workspaces`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Redirect on success
  redirect("/auth/confirm");
}

// Handle OAuth
export async function handleOAuth(formData: FormData) {
  const supabase = createClient();
  const provider = formData.get("oauthType") as "google" | "github";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { success: false, error: "No redirect URL found." };
}
