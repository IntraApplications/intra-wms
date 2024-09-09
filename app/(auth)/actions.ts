"use server";

import { createClient } from "@/_lib/supabase/supabase-server";
import { redirect } from "next/navigation";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // You might want to handle this error more gracefully
    throw new Error(error.message);
  }

  redirect("/dashboard/workspaces/");
}

export async function handleSignup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // Redirect or show a success message
  redirect("/auth/check-email");
}

export async function handleOAuth(formData: FormData) {
  const supabase = createClient();

  // Extract the oauthType from the form data
  const provider = formData.get("oauthType") as "google" | "github";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `http://localhost:3000/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }
}
