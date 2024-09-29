import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import Button from "@/_common/components/Button";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

interface RepositorySelectionProps {}

const VCSOptionSkeleton = React.memo(() => (
  <div className="bg-dashboard border border-border rounded-[5px] p-8 flex flex-col justify-between overflow-hidden">
    <div>
      <div className="flex items-center mb-2">
        {/* Icon Skeleton */}
        <div className="w-6 h-6 bg-skeleton rounded mr-2 relative overflow-hidden">
          <div className="absolute inset-0 inset-y-0 left-0 w-full bg-shimmer animate-shimmer"></div>
        </div>
        {/* Title Skeleton */}
        <div className="h-4 bg-skeleton rounded w-24 relative overflow-hidden">
          <div className="absolute inset-0 inset-y-0 left-0 w-full bg-shimmer animate-shimmer"></div>
        </div>
      </div>
      {/* Line Skeletons */}
      <div className="h-3 bg-skeleton rounded w-full mb-1 relative overflow-hidden">
        <div className="absolute inset-0 inset-y-0 left-0 w-full bg-shimmer animate-shimmer"></div>
      </div>
      <div className="h-3 bg-skeleton rounded w-3/4 relative overflow-hidden">
        <div className="absolute inset-0 inset-y-0 left-0 w-full bg-shimmer animate-shimmer"></div>
      </div>
    </div>
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center">
        {/* Status Indicator Skeleton */}
        <div className="w-2 h-2 bg-skeleton rounded-full mr-2 relative overflow-hidden">
          <div className="absolute inset-0 inset-y-0 left-0 w-full bg-shimmer animate-shimmer"></div>
        </div>
        {/* Status Text Skeleton */}
        <div className="h-3 bg-skeleton rounded w-16 relative overflow-hidden">
          <div className="absolute inset-0 inset-y-0 left-0 w-full bg-shimmer animate-shimmer"></div>
        </div>
      </div>
      {/* Button Skeleton */}
      <div className="w-16 h-6 bg-skeleton rounded relative overflow-hidden">
        <div className="absolute inset-0 inset-y-0 left-0 w-full bg-shimmer animate-shimmer"></div>
      </div>
    </div>
  </div>
));

const RepositorySelection: React.FC<RepositorySelectionProps> = React.memo(
  () => {
    const repositoryName = usePodCreationStore((state) => state.repositoryName);
    const setRepositoryName = usePodCreationStore(
      (state) => state.setRepositoryName
    );

    const repositoryURL = usePodCreationStore((state) => state.repositoryURL);
    const setRepositoryURL = usePodCreationStore(
      (state) => state.setRepositoryURL
    );

    const {
      isConnected,
      isLoading: isIntegrationLoading,
      error: integrationError,
    } = useGitHubIntegration();

    const [isImmediateLoading, setIsImmediateLoading] = useState(true);

    const fetchRepositories = useCallback(async () => {
      const response = await fetch("/api/github-repositories");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch repositories.");
      }
      const data = await response.json();
      return data.repositories;
    }, []);

    const {
      data: repositories = [],
      isLoading: isRepoLoading,
      error: repoError,
    } = useQuery({
      queryKey: ["repositories"],
      queryFn: fetchRepositories,
      staleTime: 0,
      gcTime: 0,
      enabled: isConnected && !isIntegrationLoading,
    });

    useEffect(() => {
      if (!isRepoLoading && !isIntegrationLoading) {
        setIsImmediateLoading(false);
      }
    }, [isRepoLoading, isIntegrationLoading]);

    const handleSelectRepository = useCallback(
      (repoFullName: string, repoCloneUrl: string) => {
        setRepositoryName(repoFullName);
        setRepositoryURL(repoCloneUrl);
      },
      []
    );

    const getStatusText = useCallback((repo) => {
      return (
        <span className="flex items-center text-xs">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          <span className="text-accent">{repo.language || "Unknown"}</span>
        </span>
      );
    }, []);

    if (integrationError) {
      return (
        <div className="p-6 max-w-[1320px] mx-auto">
          <div className="text-red-500">Error: {integrationError.message}</div>
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div className="p-6 max-w-[1320px] mx-auto">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-white mb-4">
              Repository Selection
            </h1>
            <p className="text-gray-400 text-[13px]">
              Please connect your GitHub account to select a repository.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-[1320px] mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white mb-4">
            Repository Selection
          </h1>
          <p className="text-gray-400 text-[13px]">
            Select a repository to use for your workspace.
          </p>
        </div>

        {isImmediateLoading || isRepoLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <VCSOptionSkeleton key={index} />
            ))}
          </div>
        ) : repoError ? (
          <div className="text-red-500">
            Error: {(repoError as Error).message}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repositories.map((repo: any, index: number) => {
              const isSelected = repositoryName === repo.full_name;
              return (
                <div
                  key={index}
                  className={`bg-dashboard border ${
                    isSelected ? "border-green-500" : "border-border"
                  } rounded-[5px] p-4 flex flex-col justify-between cursor-pointer transition-colors duration-300`}
                  onClick={() =>
                    handleSelectRepository(repo.full_name, repo.clone_url)
                  }
                >
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-white text-sm font-semibold mb-1.5">
                        {repo.name}
                      </h3>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 mb-2">
                      {repo.owner.login}
                    </div>
                    <p className="text-gray-400 text-xs mb-6">
                      {repo.description || "No description provided."}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    {getStatusText(repo)}
                    <div className="flex items-center text-[11px] text-gray-400">
                      <span className="mr-1">Updated</span>
                      <span>
                        {formatDistanceToNow(new Date(repo.updated_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

export default RepositorySelection;
