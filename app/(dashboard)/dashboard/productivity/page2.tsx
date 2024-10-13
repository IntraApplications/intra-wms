"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitFork,
  Users,
  Clock,
  Activity,
  Zap,
} from "lucide-react";

const FlowDiagram = () => {
  const [hoveredBranch, setHoveredBranch] = useState(null);

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
    },
  ];

  const mainLinePoints = "M0,50 L1975,50";

  const getBranchPath = (startX, startY, endX, endY) => {
    const controlOffsetX = 60;
    const controlOffsetY = Math.abs(endY - startY) / 2;

    return `M${startX},${startY} 
      C${startX + controlOffsetX},${startY} 
       ${endX - controlOffsetX},${endY} 
       ${endX},${endY}`;
  };

  const calculateMainY = () => {
    return 50;
  };

  const mainCommits = flowData.filter((item) => item.type === "main");
  const branches = flowData.filter((item) => item.type !== "main");
  const mainSpacing = 1650 / (mainCommits.length + 1);
  const branchSpacing = 50;

  return (
    <div className="h-full">
      {/* Header */}
      <div className="border-b border-border w-full h-11 flex items-center bg-gray-900">
        <div className="ml-5 flex gap-2 items-center">
          <Code className="text-tertiaryBorder" size={20} />
          <p className="text-xs text-accent">Team - Engineering</p>
          <span className="text-sidenav">&gt;</span>
          <p className="text-xs text-white">Team Flow</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-[1520px] mx-auto">
        <h1 className="text-lg font-semibold text-white mb-2">Team Flow</h1>
        <p className="text-gray-400 text-[13px] mb-6">
          Visualize your team's development progress and activity in real-time.
        </p>

        <div className="flex gap-6">
          {/* Flow Diagram */}
          <div className="bg-dashboard border border-border rounded-[5px] p-4 relative flex-grow">
            <svg className="w-full h-[200px]" viewBox="0 0 1000 300">
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
                const mainX = 25 + mainSpacing * (index + 1);
                const mainY = calculateMainY();

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

                    {/* **Texts Moved Above the Node** */}
                    {/* User and Action */}
                    <text
                      x={mainX}
                      y={mainY - 40}
                      fill="#D1D5DB"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {item.user} {item.action}
                    </text>
                    {/* Time */}
                    <text
                      x={mainX}
                      y={mainY - 25}
                      fill="#9CA3AF"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {item.time}
                    </text>
                  </motion.g>
                );
              })}

              {/* Branches */}
              {branches.map((item, index) => {
                const parentCommit = mainCommits.find(
                  (commit) => commit.id === item.parentCommit
                );
                const parentIndex = mainCommits.indexOf(parentCommit);
                const startX = 25 + mainSpacing * (parentIndex + 1);
                const startY = calculateMainY();

                const endX = startX + 120;
                const endY = startY + branchSpacing * (index + 1);
                const branchPath = getBranchPath(startX, startY, endX, endY);

                return (
                  <g
                    key={item.id}
                    onMouseEnter={() => setHoveredBranch(item.id)}
                    onMouseLeave={() => setHoveredBranch(null)}
                  >
                    {/* Branch Path */}
                    <motion.path
                      d={branchPath}
                      stroke="#34D399"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.3,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Branch Node */}
                    <motion.g
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.3 + 1,
                        ease: "easeOut",
                      }}
                    >
                      <rect
                        x={endX - 20}
                        y={endY - 15}
                        width="40"
                        height="30"
                        fill="#2D3748"
                        rx="4"
                      />
                      <foreignObject
                        x={endX - 8}
                        y={endY - 8}
                        width={16}
                        height={16}
                      >
                        <div className="flex items-center justify-center h-full w-full text-white">
                          {item.icon}
                        </div>
                      </foreignObject>

                      {/* **Texts Moved Above the Node** */}
                      {/* User and Action */}
                      <text
                        x={endX + 30}
                        y={endY - 2}
                        fill="#D1D5DB"
                        fontSize="12"
                        textAnchor="start"
                      >
                        {item.user} {item.action}
                      </text>
                      {/* Time */}
                      <text
                        x={endX + 30}
                        y={endY + 12}
                        fill="#9CA3AF"
                        fontSize="10"
                        textAnchor="start"
                      >
                        {item.time}
                      </text>
                    </motion.g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Informational Paragraph */}
        <p className="text-gray-400 text-sm mt-6">
          Projects let you maintain multiple versions of your team's codebase
          and easily merge your changes together when you're ready. Anyone on
          your team can "fork" (create a new copy of the code), make changes,
          preview what changed, and then merge those changes back.
        </p>
      </div>
    </div>
  );
};

export default FlowDiagram;
