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
import { supabase } from "@/_lib/supabase";
import { usePathname } from "next/navigation";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

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
  const { showNotification } = useWebSocketContext();

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginInputs) => {
      return axios.post("/api/login", credentials);
    },
    onError: (error) => {
      showNotification({
        type: "error",
        title: "Login Error",
        message: "Login failed. Please check your credentials and try again.",
      });
    },
  });

  const onSubmit: SubmitHandler<LoginInputs> = async (data: LoginInputs) => {
    setIsLoading(true);
    if (isLoginPage) {
      try {
        const signupData = await supabase.auth.signInWithPassword({
          email: data.username,
          password: data.password,
        });

        if (signupData.error) {
          throw new Error(signupData.error.message);
        }
      } catch (err) {
        showNotification({
          type: "error",
          title: "Login Error",
          message: err.message || "Log in failed. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (isSignupPage) {
      try {
        const signupData = await supabase.auth.signUp({
          email: data.username,
          password: data.password,
          options: {
            emailRedirectTo: "http://localhost:3000/dashboard",
          },
        });

        if (signupData.error) {
          throw new Error(signupData.error.message);
        }
      } catch (err) {
        showNotification({
          type: "error",
          title: "Signup Error",
          message: err.message || "Sign up failed. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      showNotification({
        type: "error",
        title: "Navigation Error",
        message: "Invalid login page",
      });
    }
  };

  const onOauthSubmit = async (provider: "google" | "github") => {
    try {
      let error;
      if (provider === "google") {
        ({ error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `http://localhost:3000/dashboard/workspaces`,
          },
        }));
      } else {
        ({ error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: `http://localhost:3000/dashboard/workspaces`,
          },
        }));
      }

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      showNotification({
        type: "error",
        title: "OAuth Error",
        message: err.message || "OAuth login failed. Please try again.",
      });
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-red flex-1">
      <div className="flex flex-col w-full max-w-sm lg:w-96 items-center justify-center">
        {children}

        <div className="mt-6 w-11/12 sm:w-full">
          <div className="justify-center">
            <form onSubmit={handleSubmit(onSubmit)} className="justify-center">
              <div className="grid gap-4">
                <OauthButton
                  icon={faGoogle}
                  text={"Continue with Google"}
                  type={"button"}
                  oauthType="google"
                  handleClick={() => onOauthSubmit("google")}
                />
                <OauthButton
                  icon={faGithub}
                  text={"Continue with Github"}
                  type={"button"}
                  oauthType="github"
                  handleClick={() => onOauthSubmit("github")}
                />
                <div className="flex items-center mt-2 justify-center">
                  <div className="flex-grow border-t border-secondary"></div>
                  <span className="px-4 text-sm text-accent">or</span>
                  <div className="flex-grow border-t border-secondary"></div>
                </div>
              </div>

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
