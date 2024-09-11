"use client";

import React, { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import Input from "@/_common/components/Input";
import Button from "@/_common/components/Button";
import OauthButton from "@/_common/components/OauthButton";
import { createClient } from "@/lib/supabase/supabase-client";
import { usePathname } from "next/navigation";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { handleLogin, handleSignup } from "./actions";

type LoginInputs = {
  username: string;
  password: string;
};

const loginSchema = z.object({
  username: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(7, "Password must be at least 7 characters long.")
    .max(25, "Password cannot exceed 25 characters."),
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showNotification } = useNotificationContext();

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginInputs> = async (data: LoginInputs) => {
    try {
      setIsLoading(true);

      // Check if it's a valid page (login/signup)
      if (!isLoginPage && !isSignupPage) {
        throw new Error("Invalid navigation. Please try again.");
      }

      // Create FormData to send to the server
      const formData = new FormData();
      formData.append("email", data.username);
      formData.append("password", data.password);

      // Call server-side actions based on the page type
      let result;
      if (isLoginPage) {
        result = await handleLogin(formData);
      } else if (isSignupPage) {
        result = await handleSignup(formData);
      }

      // Handle errors from the server response
      if (result?.success === false) {
        const errorMessage = result.errors
          ? JSON.stringify(result.errors)
          : result.error || "An unknown error occurred";
        throw new Error(errorMessage);
      }

      // Show success message
      showNotification({
        type: "success",
        title: isLoginPage ? "Login Successful" : "Signup Successful",
        message: `Welcome, ${data.username}! Redirecting to your dashboard.`,
      });
    } catch (err) {
      // Show error notification
      showNotification({
        type: "error",
        title: isLoginPage ? "Login Error" : "Signup Error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      // Ensure loading state is cleared
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-screen items-center justify-center bg-red flex-1">
      <div className="flex flex-col w-full max-w-sm lg:w-96 items-center justify-center">
        {children}

        <div className="mt-6 w-11/12 sm:w-full">
          <div className="justify-center">
            <div className="grid gap-4">
              <OauthButton
                icon={faGoogle}
                text={"Continue with Google"}
                oauthType="google"
              />
              <OauthButton
                icon={faGithub}
                text={"Continue with Github"}
                oauthType="github"
              />
              <div className="flex items-center mt-2 justify-center">
                <div className="flex-grow border-t border-secondary"></div>
                <span className="px-4 text-sm text-accent">or</span>
                <div className="flex-grow border-t border-secondary"></div>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="justify-center">
              <div className="grid mb-8">
                <Input
                  label="Email Address"
                  id="email"
                  autoComplete="email"
                  error={errors.username}
                  placeholder="Enter your email"
                  {...register("username", { required: true })}
                />
                <div className="relative">
                  <Input
                    label="Password"
                    id="password"
                    autoComplete="current-password"
                    error={errors.password}
                    {...register("password", { required: true })}
                    placeholder="Enter your password"
                  />
                  <div className="grid mt-6 absolute right-0 top-0">
                    <div className="text-xs text-center mb-2">
                      <a
                        href="#"
                        className=" font-normal text-secondaryBorder hover:brightness-125"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                text={"Log in"}
                type={"submit"}
                handleClick={() => {}}
                loading={isLoading}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
