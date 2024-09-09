import React, { useState, useEffect } from "react";
import Button from "@/_common/components/Button";

interface BranchSelectionProps {
  workspaceData: any;
  updateWorkspaceData: (data: any) => void;
}

const BranchSelection: React.FC<BranchSelectionProps> = ({
  workspaceData,
  updateWorkspaceData,
}) => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  useEffect(() => {
    // Fetch branches based on the selected repository
    // This is a mock function, replace with actual API call
    const fetchBranches = async () => {
      const mockBranches = [
        "main",
        "develop",
        "feature/new-ui",
        "bugfix/login-issue",
      ];
      setBranches(mockBranches);
    };

    fetchBranches();
  }, [workspaceData.repositoryId]);

  const handleSelectBranch = (branch: string) => {
    setSelectedBranch(branch);
    updateWorkspaceData({ branch });
  };

  return (
    <div>
      <h3 className="text-white text-xl mb-4">Select a Branch</h3>
      <div className="space-y-2">
        {branches.map((branch) => (
          <div
            key={branch}
            className="flex justify-between items-center bg-[#2A2A2A] p-3 rounded-lg"
          >
            <span className="text-white">{branch}</span>
            <Button
              text="Select"
              size="xs"
              type="button"
              handleClick={() => handleSelectBranch(branch)}
              className={selectedBranch === branch ? "bg-green-600" : ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchSelection;
