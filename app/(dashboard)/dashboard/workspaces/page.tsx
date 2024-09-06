"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CodeOutlined, ChevronRight, DvrOutlined } from "@mui/icons-material";
import withAuth from "@/hoc/withAuth";
import Button from "@/_common/components/Button";
import ErrorNotification from "@/_common/components/ErrorNotification";
import useVCSToken from "@/hooks/useVCSToken";

interface Repository {
  name: string;
  html_url: string;
  description: string;
}

function WorkspacePage() {
  const { token, error: tokenError, loading: tokenLoading } = useVCSToken();
  console.log("token: ")
  console.log(token)

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb Section */}
      <div className="border-b border-border w-full h-11 flex items-center">
        <div className="ml-5 flex gap-2 items-center">
          <CodeOutlined fontSize="medium" className="text-tertiaryBorder" />
          <p className="text-xs text-accent">Team - Engineering</p>
          <ChevronRight fontSize="small" className="text-sidenav" />
          <p className="text-xs text-white">Virtual Workspaces</p>
        </div>
      </div>

      <div className="flex-grow flex justify-center items-center">
        <div className="w-[1100px]">
          {false ? (
            <div className="flex justify-between">
              <h1 className="text-accent text-2xl">Virtual Workspaces</h1>
              <Button
                text={"Create new workspace"}
                type={"submit"}
                size="xs"
                icon={faPlus}
                handleClick={() => {}}
                loading={false}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center text-center max-w-[400px]">
                <DvrOutlined
                  style={{ fontSize: "50px" }}
                  className="text-white text-5xl mb-6"
                />
                <h1 className="text-white text-md mb-2">Virtual Workspaces</h1>
                <p className="text-sidenav text-[13px] mb-8">
                  Workspaces give your team a dedicated space to code,
                  collaborate, and manage projects. Create a workspace to start
                  working efficiently and track progress in real-time.
                </p>
                <Button
                  text={"Create new workspace"}
                  type={"button"}
                  size="xxs"
                  icon={faPlus}
                  handleClick={() => {}}
                  loading={false}
                  className="mt-10"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {false && (
        <ErrorNotification
          title="Error"
          message={error.message}
          onClose={() => {
            /* Implement error dismissal logic */
          }}
        />
      )}
    </div>
  );
}

export default withAuth(WorkspacePage);