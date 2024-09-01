"use client";
import React from "react";
import axios from "axios";
import Image from "next/image";
import IntraLogo from "@/_assets/intra logo-3-large-transparent.png";
import { useMutation } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import Input from "@/_common/components/Input";
import Button from "@/_common/components/Button";
import OauthButton from "@/_common/components/OauthButton";

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

export default function LoginPage() {
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
  });

  const onSubmit: SubmitHandler<LoginInputs> = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-red flex-1">
      <div className="flex flex-col w-full max-w-sm lg:w-96 items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <Image
            src={IntraLogo}
            alt="Intra Logo"
            width={100}
            height={100} // Add a height value to maintain aspect ratio
            className="rounded-lm -ml-2"
          />
          <h2 className="text-center text-m font-normal text-accent mt-4">
            Log in to your account
          </h2>
        </div>

        <div className="mt-10 w-11/12 sm:w-full">
          <div className="justify-center">
            <form onSubmit={handleSubmit(onSubmit)} className="justify-center">
              <div className="grid gap-4">
                <OauthButton
                  icon={faGoogle}
                  text={"Continue with Google"}
                  type={"submit"}
                  oauthType="google"
                />
                <OauthButton
                  icon={faGithub}
                  text={"Continue with Github"}
                  type={"submit"}
                  oauthType="github"
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

              <Button text={"Log in"} type={"submit"} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
