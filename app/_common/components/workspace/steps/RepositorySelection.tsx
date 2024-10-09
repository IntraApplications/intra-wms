import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import Button from "@/_common/components/Button";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

// Define the structure of a repository
interface Repository {
  id: number;
  name: string;
  full_name: string;
  clone_url: string;
  description: string | null;
  language: string | null;
  owner: {
    login: string;
  };
  updated_at: string;
}

// Props for the RepositorySelection component
interface RepositorySelectionProps {}

/**
 * Skeleton component for loading state
 */
const VCSOptionSkeleton: React.FC = React.memo(() => (
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

/**
 * RepositorySelection Component
 * Allows users to select a GitHub repository for their workspace.
 */
const RepositorySelection: React.FC<RepositorySelectionProps> = React.memo(
  () => {
    // Extract necessary state and actions from the store
    const repositoryName = usePodCreationStore((state) => state.repositoryName);
    const setRepositoryName = usePodCreationStore(
      (state) => state.setRepositoryName
    );

    const repositoryURL = usePodCreationStore((state) => state.repositoryURL);
    const setRepositoryURL = usePodCreationStore(
      (state) => state.setRepositoryURL
    );

    // Extract GitHub integration status and actions
    const {
      isConnected,
      isPending: isIntegrationLoading,
      error: integrationError,
    } = useGitHubIntegration();

    // Local state to manage immediate loading
    const [isImmediateLoading, setIsImmediateLoading] = useState<boolean>(true);

    /**
     * Fetches repositories from the GitHub API.
     * @returns An array of repositories.
     * @throws An error if the fetch fails.
     */
    const fetchRepositories = useCallback(async (): Promise<Repository[]> => {
      const response = await fetch("/api/github-repositories");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch repositories.");
      }
      const data = await response.json();
      return data.repositories;
    }, []);

    // Use React Query to fetch repositories
    const {
      data: repositories = [],
      isLoading: isRepoLoading,
      error: repoError,
    } = useQuery<Repository[], Error>({
      queryKey: ["repositories"],
      queryFn: fetchRepositories,
      staleTime: 0,
      gcTime: 0,
      enabled: isConnected && !isIntegrationLoading, // Fetch only if connected and not loading
    });

    /**
     * Effect to update loading state after repositories are fetched
     */
    useEffect(() => {
      if (!isRepoLoading && !isIntegrationLoading) {
        setIsImmediateLoading(false);
      }
    }, [isRepoLoading, isIntegrationLoading]);

    /**
     * Handles the selection of a repository.
     * @param repoFullName - The full name of the repository.
     * @param repoCloneUrl - The clone URL of the repository.
     */
    const handleSelectRepository = useCallback(
      (repoFullName: string, repoCloneUrl: string) => {
        setRepositoryName(repoFullName);
        setRepositoryURL(repoCloneUrl);
      },
      [setRepositoryName, setRepositoryURL]
    );

    /**
     * Renders the status text based on the repository's language.
     * @param repo - The repository object.
     * @returns A JSX element representing the status.
     */
    const getStatusText = useCallback((repo: Repository): JSX.Element => {
      return (
        <span className="flex items-center text-xs">
          <span
            className="w-2 h-2 bg-green-500 rounded-full mr-2"
            aria-hidden="true"
          ></span>
          <span className="text-accent">{repo.language || "Unknown"}</span>
        </span>
      );
    }, []);

    /**
     * Renders the list of repository options.
     * @returns A JSX element containing repository cards.
     */
    const renderRepositories = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repositories.map((repo: Repository) => {
          const isSelected = repositoryName === repo.full_name;
          return (
            <RepositoryOption
              key={repo.id}
              repository={repo}
              isSelected={isSelected}
              onSelect={handleSelectRepository}
              getStatusText={getStatusText}
            />
          );
        })}
      </div>
    );

    /**
     * Renders the skeleton loaders for repositories.
     * @returns A JSX element containing skeleton loaders.
     */
    const renderSkeleton = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, index) => (
          <VCSOptionSkeleton key={index} />
        ))}
      </div>
    );

    /**
     * Renders the content based on the current state (loading, error, or repositories).
     * @returns A JSX element representing the current state.
     */
    const renderContent = () => {
      if (isImmediateLoading || isRepoLoading) {
        return renderSkeleton();
      }

      if (repoError) {
        return <div className="text-red-500">Error: {repoError.message}</div>;
      }

      return renderRepositories();
    };

    // Display error message if GitHub integration fails
    if (integrationError) {
      return (
        <div className="p-6 max-w-[1320px] mx-auto">
          <div className="text-red-500">Error: {integrationError.message}</div>
        </div>
      );
    }

    // Display a prompt to connect GitHub if not connected
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
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white mb-4">
            Repository Selection
          </h1>
          <p className="text-gray-400 text-[13px]">
            Select a repository to use for your workspace.
          </p>
        </div>

        {/* Main Content: Skeleton or Repositories */}
        {renderContent()}
      </div>
    );
  }
);

/**
 * RepositoryOption Component
 * Represents a single repository card.
 */
interface RepositoryOptionProps {
  repository: Repository;
  isSelected: boolean;
  onSelect: (repoFullName: string, repoCloneUrl: string) => void;
  getStatusText: (repo: Repository) => JSX.Element;
}

const RepositoryOption: React.FC<RepositoryOptionProps> = React.memo(
  ({ repository, isSelected, onSelect, getStatusText }) => {
    /**
     * Handles the click event on the repository card.
     */
    const handleClick = () => {
      onSelect(repository.full_name, repository.clone_url);
    };

    /**
     * Handles the key press event for accessibility.
     * @param e - The keyboard event.
     */
    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        onSelect(repository.full_name, repository.clone_url);
      }
    };

    return (
      <div
        role="button"
        tabIndex={0}
        className={`bg-dashboard border ${
          isSelected ? "border-green-500" : "border-border"
        } rounded-[5px] p-4 flex flex-col justify-between cursor-pointer transition-colors duration-300`}
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        aria-disabled={!isSelected}
        aria-pressed={isSelected}
      >
        <div>
          <div className="flex items-center">
            <h3 className="text-white text-sm font-semibold mb-1.5">
              {repository.name}
            </h3>
          </div>
          <div className="flex items-center text-xs text-gray-400 mb-2">
            {repository.owner.login}
          </div>
          <p className="text-gray-400 text-xs mb-6">
            {repository.description || "No description provided."}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <RepositoryOptionStatus
            repository={repository}
            getStatusText={getStatusText}
          />
          <div className="flex items-center text-[11px] text-gray-400">
            <span className="mr-1">Updated</span>
            <span>
              {formatDistanceToNow(new Date(repository.updated_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

/**
 * RepositoryOptionStatus Component
 * Displays the status text for a repository.
 */
interface RepositoryOptionStatusProps {
  repository: Repository;
  getStatusText: (repo: Repository) => JSX.Element;
}

const RepositoryOptionStatus: React.FC<RepositoryOptionStatusProps> = ({
  repository,
  getStatusText,
}) => {
  return <div>{getStatusText(repository)}</div>;
};

export default RepositorySelection;
