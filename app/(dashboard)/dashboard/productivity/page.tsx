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
  CheckCircle,
  PieChart,
  BarChart,
  Clock,
  MoreHorizontal,
  Plus,
  Minus,
  FileCode,
  Target,
  AlertCircle,
  X,
  User,
  Check,
  Brain,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Server,
} from "lucide-react";
import { Button } from "@mui/material";

const CommitModal = ({ commit, onClose, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-primary rounded-[5px] border border-border w-[900px] flex flex-col overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="border-b border-border h-[48px] px-5 flex justify-between items-center">
              <div className="flex items-center text-sm text-white">
                <GitBranch size={16} className="mr-2" />
                <span>Commit Details</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex p-5 space-x-5">
              {/* Left Column */}
              <div className="w-1/3 space-y-4">
                <InfoSection title="Basic Info">
                  <InfoItem
                    icon={<User size={14} />}
                    label="Author"
                    value={commit.user}
                  />
                  <InfoItem
                    icon={<Clock size={14} />}
                    label="Time"
                    value={commit.time}
                  />
                  <InfoItem
                    icon={<GitBranch size={14} />}
                    label="Branch"
                    value={commit.branchName}
                  />
                  <InfoItem
                    icon={<GitCommit size={14} />}
                    label="Parent"
                    value="abc123..."
                  />
                </InfoSection>
                <InfoSection title="Changes">
                  <InfoItem
                    icon={<Plus size={14} />}
                    label="Added"
                    value={`+${commit.linesAdded} lines`}
                    valueColor="text-green-400"
                  />
                  <InfoItem
                    icon={<Minus size={14} />}
                    label="Removed"
                    value={`-${commit.linesRemoved} lines`}
                    valueColor="text-red-400"
                  />
                  <InfoItem
                    icon={<FileCode size={14} />}
                    label="Files Changed"
                    value="8"
                  />
                </InfoSection>
                <InfoSection title="Performance Metrics">
                  <InfoItem
                    icon={<Clock size={14} />}
                    label="Build Time"
                    value="45s"
                  />
                  <InfoItem
                    icon={<ShieldCheck size={14} />}
                    label="Test Coverage"
                    value="85%"
                  />
                  <InfoItem
                    icon={<TrendingUp size={14} />}
                    label="Performance Impact"
                    value="+2%"
                    valueColor="text-green-400"
                  />
                </InfoSection>
              </div>

              {/* Right Column */}
              <div className="w-2/3 space-y-4">
                <InfoSection title="Commit Message">
                  <p className="text-white text-sm">{commit.additionalInfo}</p>
                </InfoSection>
                <InfoSection title="AI Insights">
                  <AIInsight
                    icon={<Brain size={16} className="text-purple-400" />}
                    title="Impact Analysis"
                    description="This commit primarily affects the UI components. Consider testing related features thoroughly, especially in the following areas:"
                    items={[
                      "User authentication flow",
                      "Dashboard responsiveness",
                      "Form validation in affected components",
                    ]}
                  />
                  <AIInsight
                    icon={<Zap size={16} className="text-yellow-400" />}
                    title="Code Quality"
                    description="The changes improve code readability and follow best practices. Notable improvements:"
                    items={[
                      "Increased use of meaningful variable names",
                      "Improved function decomposition",
                      "Added comments for complex logic",
                    ]}
                  />
                  <AIInsight
                    icon={
                      <AlertTriangle size={16} className="text-orange-400" />
                    }
                    title="Potential Risks"
                    description="While the changes are generally positive, consider the following risks:"
                    items={[
                      "Possible performance impact on larger datasets",
                      "Backwards compatibility with older browser versions",
                    ]}
                  />
                </InfoSection>
              </div>
            </div>

            {/* Security Scan - Full Width */}
            <div className="px-5 pb-5">
              <InfoSection title="Security Scan">
                <div className="grid grid-cols-2 gap-3">
                  <SecurityItem
                    icon={<ShieldCheck size={14} />}
                    text="No vulnerabilities found"
                    color="text-green-400"
                  />
                  <SecurityItem
                    icon={<ShieldCheck size={14} />}
                    text="Compliance status: Passed"
                    color="text-green-400"
                  />
                  <SecurityItem
                    icon={<AlertTriangle size={14} />}
                    text="2 low-severity warnings (see details)"
                    color="text-yellow-400"
                  />
                  <SecurityItem
                    icon={<Clock size={14} />}
                    text="Scan completed in 1m 30s"
                    color="text-blue-400"
                  />
                </div>
              </InfoSection>
            </div>

            {/* Footer */}
            <div className="border-t border-border h-[48px] px-5 flex justify-between items-center">
              <div className="text-gray-400 text-xs">
                Commit Hash: abc123...
              </div>
              <button
                onClick={onClose}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InfoSection = ({ title, children }) => (
  <div className="bg-dashboard border border-border rounded-[5px] p-3">
    <h3 className="text-gray-300 text-sm font-semibold mb-2">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const InfoItem = ({ icon, label, value, valueColor = "text-white" }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-400 text-xs flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </span>
    <span className={`${valueColor} text-xs font-medium`}>{value}</span>
  </div>
);

const AIInsight = ({ icon, title, description, items }) => (
  <div className="flex items-start mt-3">
    <span className="mr-2 flex-shrink-0 mt-1">{icon}</span>
    <div>
      <h4 className="text-white text-sm font-semibold">{title}</h4>
      <p className="text-gray-300 text-xs mt-1">{description}</p>
      {items && (
        <ul className="list-disc list-inside text-gray-300 text-xs mt-1">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

const SecurityItem = ({ icon, text, color }) => (
  <div className="flex items-center">
    <span className={`${color} mr-2`}>{icon}</span>
    <span className={`${color} text-xs`}>{text}</span>
  </div>
);
const Dashboard = () => {
  const [hoveredBranch, setHoveredBranch] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      merged: true,
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
      merged: false,
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
      merged: true,
    },
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

  // Online Users Data
  const onlineUsers = [
    {
      id: 1,
      name: "Sarah",
      status: "Coding",
      avatar: "S",
      lastActive: "2m ago",
      branch: "Feature/Login",
      commitCount: 3,
      codeChanges: 15,
      filesChanged: 2,
    },
    {
      id: 2,
      name: "John",
      status: "Reviewing",
      avatar: "J",
      lastActive: "5m ago",
      branch: "Main",
      commitCount: 1,
      codeChanges: 7,
      filesChanged: 1,
    },
    {
      id: 3,
      name: "Madison",
      status: "Testing",
      avatar: "M",
      lastActive: "1m ago",
      branch: "Hotfix/SecurityPatch",
      commitCount: 4,
      codeChanges: 23,
      filesChanged: 5,
    },
    {
      id: 4,
      name: "Muhammad",
      status: "Coding",
      avatar: "M",
      lastActive: "Just now",
      branch: "Feature/Dashboard",
      commitCount: 6,
      codeChanges: 31,
      filesChanged: 8,
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
  const mainSpacing = 950 / (mainCommits.length + 1);
  const branchSpacing = 50;

  const renderCommitHistory = () => (
    <div className="bg-dashboard border border-border rounded-lg p-4 mb-4 flex-grow overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white text-xs font-semibold">Commit History</h3>
        <MoreHorizontal className="text-gray-400 cursor-pointer" size={16} />
      </div>
      <div className="space-y-2">
        {flowData
          .slice(-5)
          .reverse()
          .map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg p-2 text-xs flex items-center cursor-pointer hover:bg-gray-800 transition-colors duration-200"
              onClick={() => {
                setSelectedCommit(item);
                setIsModalOpen(true);
              }}
            >
              <div className="flex-shrink-0 mr-2">
                <span className="w-6 h-6 rounded-full bg-dashboard flex items-center justify-center">
                  {item.type === "merge" ? (
                    <GitMerge size={12} className="text-purple-400" />
                  ) : (
                    <GitCommit size={12} className="text-blue-400" />
                  )}
                </span>
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{item.user}</span>
                </div>
                <p className="text-gray-400 text-[10px]">
                  {item.action} in {item.branchName}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-gray-500 ml-2">
                <span className="flex items-center">
                  <span className="text-gray-500 text-[10px]">{item.time}</span>
                </span>
                <span className="flex items-center">
                  <GitCommit size={8} className="mr-1" />
                  {item.commits}
                </span>
                <span className="flex items-center">
                  <Plus size={8} className="mr-1 text-green-500" />
                  {item.linesAdded}
                </span>
                <span className="flex items-center">
                  <Minus size={8} className="mr-1 text-red-500" />
                  {item.linesRemoved}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-dashboard">
      {/* Header */}
      <div className="border-b border-border w-full h-11 flex items-center">
        <div className="ml-5 flex gap-2 items-center">
          <Code className="text-tertiaryBorder" size={20} />
          <p className="text-xs text-accent">Team - Engineering</p>
          <span className="text-sidenav">&gt;</span>
          <p className="text-xs text-white">Productivity Dashboard</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-[1400px] mx-auto flex flex-col gap-2">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-lg font-semibold text-white mb-2">Team Flow</h1>
          <p className="text-gray-400 text-sm mb-6">
            Visualize your team's development progress and activity in
            real-time.
          </p>
        </div>

        {/* Flex container for all sections */}
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] overflow-hidden">
          {/* Git Tree Section */}
          <div className="flex-1 overflow-auto" style={{ maxWidth: "50%" }}>
            <div className="bg-dashboard h-full border border-border rounded-lg p-4 relative">
              <svg
                className="w-full h-[700px]"
                style={{ maxWidth: "100%" }}
                viewBox="0 0 300 900"
              >
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
                      const endX = 150;
                      const endY = startY - branchSpacing * (branchIndex + 1);

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
                          stroke={branch.merged ? "#1F2937" : "#34D399"}
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
                            opacity: branch.merged ? 0.5 : 1,
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
                      const endX = 150;
                      const endY = startY - branchSpacing * (branchIndex + 1);

                      // Determine branch status
                      let status;
                      if (branch.merged) {
                        status = "Merged";
                      } else if (branch.commits > 5) {
                        status = "Ready for Review";
                      } else if (branch.commits > 0) {
                        status = "In Progress";
                      } else {
                        status = "Just Created";
                      }

                      // Define status colors
                      const statusColors = {
                        Merged: "#4B5563",
                        "Ready for Review": "#3B82F6",
                        "In Progress": "#10B981",
                        "Just Created": "#F59E0B",
                      };

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
                            opacity: branch.merged ? 0.5 : 1,
                          }}
                        >
                          {/* Branch Node */}
                          <circle
                            cx={endX}
                            cy={endY}
                            r="15"
                            fill={branch.merged ? "#1F2937" : "#2D3748"}
                            stroke={branch.merged ? "#374151" : "#4B5563"}
                            strokeWidth="2"
                          />
                          <foreignObject
                            x={endX - 8}
                            y={endY - 8}
                            width={16}
                            height={16}
                          >
                            <div className="flex items-center justify-center h-full w-full text-gray-400">
                              {branch.merged ? (
                                <CheckCircle size={12} />
                              ) : (
                                <GitBranch size={12} className="text-white" />
                              )}
                            </div>
                          </foreignObject>

                          {/* Branch Texts (Right of Node) */}
                          <text
                            x={endX + 30}
                            y={endY - 2}
                            fill={branch.merged ? "#6B7280" : "#D1D5DB"}
                            fontSize="12"
                            textAnchor="start"
                            dominantBaseline="middle"
                          >
                            {branch.user} {branch.action}
                          </text>
                          <text
                            x={endX + 30}
                            y={endY + 12}
                            fill={branch.merged ? "#4B5563" : "#9CA3AF"}
                            fontSize="10"
                            textAnchor="start"
                            dominantBaseline="middle"
                          >
                            {branch.time}
                          </text>

                          {/* Branch Status Label */}
                          <rect
                            x={endX + 220}
                            y={endY - 10}
                            width={80}
                            height={20}
                            rx={10}
                            ry={10}
                            fill={statusColors[status]}
                            fillOpacity={0.1}
                            stroke={statusColors[status]}
                            strokeWidth={1}
                          />
                          <text
                            x={endX + 260}
                            y={endY}
                            fill={statusColors[status]}
                            fontSize="10"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontWeight="500"
                          >
                            {status}
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
                    className="absolute bg-dashboard border border-border p-4 rounded-lg shadow-lg z-10"
                    style={{
                      left: "160px",
                      top: "20%",
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
          </div>

          {/* Middle Section: Online Users and Commit History */}
          <div className="w-full lg:w-1/3 space-y-4 overflow-auto flex flex-col">
            {/* Online Users */}
            <div className="bg-dashboard border border-border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white text-xs font-semibold">
                  Online Users
                </h3>
                <MoreHorizontal
                  className="text-gray-400 cursor-pointer"
                  size={16}
                />
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border border-border rounded-lg p-2 transition-colors duration-300 hover:bg-dashboard flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-dashboard flex items-center justify-center text-white text-xs font-medium mr-2">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs font-medium">
                          {user.name}
                        </p>
                        <p className="text-gray-500 text-[10px]">
                          {user.status} • {user.lastActive}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400 text-[10px]">
                      <span className="flex items-center">
                        <GitBranch size={10} className="mr-1" />
                        {user.branch}
                      </span>
                      <span className="flex items-center">
                        <GitCommit size={10} className="mr-1" />
                        {user.commitCount}
                      </span>
                      <span className="flex items-center">
                        <Activity size={10} className="mr-1" />
                        {user.codeChanges}
                      </span>
                      <span className="flex items-center">
                        <FileCode size={10} className="mr-1" />
                        {user.filesChanged}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Commit History */}
            {renderCommitHistory()}
          </div>

          {/* Right Section: Productivity Tracker */}
          <div className="w-full lg:w-1/4 space-y-3">
            {/* Code Coverage */}
            <div className="bg-dashboard border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">
                  Code Coverage
                </h3>
                <PieChart size={18} className="text-green-400" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl font-bold text-white">85%</p>
                <p className="text-green-400 text-xs">+5% from last week</p>
              </div>
            </div>

            {/* Pull Requests */}
            <div className="bg-dashboard border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">
                  Pull Requests
                </h3>
                <GitBranch size={18} className="text-blue-400" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-blue-400 text-xs">3 awaiting review</p>
              </div>
            </div>

            {/* Build Status */}
            <div className="bg-dashboard border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">
                  Build Status
                </h3>
                <CheckCircle size={18} className="text-green-400" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl font-bold text-white">Passing</p>
                <p className="text-gray-400 text-xs">Last build: 10 min ago</p>
              </div>
            </div>

            {/* Velocity */}
            <div className="bg-dashboard border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">Velocity</h3>
                <Zap size={18} className="text-yellow-400" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl font-bold text-white">24 pts</p>
                <p className="text-yellow-400 text-xs">+2 pts this sprint</p>
              </div>
            </div>

            {/* Bug Rate */}
            <div className="bg-dashboard border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">Bug Rate</h3>
                <AlertCircle size={18} className="text-red-400" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl font-bold text-white">2.5%</p>
                <p className="text-red-400 text-xs">-0.5% from last month</p>
              </div>
            </div>

            {/* Code Review Time */}
            <div className="bg-dashboard border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">
                  Review Time
                </h3>
                <Clock size={18} className="text-indigo-400" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl font-bold text-white">4.2h</p>
                <p className="text-gray-400 text-xs">Avg. time to review</p>
              </div>
            </div>

            {/* Sprint Progress */}
            <div className="bg-dashboard border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-semibold">
                  Sprint Progress
                </h3>
                <Target size={18} className="text-purple-400" />
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-purple-400 h-2 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>
              <div className="flex justify-between text-xs">
                <p className="text-purple-400">70% completed</p>
                <p className="text-gray-400">7/10 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedCommit && (
        <CommitModal
          commit={selectedCommit}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCommit(null);
          }}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
};

export default Dashboard;
