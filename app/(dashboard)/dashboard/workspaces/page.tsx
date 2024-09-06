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

const fetchRepositories = async (token: string): Promise<Repository[]> => {
  const { data } = await axios.post("http://localhost:8080/api/github-repos", {
    token,
  });
  return data;
};

const createWorkspace = async (token: string) => {
  const { data } = await axios.post("/api/create-workspace", {
    github_token: token,
  });
  return data;
};

function WorkspacePage() {
  const { token, error: tokenError, loading: tokenLoading } = useVCSToken();

  const {
    data: repositories,
    error: repoError,
    isLoading: repoLoading,
  } = useQuery<Repository[], Error>({
    queryKey: ["repositories", token],
    queryFn: () => fetchRepositories(token!),
    enabled: !!token,
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: () => createWorkspace(token!),
    onSuccess: () => {
      // Handle successful workspace creation
      console.log("Workspace created successfully");
    },
  });

  useEffect(() => {
    if (tokenError) {
      console.error("Token error:", tokenError);
    }
  }, [tokenError]);

  if (tokenLoading || repoLoading) {
    return <div>Loading...</div>;
  }

  const error = tokenError || repoError;

  return (
    <div className="h-full">
      {/* Breadcrumb Section */}
      <div className="border-b border-border w-full h-11 flex items-center">
        <div className="ml-5 flex gap-2 items-center">
          <CodeOutlined fontSize="medium" className="text-tertiaryBorder" />
          <p className="text-xs text-accent">Team - Engineering</p>
          <ChevronRight fontSize="small" className="text-sidenav" />
          <p className="text-xs text-white">Virtual Workspaces</p>
        </div>
      </div>

      <div className="flex justify-center mt-20">
        <div className="h-[600px] w-[1100px]">
          {repositories && repositories.length > 0 ? (
            <div className="flex justify-between">
              <h1 className="text-accent text-2xl">Virtual Workspaces</h1>
              <Button
                text={"Create new workspace"}
                type={"submit"}
                size="xs"
                icon={faPlus}
                handleClick={() => createWorkspaceMutation.mutate()}
                loading={createWorkspaceMutation.isPending}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
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
                  handleClick={() => createWorkspaceMutation.mutate()}
                  loading={createWorkspaceMutation.isPending}
                  className="mt-10"
                />
              </div>
            </div>
          )}

          {repositories && repositories.length > 0 && (
            <div className="mt-8">
              <h2 className="text-accent text-xl mb-4">
                Your GitHub Repositories
              </h2>
              <ul className="space-y-2">
                {repositories.map((repo) => (
                  <li key={repo.name} className="bg-secondary p-4 rounded">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-tertiary"
                    >
                      {repo.name}
                    </a>
                    <p className="text-sidenav text-sm">{repo.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {error && (
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
