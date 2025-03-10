import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faGitlab,
  faBitbucket,
} from "@fortawesome/free-brands-svg-icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import Button from "@/_common/components/Button";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

/**
 * Interface for VCS options.
 */
interface VCSOption {
  name: string;
  icon: any; // Replace 'any' with the appropriate type if possible
  description: string;
}

/**
 * VCS options available.
 */
const vcsOptions: VCSOption[] = [
  {
    name: "GitHub",
    icon: faGithub,
    description:
      "Connect your GitHub, pick your repository, and start coding instantly with Intra's automatic workspaces.",
  },
  {
    name: "GitLab",
    icon: faGitlab,
    description:
      "Link your GitLab account, choose your project, and get a ready-to-code environment with Intra's automated workspaces.",
  },
  {
    name: "Bitbucket",
    icon: faBitbucket,
    description:
      "Sync your Bitbucket repository, select your project, and start developing immediately with Intra's seamless workspaces.",
  },
  {
    name: "Blank Workspace",
    icon: faCode,
    description:
      "Start with an empty environment, fully customizable to your needs. Configure your workspace from scratch without linking to any repository.",
  },
];

/**
 * Skeleton component for loading state.
 */
const VCSOptionSkeleton: React.FC = React.memo(() => (
  <div className="bg-dashboard border border-border rounded-[5px] p-4 flex flex-col justify-between overflow-hidden">
    <div>
      <div className="flex items-center mb-2">
        {/* Icon Skeleton */}
        <div className="w-6 h-6 bg-skeleton rounded mr-2 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer w-full h-full"></div>
        </div>
        {/* Title Skeleton */}
        <div className="h-4 bg-skeleton rounded w-24 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer w-full h-full"></div>
        </div>
      </div>
      {/* Line Skeletons */}
      <div className="h-3 bg-skeleton rounded w-full mb-1 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer w-full h-full"></div>
      </div>
      <div className="h-3 bg-skeleton rounded w-3/4 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer w-full h-full"></div>
      </div>
    </div>
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center">
        {/* Status Indicator Skeleton */}
        <div className="w-2 h-2 bg-skeleton rounded-full mr-2 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer w-full h-full"></div>
        </div>
        {/* Status Text Skeleton */}
        <div className="h-3 bg-skeleton rounded w-16 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer w-full h-full"></div>
        </div>
      </div>
      {/* Button Skeleton */}
      <div className="w-16 h-6 bg-skeleton rounded relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer w-full h-full"></div>
      </div>
    </div>
  </div>
));

/**
 * Props for the VCSSelection component.
 */
interface VCSSelectionProps {}

/**
 * VCSSelection Component
 * Allows users to select a Version Control System (VCS) or start with a blank workspace.
 */
const VCSSelection: React.FC<VCSSelectionProps> = React.memo(() => {
  // Accessing state from the PodCreationStore
  const vcs = usePodCreationStore((state) => state.vcs);
  const setVCS = usePodCreationStore((state) => state.setVCS);

  // GitHub integration status and actions
  const { isPending, isConnected, githubOrgName, initiateInstall, error } =
    useGitHubIntegration();

  /**
   * Handles the selection of a VCS option.
   * @param vcsName - The name of the selected VCS.
   */
  const handleSelect = useCallback(
    (vcsName: string) => {
      if (vcsName === "GitHub") {
        if (isConnected) {
          setVCS(vcsName);
        } else {
          initiateInstall();
        }
      } else if (vcsName === "Blank Workspace") {
        setVCS(vcsName);
      }
      // No action for other VCS options yet
    },
    [isConnected, initiateInstall, setVCS]
  );

  /**
   * Placeholder function to handle disabling the GitHub integration.
   * Should be implemented based on requirements.
   */
  const handleDisable = useCallback(() => {
    // TODO: Implement the logic to disable GitHub integration
    console.log("Disabling integration...");
  }, []);

  /**
   * Determines the properties of the action button based on the VCS option.
   * @param option - The VCS option.
   * @returns An object with button properties or null if no action is needed.
   */
  const getButtonProps = useCallback(
    (option: { name: string }) => {
      if (option.name === "GitHub") {
        if (isConnected) {
          return {
            text: "Disable",
            colorType: "danger" as const,
            handleClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              handleDisable();
            },
          };
        } else {
          return {
            text: "Connect",
            colorType: "secondary" as const,
            handleClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              initiateInstall();
            },
          };
        }
      } else if (option.name === "Blank Workspace") {
        return null;
      } else {
        return null;
      }
    },
    [isConnected, initiateInstall, handleDisable]
  );

  /**
   * Generates the status text for a given VCS option.
   * @param option - The VCS option.
   * @returns A JSX element representing the status text.
   */
  const getStatusText = useCallback(
    (option: { name: string }) => {
      if (option.name === "GitHub" && isConnected) {
        return (
          <span className="flex items-center text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-accent">{githubOrgName}</span>
          </span>
        );
      } else if (option.name === "Blank Workspace") {
        return (
          <span className="flex items-center text-xs">
            <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
            <span className="text-accent">Create From Scratch</span>
          </span>
        );
      } else if (option.name === "GitHub" && !isConnected) {
        return (
          <span className="flex items-center text-xs">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            <span className="text-red-500">Not Connected</span>
          </span>
        );
      } else {
        return (
          <span className="flex items-center text-xs">
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
            <span className="text-gray-500">Coming Soon</span>
          </span>
        );
      }
    },
    [isConnected, githubOrgName]
  );

  // Display error message if there's an error
  if (error) {
    return (
      <div className="p-6 max-w-[1320px] mx-auto">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white mb-4">
          Version Control Integration
        </h1>
        <p className="text-gray-400 text-[13px]">
          Connect and manage your repositories effortlessly. Select your
          preferred version control system, and Intra will set up your workspace
          for seamless, real-time collaboration.
        </p>
      </div>

      {isPending ? (
        // Display skeletons while data is loading
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <VCSOptionSkeleton key={index} />
          ))}
        </div>
      ) : (
        // Display VCS options
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vcsOptions.map((option, index) => {
            const isSelected = vcs === option.name;
            const isDisabled =
              option.name === "GitLab" || option.name === "Bitbucket";

            return (
              <div
                key={index}
                className={`bg-dashboard border ${
                  isSelected ? "border-green-500" : "border-border"
                } rounded-[5px] p-4 flex flex-col justify-between cursor-pointer ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                } transition-colors duration-300`}
                onClick={() => {
                  if (isDisabled) return;
                  handleSelect(option.name);
                }}
              >
                <div>
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon
                      icon={option.icon}
                      className="text-white mr-2"
                      size="lg"
                    />
                    <h3 className="text-white text-sm font-semibold">
                      {option.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-xs">{option.description}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  {getStatusText(option)}
                  {getButtonProps(option) && (
                    <Button
                      {...getButtonProps(option)!}
                      size="xs"
                      type="button"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default VCSSelection;
