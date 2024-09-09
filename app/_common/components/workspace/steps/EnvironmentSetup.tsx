import React, { useState } from "react";
import Button from "@/_common/components/Button";

interface EnvironmentSetupProps {
  workspaceData: any;
  updateWorkspaceData: (data: any) => void;
}

const EnvironmentSetup: React.FC<EnvironmentSetupProps> = ({
  workspaceData,
  updateWorkspaceData,
}) => {
  const [selectedEnv, setSelectedEnv] = useState("");

  const environments = [
    {
      id: "node",
      name: "Node.js",
      description: "JavaScript runtime built on Chrome's V8 JavaScript engine",
    },
    {
      id: "python",
      name: "Python",
      description:
        "High-level programming language for general-purpose programming",
    },
    {
      id: "ruby",
      name: "Ruby",
      description:
        "Dynamic, reflective, object-oriented, general-purpose programming language",
    },
    {
      id: "java",
      name: "Java",
      description:
        "General-purpose programming language that is class-based, object-oriented",
    },
  ];

  const handleSelectEnv = (envId: string) => {
    setSelectedEnv(envId);
    updateWorkspaceData({ environment: envId });
  };

  return (
    <div>
      <h3 className="text-white text-xl mb-4">
        Select Development Environment
      </h3>
      <div className="space-y-4">
        {environments.map((env) => (
          <div key={env.id} className="bg-[#2A2A2A] p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-white font-semibold">{env.name}</h4>
                <p className="text-gray-400 text-sm">{env.description}</p>
              </div>
              <Button
                text="Select"
                size="xs"
                type="button"
                handleClick={() => handleSelectEnv(env.id)}
                className={selectedEnv === env.id ? "bg-green-600" : ""}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentSetup;
