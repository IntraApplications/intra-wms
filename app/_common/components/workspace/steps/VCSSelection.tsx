import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faGitlab,
  faBitbucket,
} from "@fortawesome/free-brands-svg-icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import Button from "@/_common/components/Button";

interface VCSSelectionProps {
  workspaceData: any;
  updateWorkspaceData: (data: any) => void;
}

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

const VCSSelection: React.FC<VCSSelectionProps> = ({
  workspaceData,
  updateWorkspaceData,
}) => {
  const handleSelect = (vcsName: string) => {
    updateWorkspaceData({ vcs: vcsName });
  };

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-4">
          Version Control Integration
        </h1>
        <p className="text-gray-400 text-sm">
          Connect and manage your repositories effortlessly. Select your
          preferred version control system, and Intra will set up your workspace
          for seamless, real-time collaboration.
        </p>
      </div>
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
              <span className="flex items-center text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-accent">Connected</span>
              </span>
              <Button
                text="Select"
                size="xs"
                type="button"
                colorType="secondary"
                handleClick={() => handleSelect(option.name)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VCSSelection;
