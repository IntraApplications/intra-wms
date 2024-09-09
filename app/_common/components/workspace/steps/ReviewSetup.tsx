import React from "react";

interface ReviewSetupProps {
  workspaceData: any;
  updateWorkspaceData: (data: any) => void;
}

const ReviewSetup: React.FC<ReviewSetupProps> = ({ workspaceData }) => {
  return (
    <div>
      <h3 className="text-white text-xl mb-4">Review Your Workspace Setup</h3>
      <div className="space-y-4">
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2">
            Version Control System
          </h4>
          <p className="text-gray-400">{workspaceData.vcs}</p>
        </div>
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Repository</h4>
          <p className="text-gray-400">{workspaceData.repositoryId}</p>
        </div>
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Branch</h4>
          <p className="text-gray-400">{workspaceData.branch}</p>
        </div>
        <div className="bg-[#2A2A2A] p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2">
            Development Environment
          </h4>
          <p className="text-gray-400">{workspaceData.environment}</p>
        </div>
      </div>
      <p className="text-gray-400 mt-6">
        Please review your workspace setup. If everything looks correct, click
        "Create" to set up your new workspace.
      </p>
    </div>
  );
};

export default ReviewSetup;
