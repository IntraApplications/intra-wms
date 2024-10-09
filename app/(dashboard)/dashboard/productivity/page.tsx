"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitFork,
} from "lucide-react";

const FlowDiagram = () => {
  const [hoveredBranch, setHoveredBranch] = useState(null);

  const flowData = [
    {
      id: 1,
      type: "main",
      user: "Omar",
      branchName: "Main Branch",
      action: "Merged PR #42",
      time: "2m ago",
      icon: <GitMerge size={16} />,
      additionalInfo: "Code merged into the main branch.",
    },
    {
      id: 2,
      type: "branch",
      user: "Madison",
      branchName: "Feature/Login",
      action: "Created a feature branch",
      time: "5m ago",
      icon: <GitBranch size={16} />,
      additionalInfo: "New branch created for the login feature.",
    },
    {
      id: 3,
      type: "branch",
      user: "Muhammad",
      branchName: "Feature/Signup",
      action: "Opened PR #43",
      time: "4m ago",
      icon: <GitPullRequest size={16} />,
      additionalInfo: "Opened a pull request for the signup feature.",
    },
    {
      id: 4,
      type: "branch",
      user: "Aman",
      branchName: "Fork/Repo",
      action: "Forked the repository",
      time: "3m ago",
      icon: <GitFork size={16} />,
      additionalInfo: "Forked the repository for a new feature.",
    },
    {
      id: 5,
      type: "subbranch",
      user: "Sarah",
      branchName: "Fix/Login-UI",
      action: "Committed changes",
      time: "1m ago",
      icon: <GitCommit size={16} />,
      additionalInfo: "Committed changes to the feature/login-ui branch.",
    },
    {
      id: 6,
      type: "subbranch",
      user: "Liam",
      branchName: "Review/Signup",
      action: "Reviewed PR #43",
      time: "30s ago",
      icon: <GitPullRequest size={16} />,
      additionalInfo: "Reviewed the signup feature pull request.",
    },
    {
      id: 7,
      type: "branch",
      user: "Emma",
      branchName: "Staging",
      action: "Deployed to staging",
      time: "Now",
      icon: <GitMerge size={16} />,
      additionalInfo: "Deployed to the staging environment.",
    },
  ];

  const mainLinePoints = "M50,250 L750,250";

  const getBranchPath = (startX, startY, endX, endY) => {
    const controlOffsetX = 30;
    const controlOffsetY = endY > startY ? 60 : -60;
    return `M${startX},${startY} C${startX + controlOffsetX},${
      startY + controlOffsetY
    } ${endX - controlOffsetX},${endY - controlOffsetY} ${endX},${endY}`;
  };

  const calculateMainY = () => {
    return 250;
  };

  const branches = flowData.filter((item) => item.type !== "main");
  const branchSpacing = 700 / (branches.length + 1);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="border-b border-border w-full h-11 flex items-center ">
        <div className="ml-5 flex gap-2 items-center">
          <Code className="text-tertiaryBorder" size={20} />
          <p className="text-xs text-accent">Team - Engineering</p>
          <span className="text-sidenav">&gt;</span>
          <p className="text-xs text-white">Team Flow</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-[1320px] mx-auto">
        <h1 className="text-lg font-semibold text-white mb-2">Team Flow</h1>
        <p className="text-gray-400 text-[13px] mb-6">
          Visualize your team's development progress and activity in real-time.
        </p>

        {/* Flow Diagram */}
        <div className="bg-primary border border-border rounded-[5px] p-4 relative">
          <svg className="w-full h-[500px]" viewBox="0 0 800 500">
            {/* Main Flow Line */}
            <motion.path
              d={mainLinePoints}
              stroke="#34D399"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Flow Nodes */}
            {flowData.map((item, index) => {
              if (item.type === "main") {
                const mainX = 50;
                const mainY = calculateMainY();

                return (
                  <motion.g
                    key={item.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <circle
                      cx={mainX}
                      cy={mainY}
                      r="28"
                      fill="#1F2937"
                      stroke="#4B5563"
                      strokeWidth="2"
                    />
                    <circle cx={mainX} cy={mainY} r="24" fill="#2D3748" />
                    <foreignObject
                      x={mainX - 16}
                      y={mainY - 16}
                      width={32}
                      height={32}
                    >
                      {item.icon}
                    </foreignObject>
                    {/* User Name */}
                    <text
                      x={mainX}
                      y={mainY + 50}
                      fill="#D1D5DB"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {item.user}
                    </text>
                    {/* Branch Name */}
                    <text
                      x={mainX}
                      y={mainY + 70}
                      fill="#9CA3AF"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {item.branchName}
                    </text>
                  </motion.g>
                );
              } else {
                const branchIndex = branches.indexOf(item) + 1;
                const xPos = 50 + branchSpacing * branchIndex;
                const yPos = calculateMainY();

                const endX = xPos + 150;
                const endY = item.type === "branch" ? yPos - 100 : yPos + 100;
                const branchPath = getBranchPath(xPos, yPos, endX, endY);

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
                      <circle
                        cx={endX}
                        cy={endY}
                        r="24"
                        fill={hoveredBranch === item.id ? "#065F46" : "#1F2937"}
                        stroke="#4B5563"
                        strokeWidth="2"
                      />
                      <circle cx={endX} cy={endY} r="20" fill="#2D3748" />
                      {/* Icon */}
                      <foreignObject
                        x={endX - 8}
                        y={endY - 8}
                        width={16}
                        height={16}
                      >
                        <div className="text-white flex justify-center items-center h-full w-full">
                          {item.icon}
                        </div>
                      </foreignObject>
                      {/* User Name */}
                      <text
                        x={endX}
                        y={item.type === "branch" ? endY - 50 : endY + 50}
                        fill="#D1D5DB"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {item.user}
                      </text>
                      {/* Branch Name */}
                      <text
                        x={endX}
                        y={item.type === "branch" ? endY - 30 : endY + 70}
                        fill="#9CA3AF"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {item.branchName}
                      </text>
                    </motion.g>

                    {/* Tooltip on Hover */}
                    {hoveredBranch === item.id && (
                      <foreignObject
                        x={endX + 30}
                        y={endY - 80}
                        width={220}
                        height={120}
                      >
                        <div className="bg-gray-800 p-4 rounded-md shadow-lg text-white text-sm">
                          <p className="font-semibold">{item.action}</p>
                          <p className="text-gray-300">{item.additionalInfo}</p>
                          <p className="text-gray-400 mt-2">{item.time}</p>
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              }
            })}
          </svg>
        </div>

        {/* Description */}
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
