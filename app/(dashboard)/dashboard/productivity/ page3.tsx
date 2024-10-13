"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Users,
  Code,
} from "lucide-react";

const FlowDiagram = () => {
  const [hoveredBranch, setHoveredBranch] = useState(null);

  const flowData = [
    {
      id: 1,
      type: "main",
      user: "Omar",
      action: "Initial commit",
      time: "5h ago",
    },
    {
      id: 2,
      type: "main",
      user: "Sarah",
      action: "Added feature",
      time: "4h ago",
    },
    { id: 3, type: "main", user: "John", action: "Fixed bug", time: "3h ago" },
    {
      id: 4,
      type: "branch",
      user: "Madison",
      branchName: "Feature/Login",
      time: "2h 30m ago",
      parentCommit: 2,
    },
    {
      id: 5,
      type: "branch",
      user: "Muhammad",
      branchName: "Feature/Signup",
      time: "2h ago",
      parentCommit: 2,
    },
    {
      id: 6,
      type: "main",
      user: "Alex",
      action: "Updated docs",
      time: "1h 30m ago",
    },
    {
      id: 7,
      type: "branch",
      user: "Emily",
      branchName: "Hotfix/SecurityPatch",
      time: "1h ago",
      parentCommit: 6,
    },
    {
      id: 8,
      type: "main",
      user: "Liam",
      action: "Refactored code",
      time: "45m ago",
    },
    {
      id: 9,
      type: "merge",
      user: "Madison",
      action: "Merged Feature/Login",
      time: "30m ago",
      branchName: "Feature/Login",
    },
    {
      id: 10,
      type: "main",
      user: "Sophia",
      action: "Optimized performance",
      time: "15m ago",
    },
  ];

  const onlineUsers = [
    { id: 1, name: "Sarah", status: "Coding" },
    { id: 2, name: "John", status: "Reviewing" },
    { id: 3, name: "Madison", status: "Testing" },
    { id: 4, name: "Muhammad", status: "Coding" },
  ];

  const mainLinePoints = "M50,975 L50,25";

  const getBranchPath = useCallback((startX, startY, endX, endY) => {
    const controlPoint1 = { x: startX, y: startY - 50 };
    const controlPoint2 = { x: endX, y: endY + 50 };
    return `M${startX},${startY} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${endX},${endY}`;
  }, []);

  const mainCommits = flowData.filter(
    (item) => item.type === "main" || item.type === "merge"
  );
  const branches = flowData.filter((item) => item.type === "branch");
  const mainSpacing = 950 / (mainCommits.length + 1);

  const renderCommitHistory = () => (
    <div className="bg-dashboard border border-border rounded-[5px] p-4 mb-4">
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
    <div className="h-full">
      <div className="border-b border-border w-full h-11 flex items-center bg-gray-900">
        <div className="ml-5 flex gap-2 items-center">
          <Code className="text-tertiaryBorder" size={20} />
          <p className="text-xs text-accent">Team - Engineering</p>
          <span className="text-sidenav">&gt;</span>
          <p className="text-xs text-white">Team Flow</p>
        </div>
      </div>

      <div className="p-6 max-w-[1320px] mx-auto">
        <h1 className="text-lg font-semibold text-white mb-2">Team Flow</h1>
        <p className="text-gray-400 text-[13px] mb-6">
          Visualize your team's development progress and activity in real-time.
        </p>

        <div className="flex gap-6">
          <div className="bg-dashboard border border-border rounded-[5px] p-4 relative">
            <svg className="w-full h-[600px]" viewBox="0 0 300 750">
              <motion.path
                d={mainLinePoints}
                stroke="#34D399"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

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
                        {item.type === "merge" ? (
                          <GitMerge size={16} />
                        ) : (
                          <GitCommit size={16} />
                        )}
                      </div>
                    </foreignObject>

                    {/* Adjusted the text positioning to be below the node */}
                    <text
                      x={mainX}
                      y={mainY + 25}
                      fill="#D1D5DB"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {item.user} {item.action}
                    </text>
                    <text
                      x={mainX}
                      y={mainY + 40}
                      fill="#9CA3AF"
                      fontSize="10"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {item.time}
                    </text>
                  </motion.g>
                );
              })}

              {branches.map((item, index) => {
                const parentCommit = mainCommits.find(
                  (commit) => commit.id === item.parentCommit
                );
                const parentIndex = mainCommits.indexOf(parentCommit);
                const startX = 50;
                const startY = 975 - mainSpacing * (parentIndex + 1);

                const endX = startX + 100 + index * 50;
                const endY = startY - 100;
                const branchPath = getBranchPath(startX, startY, endX, endY);

                return (
                  <g
                    key={item.id}
                    onMouseEnter={() => setHoveredBranch(item)}
                    onMouseLeave={() => setHoveredBranch(null)}
                  >
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
                          <GitBranch size={12} />
                        </div>
                      </foreignObject>
                    </motion.g>
                  </g>
                );
              })}
            </svg>

            <AnimatePresence>
              {hoveredBranch && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bg-gray-800 p-4 rounded-lg shadow-lg z-10"
                  style={{
                    left: `${
                      (hoveredBranch.parentCommit / flowData.length) * 100
                    }%`,
                    top: `${(1 - hoveredBranch.id / flowData.length) * 100}%`,
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
                  <p className="text-gray-300 text-sm">Status: Active</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-1/3 space-y-4">
            <div className="bg-dashboard border border-border rounded-[5px] p-4">
              <h3 className="text-white text-sm font-semibold mb-2">
                Online Users
              </h3>
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-gray-300 text-xs">{user.name}</span>
                  <span className="text-gray-500 text-xs ml-2">
                    ({user.status})
                  </span>
                </div>
              ))}
            </div>
            {renderCommitHistory()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowDiagram;
