// Configuration.tsx
import React, { useState, useEffect } from "react";
import Input from "@/_common/components/Input"; // Adjust the import path as needed
import Button from "@/_common/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faPlusCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

interface ConfigurationProps {
  workspaceData: any;
  updateWorkspaceData: (data: any) => void;
}

interface EnvVariable {
  key: string;
  value: string;
}

const Configuration: React.FC<ConfigurationProps> = ({
  workspaceData,
  updateWorkspaceData,
}) => {
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([]);
  const [ports, setPorts] = useState<number[]>([]);
  const [languageVersion, setLanguageVersion] = useState<string>("");

  useEffect(() => {
    // Initialize state with analysis data
    if (workspaceData.environmentAnalysis) {
      const analysis = workspaceData.environmentAnalysis;
      setLanguageVersion(analysis.languageVersion || "");

      // Environment Variables
      if (analysis.environmentVariables) {
        const initialEnvVars = analysis.environmentVariables.map(
          (variable: string) => ({
            key: variable,
            value: "",
          })
        );
        setEnvVariables(initialEnvVars);
      }

      // Ports
      if (analysis.ports) {
        setPorts(analysis.ports);
      }
    }
  }, [workspaceData.environmentAnalysis]);

  const handleEnvVarChange = (index: number, field: string, value: string) => {
    const updatedEnvVars = [...envVariables];
    updatedEnvVars[index][field as keyof EnvVariable] = value;
    setEnvVariables(updatedEnvVars);
    updateWorkspaceData({ envVariables: updatedEnvVars });
  };

  const addEnvVar = () => {
    setEnvVariables([...envVariables, { key: "", value: "" }]);
  };

  const removeEnvVar = (index: number) => {
    const updatedEnvVars = envVariables.filter((_, i) => i !== index);
    setEnvVariables(updatedEnvVars);
    updateWorkspaceData({ envVariables: updatedEnvVars });
  };

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[16px] font-semibold text-white mb-4 flex items-center">
          <FontAwesomeIcon icon={faCogs} className="text-blue-500 mr-2" />
          Configuration
        </h1>
        <p className="text-gray-400 text-[13px]">
          Customize your workspace settings below. Review and adjust environment
          variables, ports, and other configurations.
        </p>
      </div>

      <div className="mb-6">
        {/* Language Version */}
        <div className="mb-6">
          <Input
            label="Language Version"
            value={languageVersion}
            onChange={(e) => {
              setLanguageVersion(e.target.value);
              updateWorkspaceData({ languageVersion: e.target.value });
            }}
            error={undefined}
          />
        </div>

        {/* Environment Variables */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-[13px] font-medium">
              Environment Variables
            </label>
            <button
              onClick={addEnvVar}
              className="text-blue-500 hover:text-blue-400 focus:outline-none text-[13px]"
            >
              <FontAwesomeIcon icon={faPlusCircle} className="mr-1" />
              Add Variable
            </button>
          </div>
          <AnimatePresence>
            {envVariables.map((envVar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center mb-4"
              >
                <div className="flex-1 mr-2">
                  <Input
                    label="Key"
                    value={envVar.key}
                    onChange={(e) =>
                      handleEnvVarChange(index, "key", e.target.value)
                    }
                    error={undefined}
                  />
                </div>
                <div className="flex-1 mr-2">
                  <Input
                    label="Value"
                    value={envVar.value}
                    onChange={(e) =>
                      handleEnvVarChange(index, "value", e.target.value)
                    }
                    error={undefined}
                  />
                </div>
                <button
                  onClick={() => removeEnvVar(index)}
                  className="text-red-500 hover:text-red-400 focus:outline-none mt-6"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Ports */}
        <div className="mb-6">
          <Input
            label="Port"
            type="number"
            value={ports[0] || ""}
            onChange={(e) => {
              const portNumber = parseInt(e.target.value, 10);
              setPorts([portNumber]);
              updateWorkspaceData({ ports: [portNumber] });
            }}
            error={undefined}
          />
        </div>
      </div>

      {/* Notes */}
      {workspaceData.environmentAnalysis?.notes && (
        <div className="bg-dashboard border border-border rounded-[5px] p-4 mb-6">
          <h2 className="text-white text-[14px] font-semibold mb-2">Notes</h2>
          <p className="text-gray-400 text-[13px]">
            {workspaceData.environmentAnalysis.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default Configuration;
