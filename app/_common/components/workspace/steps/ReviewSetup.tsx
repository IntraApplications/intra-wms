// ReviewSetup.tsx
import React from "react";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faBook,
  faCodeBranch,
  faTerminal,
  faNetworkWired,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const ReviewSetup: React.FC = () => {
  const vcs = usePodCreationStore((state) => state.vcs);
  const repositoryName = usePodCreationStore((state) => state.repositoryName);
  const environmentAnalysis = usePodCreationStore(
    (state) => state.environmentAnalysis
  );

  // Parse environment variables into key-value pairs
  const parsedEnvVars = environmentAnalysis.environmentVariables.map(
    (envVar) => {
      const [key, ...rest] = envVar.split("=");
      const value = rest.join("=");
      return { key, value };
    }
  );

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white mb-4">
          Review Your Setup
        </h1>
        <p className="text-gray-400 text-sm">
          Please review your workspace configuration before proceeding.
        </p>
      </div>

      {/* VCS and Repository Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* VCS Information */}
        <div className="bg-dashboard border border-border rounded-[5px] p-4">
          <h2 className="text-white text-base font-semibold mb-2 flex items-center">
            <FontAwesomeIcon icon={faGithub} className="text-white mr-2" />
            Version Control System
          </h2>
          <p className="text-gray-400 text-sm">{vcs || "Not selected"}</p>
        </div>

        {/* Repository Information */}
        {repositoryName && (
          <div className="bg-dashboard border border-border rounded-[5px] p-4">
            <h2 className="text-white text-base font-semibold mb-2 flex items-center">
              <FontAwesomeIcon icon={faBook} className="text-white mr-2" />
              Repository
            </h2>
            <p className="text-gray-400 text-sm">{repositoryName}</p>
          </div>
        )}
      </div>

      {/* Configuration Summary */}
      <div className="bg-dashboard border border-border rounded-[5px] p-4 mb-6">
        <h2 className="text-white text-base font-semibold mb-4 flex items-center">
          <FontAwesomeIcon icon={faCogs} className="text-white mr-2" />
          Configuration
        </h2>
        <div className="space-y-4">
          {/* Language Version */}
          {environmentAnalysis.languageVersion && (
            <div>
              <h3 className="text-white text-sm font-medium mb-1">
                Language Version
              </h3>
              <p className="text-gray-400 text-sm">
                {environmentAnalysis.languageVersion}
              </p>
            </div>
          )}

          {/* Environment Variables */}
          {parsedEnvVars.length > 0 && (
            <div>
              <h3 className="text-white text-sm font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faCodeBranch} className="mr-2" />
                Environment Variables
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-gray-400 text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Key</th>
                      <th className="px-4 py-2 text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedEnvVars.map((envVar, index) => (
                      <tr key={index} className="bg-dashboard">
                        <td className="px-4 py-2">{envVar.key}</td>
                        <td className="px-4 py-2">{envVar.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Startup Commands */}
          {environmentAnalysis.startupCommands.length > 0 && (
            <div>
              <h3 className="text-white text-sm font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faTerminal} className="mr-2" />
                Startup Commands
              </h3>
              <ul className="list-disc list-inside text-gray-400 text-sm ml-6 space-y-1">
                {environmentAnalysis.startupCommands.map((command, index) => (
                  <li key={index}>{command}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ports */}
          {environmentAnalysis.ports.length > 0 && (
            <div>
              <h3 className="text-white text-sm font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faNetworkWired} className="mr-2" />
                Ports
              </h3>
              <ul className="list-disc list-inside text-gray-400 text-sm ml-6 space-y-1">
                {environmentAnalysis.ports.map((port, index) => (
                  <li key={index}>{port}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {environmentAnalysis.notes && (
            <div>
              <h3 className="text-white text-sm font-medium mb-2 flex items-center">
                <FontAwesomeIcon icon={faStickyNote} className="mr-2" />
                Notes
              </h3>
              <p className="text-gray-400 text-sm ml-6">
                {environmentAnalysis.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dockerfile */}
      {environmentAnalysis.dockerfile && (
        <div className="bg-dashboard border border-border rounded-[5px] p-4 mb-6">
          <h2 className="text-white text-base font-semibold mb-2">
            Dockerfile
          </h2>
          <pre className="bg-gray-800 text-gray-300 p-4 rounded-md overflow-x-auto text-sm">
            {environmentAnalysis.dockerfile}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ReviewSetup;
