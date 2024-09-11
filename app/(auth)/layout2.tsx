import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import OauthButton from "@/_common/components/OauthButton";
import Input from "@/_common/components/Input";
import Button from "@/_common/components/Button";
import { handleLogin } from "./actions";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard/workspaces");
  }

  return (
    <div className="flex h-screen items-center justify-center bg-red flex-1">
      <div className="flex flex-col w-full max-w-sm lg:w-96 items-center justify-center">
        {children}

        <div className="mt-6 w-11/12 sm:w-full">
          <div className="justify-center">
            <div className="grid gap-4">
              <OauthButton
                icon={faGoogle}
                text="Continue with Google"
                oauthType="google"
              />

              <OauthButton
                icon={faGithub}
                text="Continue with Github"
                oauthType="github"
              />
              <div className="flex items-center mt-2 justify-center">
                <div className="flex-grow border-t border-secondary"></div>
                <span className="px-4 text-sm text-accent">or</span>
                <div className="flex-grow border-t border-secondary"></div>
              </div>
            </div>

            <form action={handleLogin}>
              <div className="grid mb-8">
                <Input
                  label="Email Address"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                />
                <div className="relative">
                  <Input
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                  <div className="grid mt-6 absolute right-0 top-0">
                    <div className="text-xs text-center mb-2">
                      <a
                        href="#"
                        className="font-normal text-secondaryBorder hover:brightness-125"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Button text={"Log in"} type={"submit"} colorType="tertiary" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
