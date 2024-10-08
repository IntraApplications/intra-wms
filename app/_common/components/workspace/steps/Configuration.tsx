// Configuration.tsx
import React from "react";
import Input from "@/_common/components/Input"; // Adjust the import path as needed
import Button from "@/_common/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faPlusCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

interface ConfigurationProps {}

const Configuration: React.FC<ConfigurationProps> = () => {
  const environmentAnalysis = usePodCreationStore(
    (state) => state.environmentAnalysis
  );
  const setEnvironmentAnalysis = usePodCreationStore(
    (state) => state.setEnvironmentAnalysis
  );

  // Handle changes to languageVersion
  const handleLanguageVersionChange = (value: string) => {
    setEnvironmentAnalysis({
      languageVersion: value,
    });
  };

  // Handle Environment Variables
  const handleEnvVarChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updatedEnvVars = [...environmentAnalysis.environmentVariables];
    const envVarString = updatedEnvVars[index] || "=";
    const [currentKey, currentValue] = envVarString.split("=");
    const newEnvVar =
      field === "key" ? `${value}=${currentValue}` : `${currentKey}=${value}`;
    updatedEnvVars[index] = newEnvVar;
    setEnvironmentAnalysis({
      environmentVariables: updatedEnvVars,
    });

    console.log(environmentAnalysis);
  };

  const addEnvVar = () => {
    const updatedEnvVars = [...environmentAnalysis.environmentVariables, "="];
    setEnvironmentAnalysis({
      environmentVariables: updatedEnvVars,
    });

    console.log(environmentAnalysis);
  };

  const removeEnvVar = (index: number) => {
    const updatedEnvVars = environmentAnalysis.environmentVariables.filter(
      (_, i) => i !== index
    );
    setEnvironmentAnalysis({
      environmentVariables: updatedEnvVars,
    });
  };

  // Parse environment variables into key-value pairs
  const parsedEnvVars = environmentAnalysis.environmentVariables.map(
    (envVar) => {
      const [key, ...rest] = envVar.split("=");
      const value = rest.join("=");
      return { key, value };
    }
  );

  // Handle Startup Commands
  const handleStartupCommandChange = (index: number, value: string) => {
    const updatedCommands = [...environmentAnalysis.startupCommands];
    updatedCommands[index] = value;
    setEnvironmentAnalysis({
      startupCommands: updatedCommands,
    });
  };

  const addStartupCommand = () => {
    const updatedCommands = [...environmentAnalysis.startupCommands, ""];
    setEnvironmentAnalysis({
      startupCommands: updatedCommands,
    });
  };

  const removeStartupCommand = (index: number) => {
    const updatedCommands = environmentAnalysis.startupCommands.filter(
      (_, i) => i !== index
    );
    setEnvironmentAnalysis({
      startupCommands: updatedCommands,
    });
  };

  // Handle Ports
  const handlePortChange = (index: number, value: string) => {
    const portNumber = parseInt(value, 10);
    const updatedPorts = [...environmentAnalysis.ports];
    if (!isNaN(portNumber)) {
      updatedPorts[index] = portNumber;
      setEnvironmentAnalysis({
        ports: updatedPorts,
      });
    }
  };

  const addPort = () => {
    const updatedPorts = [...environmentAnalysis.ports, 0];
    setEnvironmentAnalysis({
      ports: updatedPorts,
    });
  };

  const removePort = (index: number) => {
    const updatedPorts = environmentAnalysis.ports.filter(
      (_, i) => i !== index
    );
    setEnvironmentAnalysis({
      ports: updatedPorts,
    });
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
        {/*}
        <div className="mb-6">
          <Input
            label="Language Version"
            value={environmentAnalysis.languageVersion}
            onChange={(e) => {
              handleLanguageVersionChange(e.target.value);
            }}
            error={undefined}
          />
        </div>
          */}

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
            {parsedEnvVars.map((envVar, index) => (
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

        {/* Startup Commands */}
        {/*
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-[13px] font-medium">
              Startup Commands
            </label>
            <button
              onClick={addStartupCommand}
              className="text-blue-500 hover:text-blue-400 focus:outline-none text-[13px]"
            >
              <FontAwesomeIcon icon={faPlusCircle} className="mr-1" />
              Add Command
            </button>
          </div>
          <AnimatePresence>
            {environmentAnalysis.startupCommands.map((command, index) => (
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
                    label={`Command ${index + 1}`}
                    value={command}
                    onChange={(e) =>
                      handleStartupCommandChange(index, e.target.value)
                    }
                    error={undefined}
                  />
                </div>
                <button
                  onClick={() => removeStartupCommand(index)}
                  className="text-red-500 hover:text-red-400 focus:outline-none mt-6"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
*/}
        {/* Ports */}
        {/*
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-[13px] font-medium">Ports</label>
            <button
              onClick={addPort}
              className="text-blue-500 hover:text-blue-400 focus:outline-none text-[13px]"
            >
              <FontAwesomeIcon icon={faPlusCircle} className="mr-1" />
              Add Port
            </button>
          </div>
          <AnimatePresence>
            {environmentAnalysis.ports.map((port, index) => (
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
                    label={`Port ${index + 1}`}
                    type="number"
                    value={port || ""}
                    onChange={(e) => handlePortChange(index, e.target.value)}
                    error={undefined}
                  />
                </div>

                <button
                  onClick={() => removePort(index)}
                  className="text-red-500 hover:text-red-400 focus:outline-none mt-6"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
            */}
      </div>

      {/* Notes */}
      {environmentAnalysis.notes && (
        <div className="bg-dashboard border border-border rounded-[5px] p-4 mb-6">
          <h2 className="text-white text-[14px] font-semibold mb-2">Notes</h2>
          <p className="text-gray-400 text-[13px]">
            {environmentAnalysis.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default Configuration;
