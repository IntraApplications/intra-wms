import React, { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faPlusCircle,
  faTrash,
  faChevronDown,
  faServer,
  faLaptopCode,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

const CustomDropdown = ({ options, defaultValue, includeIcons = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue);

  return (
    <div className="relative">
      <div
        className="bg-dashboard border border-border rounded-[4px] text-white text-[13px] p-3.5 w-full cursor-pointer hover:border-blue-500 transition-colors duration-300 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          {includeIcons && (
            <FontAwesomeIcon
              icon={selectedOption.icon}
              className="mr-2 text-blue-500"
            />
          )}
          {includeIcons ? selectedOption.label : selectedOption}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-gray-400 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-1 bg-dashboard border border-border rounded-[4px] shadow-lg overflow-hidden"
          >
            {options.map((option, index) => (
              <div
                key={includeIcons ? option.value : option}
                className="text-white text-[13px] p-3.5 cursor-pointer flex items-center transition-all duration-200 hover:border-l-4 hover:border-blue-500 hover:pl-3"
                onClick={() => {
                  setSelectedOption(option);
                  setIsOpen(false);
                }}
              >
                {includeIcons && (
                  <FontAwesomeIcon
                    icon={option.icon}
                    className="mr-2 text-blue-500"
                  />
                )}
                {includeIcons ? option.label : option}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Configuration: React.FC = () => {
  const { environmentAnalysis, setEnvironmentAnalysis } = usePodCreationStore(
    (state) => state
  );

  const handleEnvVarChange = useCallback(
    (index: number, field: "key" | "value", value: string) => {
      const updatedEnvVars = [...environmentAnalysis.environmentVariables];
      const [key, oldValue] = updatedEnvVars[index].split("=");
      updatedEnvVars[index] =
        field === "key" ? `${value}=${oldValue || ""}` : `${key}=${value}`;
      setEnvironmentAnalysis({
        ...environmentAnalysis,
        environmentVariables: updatedEnvVars,
      });
    },
    [environmentAnalysis, setEnvironmentAnalysis]
  );

  const addEnvVar = useCallback(() => {
    setEnvironmentAnalysis({
      ...environmentAnalysis,
      environmentVariables: [...environmentAnalysis.environmentVariables, "="],
    });
  }, [environmentAnalysis, setEnvironmentAnalysis]);

  const removeEnvVar = useCallback(
    (index: number) => {
      const updatedEnvVars = environmentAnalysis.environmentVariables.filter(
        (_, i) => i !== index
      );
      setEnvironmentAnalysis({
        ...environmentAnalysis,
        environmentVariables: updatedEnvVars,
      });
    },
    [environmentAnalysis, setEnvironmentAnalysis]
  );

  const branchOptions = ["main", "develop", "feature/new-feature"];
  const resourceOptions = [
    {
      value: "small",
      icon: faLaptopCode,
      label: "Small (2 CPU, 4GB RAM, 20GB Storage)",
    },
    {
      value: "standard",
      icon: faServer,
      label: "Standard (4 CPU, 8GB RAM, 40GB Storage)",
    },
    {
      value: "large",
      icon: faRocket,
      label: "Large (8 CPU, 16GB RAM, 80GB Storage)",
    },
  ];

  return (
    <div className="p-6 max-w-[1320px] mx-auto bg-primary">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-[14px] font-semibold text-white mb-2 flex items-center">
          <FontAwesomeIcon icon={faCogs} className="text-blue-500 mr-2" />
          Configuration
        </h1>
        <p className="text-gray-400 text-[12px]">
          Customize your workspace settings below. Review and adjust environment
          variables, ports, and other configurations.
        </p>
      </div>

      {/* Branch Selection Section */}
      <div className="mb-8">
        <label className="text-white text-[13px] font-medium mb-2 block">
          Branch
        </label>
        <CustomDropdown options={branchOptions} defaultValue="main" />
      </div>

      {/* Resource Allocation Section */}
      <div className="mb-8">
        <label className="text-white text-[13px] font-medium mb-2 block">
          Resource Allocation
        </label>
        <CustomDropdown
          options={resourceOptions}
          defaultValue={resourceOptions[1]}
          includeIcons={true}
        />
      </div>

      {/* Environment Variables Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-white text-[13px] font-medium">
            Environment Variables
          </label>
          <button
            onClick={addEnvVar}
            className="text-blue-500 hover:text-blue-400 focus:outline-none text-[13px]"
            aria-label="Add Environment Variable"
          >
            <FontAwesomeIcon icon={faPlusCircle} className="mr-1" />
            Add Variable
          </button>
        </div>
        <AnimatePresence>
          {environmentAnalysis.environmentVariables.map((envVar, index) => {
            const [key, value] = envVar.split("=");
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center mb-4"
              >
                <div className="flex-1 mr-4">
                  <input
                    value={key}
                    onChange={(e) =>
                      handleEnvVarChange(index, "key", e.target.value)
                    }
                    placeholder="ENV_VAR_KEY"
                    className="w-full bg-primary text-white text-[13px] p-3.5 border border-border rounded-[4px] focus:border-blue-500 hover:border-gray-500 transition-colors duration-300 outline-none"
                  />
                </div>
                <div className="flex-1 mr-2">
                  <input
                    value={value}
                    onChange={(e) =>
                      handleEnvVarChange(index, "value", e.target.value)
                    }
                    placeholder="ENV_VAR_VALUE"
                    className="w-full bg-primary text-white text-[13px] p-3.5 border border-border rounded-[4px] focus:border-blue-500 hover:border-gray-500 transition-colors duration-300 outline-none"
                  />
                </div>
                <button
                  onClick={() => removeEnvVar(index)}
                  className="text-red-500 hover:text-red-400 focus:outline-none"
                  aria-label={`Remove Environment Variable ${index + 1}`}
                >
                  <FontAwesomeIcon icon={faTrash} className="text-sm" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Notes Section */}
      {environmentAnalysis.notes && (
        <div className="bg-primary border border-border rounded-[4px] p-3.5 mb-4">
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
