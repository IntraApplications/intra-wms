import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faGitlab,
  faBitbucket,
} from "@fortawesome/free-brands-svg-icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import Button from "@/_common/components/Button";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

const vcsOptions = [
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

const VCSOptionSkeleton = () => (
  <div className="bg-dashboard border border-border rounded-[5px] p-4 flex flex-col justify-between overflow-hidden">
    <div>
      <div className="flex items-center mb-2">
        <div className="w-6 h-6 bg-primary rounded mr-2 animate-shimmer"></div>
        <div className="h-4 bg-primary rounded w-24 animate-shimmer"></div>
      </div>
      <div className="h-3 bg-primary rounded w-full mb-1 animate-shimmer"></div>
      <div className="h-3 bg-primary rounded w-3/4 animate-shimmer"></div>
    </div>
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-shimmer"></div>
        <div className="h-3 bg-primary rounded w-16 animate-shimmer"></div>
      </div>
      <div className="w-16 h-6 bg-primary rounded animate-shimmer"></div>
    </div>
  </div>
);

const VCSSelection: React.FC = ({}) => {
  const {
    isLoading,
    error,
    orgName,
    githubOrgName,
    isConnected,
    initiateInstall,
    checkInstallation,
  } = useGitHubIntegration();

  const { message } = useWebSocketContext();

  const handleSelect = (vcsName: string) => {
    if (vcsName === "GitHub") {
      if (isConnected) {
        //updateWorkspaceData({ vcs: vcsName });
      } else {
        initiateInstall();
      }
    } else if (vcsName === "Blank Workspace") {
      // updateWorkspaceData({ vcs: vcsName });
    } else {
      alert(`${vcsName} integration is coming soon!`);
    }
  };

  const getButtonProps = (option) => {
    if (option.name === "GitHub") {
      return {
        text: isConnected ? "Continue" : "Connect",
        colorType: isConnected ? "tertiary" : "secondary",
      };
    } else if (option.name === "Blank Workspace") {
      return {
        text: "Create",
        colorType: "tertiary",
      };
    } else {
      return {
        text: "Connect",
        colorType: "secondary",
      };
    }
  };

  const getStatusText = (option) => {
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
    } else {
      return (
        <span className="flex items-center text-xs">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          <span className="text-red-500">Not Connected</span>
        </span>
      );
    }
  };

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <VCSOptionSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vcsOptions.map((option, index) => (
            <div
              key={index}
              className="bg-dashboard border border-border rounded-[5px] p-4 flex flex-col justify-between"
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
                <Button
                  {...getButtonProps(option)}
                  size="xs"
                  type="button"
                  handleClick={() => handleSelect(option.name)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VCSSelection;
