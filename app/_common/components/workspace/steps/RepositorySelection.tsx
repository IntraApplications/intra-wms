import React, { useState, useEffect } from "react";
import Button from "@/_common/components/Button";

interface RepositorySelectionProps {
  workspaceData: any;
  updateWorkspaceData: (data: any) => void;
}

const RepositorySelection: React.FC<RepositorySelectionProps> = ({
  workspaceData,
  updateWorkspaceData,
}) => {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");

  useEffect(() => {
    // Fetch repositories based on the selected VCS
    // This is a mock function, replace with actual API call
    const fetchRepositories = async () => {
      const mockRepos = [
        { id: "1", name: "repo1", description: "Description for repo1" },
        { id: "2", name: "repo2", description: "Description for repo2" },
        { id: "3", name: "repo3", description: "Description for repo3" },
      ];
      setRepositories(mockRepos);
    };

    fetchRepositories();
  }, [workspaceData.vcs]);

  const handleSelectRepo = (repoId: string) => {
    setSelectedRepo(repoId);
    updateWorkspaceData({ repositoryId: repoId });
  };

  return (
    <div>
      <h3 className="text-white text-xl mb-4">Select a Repository</h3>
      <div className="space-y-4">
        {repositories.map((repo: any) => (
          <div key={repo.id} className="bg-[#2A2A2A] p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-white font-semibold">{repo.name}</h4>
                <p className="text-gray-400 text-sm">{repo.description}</p>
              </div>
              <Button
                text="Select"
                size="xs"
                type="button"
                handleClick={() => handleSelectRepo(repo.id)}
                className={selectedRepo === repo.id ? "bg-green-600" : ""}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepositorySelection;
