"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  GitBranch,
  GitCommit,
  GitMerge,
  Users,
  Activity,
  Zap,
  CheckCircle, // Importing CheckCircle for merged branches
} from "lucide-react";

const Dashboard = () => {
  const [hoveredBranch, setHoveredBranch] = useState(null);

  // Updated Flow Data with 'merged' property and additional branches
  const flowData = [
    {
      id: 1,
      type: "main",
      user: "Omar",
      branchName: "Main Branch",
      action: "Merged changes",
      time: "2h ago",
      icon: <GitMerge size={16} />,
      additionalInfo: "Initial commit to the main branch.",
      commits: 1,
      linesAdded: 100,
      linesRemoved: 0,
    },
    {
      id: 2,
      type: "main",
      user: "Sarah",
      branchName: "Main Branch",
      action: "Added feature",
      time: "1h ago",
      icon: <GitCommit size={16} />,
      additionalInfo: "Added new feature to main branch.",
      commits: 1,
      linesAdded: 50,
      linesRemoved: 10,
    },
    {
      id: 3,
      type: "main",
      user: "John",
      branchName: "Main Branch",
      action: "Fixed bug",
      time: "30m ago",
      icon: <GitCommit size={16} />,
      additionalInfo: "Fixed critical bug in main branch.",
      commits: 1,
      linesAdded: 20,
      linesRemoved: 15,
    },
    {
      id: 4,
      type: "branch",
      user: "Madison",
      branchName: "Feature/Login",
      action: "Created a fork",
      time: "25m ago",
      icon: <GitBranch size={16} />,
      additionalInfo: "New branch created for the login feature.",
      commits: 3,
      linesAdded: 85,
      linesRemoved: 20,
      parentCommit: 2,
      merged: true, // Indicating this branch has been merged
    },
    {
      id: 5,
      type: "branch",
      user: "Muhammad",
      branchName: "Feature/Signup",
      action: "Created a fork",
      time: "20m ago",
      icon: <GitBranch size={16} />,
      additionalInfo: "New branch created for the signup feature.",
      commits: 4,
      linesAdded: 110,
      linesRemoved: 45,
      parentCommit: 2,
      merged: false, // Not merged yet
    },
    {
      id: 6,
      type: "branch",
      user: "Emily",
      branchName: "Hotfix/SecurityPatch",
      action: "Created a fork",
      time: "15m ago",
      icon: <GitBranch size={16} />,
      additionalInfo: "New branch created for urgent security patch.",
      commits: 2,
      linesAdded: 30,
      linesRemoved: 5,
      parentCommit: 2,
      merged: true, // Indicating this branch has been merged
    },
    // Additional branches for other main commits
    {
      id: 7,
      type: "branch",
      user: "Alex",
      branchName: "Feature/Dashboard",
      action: "Created a fork",
      time: "10m ago",
      icon: <GitBranch size={16} />,
      additionalInfo: "New branch created for the dashboard feature.",
      commits: 2,
      linesAdded: 60,
      linesRemoved: 10,
      parentCommit: 1,
      merged: false,
    },
    {
      id: 8,
      type: "branch",
      user: "Lily",
      branchName: "Hotfix/UI",
      action: "Created a fork",
      time: "5m ago",
      icon: <GitBranch size={16} />,
      additionalInfo: "New branch created for UI improvements.",
      commits: 1,
      linesAdded: 25,
      linesRemoved: 5,
      parentCommit: 3,
      merged: false,
    },
  ];

  // Hardcoded Online Users
  const onlineUsers = [
    {
      id: 1,
      name: "Sarah",
      status: "Coding",
      avatar: "S",
      lastActive: "2m ago",
    },
    {
      id: 2,
      name: "John",
      status: "Reviewing",
      avatar: "J",
      lastActive: "5m ago",
    },
    {
      id: 3,
      name: "Madison",
      status: "Testing",
      avatar: "M",
      lastActive: "1m ago",
    },
    {
      id: 4,
      name: "Muhammad",
      status: "Coding",
      avatar: "M",
      lastActive: "Just now",
    },
  ];

  // Main Line for Flow Diagram
  const mainLinePoints = "M50,975 L50,25";

  // Function to generate branch paths
  const getBranchPath = useCallback((startX, startY, endX, endY) => {
    const controlOffsetX = 60;
    const controlOffsetY = Math.abs(endY - startY) / 2;

    return `M${startX},${startY} 
      C${startX + controlOffsetX},${startY} 
       ${endX - controlOffsetX},${endY} 
       ${endX},${endY}`;
  }, []);

  // Filter main commits and branches
  const mainCommits = flowData.filter((item) => item.type === "main");
  const branches = flowData.filter((item) => item.type !== "main");

  // Group branches by parentCommit for consistent path lengths
  const branchesByParent = branches.reduce((acc, branch) => {
    const parent = branch.parentCommit;
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(branch);
    return acc;
  }, {});

  // Spacing configurations
  const mainSpacing = 950 / (mainCommits.length + 1); // Adjusted to maintain original spacing
  const branchSpacing = 50; // Fixed spacing for branch paths

  // Productivity Stats (Hardcoded)
  const productivityStats = [
    {
      id: 1,
      title: "Total Commits",
      value: 10,
      icon: <GitCommit size={20} className="text-blue-400" />,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Lines Added",
      value: 285,
      icon: <Activity size={20} className="text-green-400" />,
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Lines Removed",
      value: 80,
      icon: <Zap size={20} className="text-yellow-400" />,
      color: "bg-yellow-500",
    },
    {
      id: 4,
      title: "Active Users",
      value: onlineUsers.length,
      icon: <Users size={20} className="text-purple-400" />,
      color: "bg-purple-500",
    },
  ];

  // Current Branch (Hardcoded)
  const currentBranch = {
    name: "Feature/Signup",
    user: "Muhammad",
    startTime: "2h ago",
    status: "In Progress",
    commits: 4,
    linesAdded: 110,
    linesRemoved: 45,
  };

  // Function to render commit history
  const renderCommitHistory = () => (
    <div className="bg-dashboard border border-border rounded-lg p-4 mb-4">
      <h3 className="text-white text-sm font-semibold mb-2">Commit History</h3>
      <div className="space-y-2">
        {flowData
          .slice(-5)
          .reverse()
          .map((item) => (
            <div key={item.id} className="flex items-center text-xs">
              <span className="w-4 h-4 mr-2 flex items-center justify-center">
                {item.type === "merge" ? (
                  <GitMerge size={14} className="text-purple-400" />
                ) : (
                  <GitCommit size={14} className="text-blue-400" />
                )}
              </span>
              <span className="text-gray-300">{item.user}</span>
              <span className="text-gray-500 mx-1">-</span>
              <span className="text-gray-400">
                {item.action || `Created ${item.branchName}`}
              </span>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-dashboard">
      {/* Header */}
      <div className="border-b border-border w-full h-11 flex items-center bg-gray-900">
        <div className="ml-5 flex gap-2 items-center">
          <Code className="text-tertiaryBorder" size={20} />
          <p className="text-xs text-accent">Team - Engineering</p>
          <span className="text-sidenav">&gt;</span>
          <p className="text-xs text-white">Productivity Dashboard</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-lg font-semibold text-white mb-2">Team Flow</h1>
          <p className="text-gray-400 text-sm mb-6">
            Visualize your team's development progress and activity in
            real-time.
          </p>
        </div>

        {/* Flex container for left and right sections */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section: Flow Diagram and Productivity Stats */}
          <div className="flex-1 space-y-6">
            {/* Flow Diagram */}
            <div className="bg-dashboard border border-border rounded-lg p-4 relative">
              <svg className="w-full h-[600px]" viewBox="0 0 300 1000">
                {/* Branch Paths */}
                {Object.keys(branchesByParent).map((parentId) => {
                  const parentCommit = mainCommits.find(
                    (commit) => commit.id === parseInt(parentId)
                  );
                  const parentIndex = mainCommits.indexOf(parentCommit);
                  const startX = 50;
                  const startY = 975 - mainSpacing * (parentIndex + 1);

                  return branchesByParent[parentId].map(
                    (branch, branchIndex) => {
                      const endX = 150; // Fixed horizontal position for all branches
                      const endY = startY - branchSpacing * (branchIndex + 1); // Consistent vertical spacing

                      const branchPath = getBranchPath(
                        startX,
                        startY,
                        endX,
                        endY
                      );

                      return (
                        <motion.path
                          key={`path-${branch.id}`}
                          d={branchPath}
                          stroke="#34D399"
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{
                            duration: 1.5,
                            delay: branchIndex * 0.3,
                            ease: "easeInOut",
                          }}
                          style={{
                            opacity: branch.merged ? 0.5 : 1, // Adjust opacity based on merged status
                          }}
                        />
                      );
                    }
                  );
                })}

                {/* Main Line */}
                <motion.path
                  d={mainLinePoints}
                  stroke="#34D399"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Main Commits */}
                {mainCommits.map((item, index) => {
                  const mainX = 50;
                  const mainY = 975 - mainSpacing * (index + 1);

                  return (
                    <motion.g
                      key={item.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                    >
                      {/* Commit Node */}
                      <circle
                        cx={mainX}
                        cy={mainY}
                        r="18"
                        fill="#2D3748"
                        stroke="#4B5563"
                        strokeWidth="2"
                      />
                      <foreignObject
                        x={mainX - 10}
                        y={mainY - 10}
                        width={20}
                        height={20}
                      >
                        <div className="flex items-center justify-center h-full w-full text-white">
                          {item.icon}
                        </div>
                      </foreignObject>

                      {/* User and Action Text (Left of Node) */}
                      <text
                        x={mainX - 30}
                        y={mainY}
                        fill="#D1D5DB"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="end"
                        dominantBaseline="middle"
                      >
                        {item.user} {item.action}
                      </text>

                      {/* Time Text (Left of Node) */}
                      <text
                        x={mainX - 30}
                        y={mainY + 15}
                        fill="#9CA3AF"
                        fontSize="10"
                        textAnchor="end"
                        dominantBaseline="middle"
                      >
                        {item.time}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Branch Nodes */}
                {Object.keys(branchesByParent).map((parentId) => {
                  const parentCommit = mainCommits.find(
                    (commit) => commit.id === parseInt(parentId)
                  );
                  const parentIndex = mainCommits.indexOf(parentCommit);
                  const startX = 50;
                  const startY = 975 - mainSpacing * (parentIndex + 1);

                  return branchesByParent[parentId].map(
                    (branch, branchIndex) => {
                      const endX = 150; // Fixed horizontal position for all branches
                      const endY = startY - branchSpacing * (branchIndex + 1); // Consistent vertical spacing

                      return (
                        <motion.g
                          key={`node-${branch.id}`}
                          onMouseEnter={() => setHoveredBranch(branch)}
                          onMouseLeave={() => setHoveredBranch(null)}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: branchIndex * 0.3 + 1,
                            ease: "easeOut",
                          }}
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          {/* Branch Node */}
                          <circle
                            cx={endX}
                            cy={endY}
                            r="15"
                            fill="#2D3748"
                            stroke="#4B5563"
                            strokeWidth="2"
                          />
                          <foreignObject
                            x={endX - 8}
                            y={endY - 8}
                            width={16}
                            height={16}
                          >
                            <div className="flex items-center justify-center h-full w-full text-white">
                              {branch.merged ? (
                                <CheckCircle
                                  size={12}
                                  className="text-green-400"
                                />
                              ) : (
                                <GitBranch size={12} />
                              )}
                            </div>
                          </foreignObject>

                          {/* Branch Texts (Right of Node) */}
                          <text
                            x={endX + 30}
                            y={endY - 2}
                            fill="#D1D5DB"
                            fontSize="12"
                            textAnchor="start"
                            dominantBaseline="middle"
                          >
                            {branch.user} {branch.action}
                          </text>
                          <text
                            x={endX + 30}
                            y={endY + 12}
                            fill="#9CA3AF"
                            fontSize="10"
                            textAnchor="start"
                            dominantBaseline="middle"
                          >
                            {branch.time}
                          </text>
                        </motion.g>
                      );
                    }
                  );
                })}
              </svg>

              {/* Hover Tooltip for Branches */}
              <AnimatePresence>
                {hoveredBranch && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bg-gray-800 p-4 rounded-lg shadow-lg z-10"
                    style={{
                      left: "160px", // Positioned to the right of branch nodes
                      top: "20%", // Adjust as needed for visibility
                    }}
                  >
                    <h4 className="text-white font-semibold mb-2">
                      {hoveredBranch.branchName}
                    </h4>
                    <p className="text-gray-300 text-sm mb-1">
                      Created by: {hoveredBranch.user}
                    </p>
                    <p className="text-gray-300 text-sm mb-1">
                      Created: {hoveredBranch.time}
                    </p>
                    <p className="text-gray-300 text-sm">
                      Status: {hoveredBranch.merged ? "Merged" : "Active"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Section: Sidebar with Online Users, Commit History, and Current Branch */}
            <div className="w-full lg:w-1/3 space-y-6">
              {/* Online Users */}
              <div className="bg-dashboard border border-border rounded-lg p-4">
                <h3 className="text-white text-sm font-semibold mb-4">
                  Online Users
                </h3>
                <div className="space-y-3">
                  {onlineUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium mr-3">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm font-medium">
                            {user.name}
                          </p>
                          <p className="text-gray-500 text-xs">{user.status}</p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {user.lastActive}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commit History */}
              {renderCommitHistory()}

              {/* Current Branch Details */}
              <div className="bg-dashboard border border-border rounded-lg p-4">
                <h3 className="text-white text-sm font-semibold mb-2">
                  Current Branch
                </h3>
                <div className="flex items-center space-x-4">
                  <GitBranch size={24} className="text-green-400" />
                  <div>
                    <p className="text-white font-medium">
                      {currentBranch.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {currentBranch.user} • {currentBranch.startTime}
                    </p>
                    <p className="text-gray-300 text-xs">
                      Status: {currentBranch.status}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <div className="flex items-center">
                        <GitCommit size={14} className="text-blue-400 mr-1" />
                        <span className="text-gray-300 text-xs">
                          {currentBranch.commits} Commits
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Activity size={14} className="text-green-400 mr-1" />
                        <span className="text-gray-300 text-xs">
                          +{currentBranch.linesAdded} Lines Added
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Zap size={14} className="text-yellow-400 mr-1" />
                        <span className="text-gray-300 text-xs">
                          -{currentBranch.linesRemoved} Lines Removed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Paragraph */}
        <div className="p-4 max-w-[1200px] mx-auto">
          <p className="text-gray-400 text-sm">
            Projects let you maintain multiple versions of your team's codebase
            and easily merge your changes together when you're ready. Anyone on
            your team can "fork" (create a new copy of the code), make changes,
            preview what changed, and then merge those changes back.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
