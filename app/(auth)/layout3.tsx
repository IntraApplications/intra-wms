"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { handleSignup } from "./actions"; // Adjust this path based on your folder structure
import { useNotificationContext } from "@/contexts/NotificationContext"; // Assuming you have a notification utility

type SignupInputs = {
  username: string;
  password: string;
};

export default function SignupPage() {
  const { register, handleSubmit } = useForm<SignupInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotificationContext();

  const onSubmit: SubmitHandler<SignupInputs> = async (data: SignupInputs) => {
    try {
      setIsLoading(true);

      // Create FormData to send to the server
      const formData = new FormData();
      formData.append("email", data.username);
      formData.append("password", data.password);

      // Call the server-side signup action
      const result = await handleSignup(formData);

      // Handle errors from the server response
      if (result?.success === false) {
        const errorMessage = result.errors
          ? JSON.stringify(result.errors)
          : result.error || "An unknown error occurred";
        throw new Error(errorMessage);
      }

      // Show success message on signup
      showNotification({
        type: "success",
        title: "Signup Successful",
        message: `Welcome, ${data.username}! Check your email to confirm your account.`,
      });
    } catch (err) {
      // Show error notification
      showNotification({
        type: "error",
        title: "Signup Error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      // Clear loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-md">
        <h2 className="text-center text-2xl font-bold">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              {...register("username")}
              id="username"
              type="email"
              placeholder="Enter your email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              {...register("password")}
              id="password"
              type="password"
              placeholder="Enter your password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
