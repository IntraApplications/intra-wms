"use client";

import React, { useState, useCallback } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Code,
  GitBranch,
  Clock,
  Monitor,
  Activity,
  Users,
  HardDrive,
  Cpu,
  X,
} from "lucide-react";
import Button from "@/_common/components/Button";
import Modal from "@/_common/components/Modal";
import PodCreationModal from "@/_common/components/workspace/PodCreationModal";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

const WorkspacePage = () => {
  const [filter, setFilter] = useState("");
  const [hasWorkspaces, setHasWorkspaces] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reset = usePodCreationStore((state) => state.reset);

  const handleCreateWorkspace = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    reset();
    setIsModalOpen(false);
  }, [reset]);

  const clearFilter = useCallback(() => {
    setFilter("");
  }, []);

  const workspaces = [
    {
      id: "intrasampl-templaterub-jbuscp33hn2",
      name: "Ruby on Rails Template",
      repo: "intra-samples/template-ruby-on-rails-postgres",
      branch: "main",
      changes: 1,
      lastActive: "12 minutes ago",
      status: "active",
      activity: "high",
      collaborators: 3,
      diskUsage: "2.1 GB",
      cpuUsage: "45%",
    },
    {
      id: "intraio-cdeuniverse-50pm482t3qc",
      name: "CDE Universe Project",
      repo: "intra-io/CDE-Universe",
      branch: "main",
      changes: 0,
      lastActive: "13 minutes ago",
      status: "active",
      activity: "medium",
      collaborators: 5,
      diskUsage: "1.8 GB",
      cpuUsage: "30%",
    },
    {
      id: "intrasampl-templaterub-ffnsq833pns",
      name: "Ruby Upgrade Task",
      repo: "intra-samples/template-ruby-on-rails-postgres",
      branch: "upgrade-ruby-and-rails",
      changes: 0,
      lastActive: "23 minutes ago",
      status: "stopped",
      activity: "low",
      collaborators: 2,
      diskUsage: "1.5 GB",
      cpuUsage: "0%",
    },
    {
      id: "intraio-cdeuniverse-10suezto8q3",
      name: "CDE Feature Implementation",
      repo: "intra-io/CDE-Universe",
      branch: "feature-branch",
      changes: 1,
      lastActive: "23 minutes ago",
      status: "active",
      activity: "high",
      collaborators: 4,
      diskUsage: "2.3 GB",
      cpuUsage: "55%",
    },
  ];

  const filteredWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(filter.toLowerCase()) ||
      workspace.repo.toLowerCase().includes(filter.toLowerCase())
  );

  const getActivityColor = (activity) => {
    switch (activity) {
      case "high":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="h-full">
      <div className="border-b border-border w-full h-11 flex items-center">
        <div className="ml-5 flex gap-2 items-center">
          <Code className="text-tertiaryBorder" size={20} />
          <p className="text-xs text-accent">Team - Engineering</p>
          <span className="text-sidenav">&gt;</span>
          <p className="text-xs text-white">Virtual Workspaces</p>
        </div>
      </div>

      <div className="p-6 max-w-[1320px] mx-auto">
        {hasWorkspaces ? (
          <>
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-white mb-2">
                Virtual Workspaces
              </h1>
              <p className="text-gray-400 text-[13px]">
                Manage your active and recent workspaces. Quickly access your
                development environments and track changes across projects.
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-grow mr-4">
                <div className="relative">
                  {filter && (
                    <button
                      onClick={clearFilter}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              <Button
                text="New Workspace"
                type="button"
                colorType="tertiary"
                size="small"
                icon={<Plus size={16} />}
                handleClick={handleCreateWorkspace}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWorkspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="bg-dashboard border border-border rounded-[5px] p-3 flex flex-col justify-between transition-colors duration-300 hover:border-accent"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white text-xs font-semibold truncate mr-2">
                        {workspace.name}
                      </h3>
                      <MoreHorizontal
                        className="text-gray-400 cursor-pointer flex-shrink-0"
                        size={16}
                      />
                    </div>
                    <p className="text-gray-400 text-[10px] mb-1 truncate">
                      {workspace.repo}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] mb-1">
                      <span className="flex items-center text-gray-400">
                        <GitBranch size={12} className="mr-0.5" />
                        {workspace.branch}
                      </span>
                      <span className="flex items-center text-gray-400">
                        <Code size={12} className="mr-0.5" />
                        {workspace.changes}{" "}
                        {workspace.changes === 1 ? "change" : "changes"}
                      </span>
                      <span className="flex items-center text-gray-400">
                        <Clock size={12} className="mr-0.5" />
                        {workspace.lastActive}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <span className="flex items-center text-gray-400">
                        <Activity
                          className={`${getActivityColor(
                            workspace.activity
                          )} mr-0.5`}
                          size={12}
                        />
                        {workspace.activity}
                      </span>
                      <span className="flex items-center text-gray-400">
                        <Users size={12} className="mr-0.5" />
                        {workspace.collaborators}
                      </span>
                      <span className="flex items-center text-gray-400">
                        <HardDrive size={12} className="mr-0.5" />
                        {workspace.diskUsage}
                      </span>
                      <span className="flex items-center text-gray-400">
                        <Cpu size={12} className="mr-0.5" />
                        {workspace.cpuUsage}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span
                      className={`flex items-center text-[10px] ${
                        workspace.status === "active"
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 ${
                          workspace.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        } rounded-full mr-1`}
                      ></span>
                      {workspace.status === "active" ? "Active" : "Stopped"}
                    </span>
                    <Button
                      text={workspace.status === "active" ? "Stop" : "Start"}
                      type="button"
                      colorType={
                        workspace.status === "active" ? "danger" : "secondary"
                      }
                      size="xxs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="flex flex-col items-center text-center max-w-[400px]">
              <Monitor
                style={{ fontSize: "50px" }}
                className="text-white text-5xl mb-6"
              />
              <h1 className="text-white text-md mb-2">Virtual Workspaces</h1>
              <p className="text-sidenav text-[13px] mb-8">
                Workspaces give your team a dedicated space to code,
                collaborate, and manage projects. Install the Intra GitHub App
                to start working efficiently and track progress in real-time.
              </p>
              <Button
                text="Create new workspace"
                type="button"
                colorType="tertiary"
                size="small"
                icon={<Plus size={16} />}
                handleClick={handleCreateWorkspace}
              />
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <PodCreationModal onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default WorkspacePage;
