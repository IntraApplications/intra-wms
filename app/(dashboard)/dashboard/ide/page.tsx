"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
  faFolder,
  faFolderOpen,
  faCog,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { githubDark } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";

const fileIcons = {
  js: "📄",
  ts: "📄",
  py: "📄",
  html: "📄",
  css: "📄",
  json: "📄",
  md: "📄",
  default: "📄",
};

const fileStructure = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "main.py", type: "file", content: "print('Hello, World!')" },
      {
        name: "index.html",
        type: "file",
        content: "<h1>Welcome to My Project</h1>",
      },
      {
        name: "styles.css",
        type: "file",
        content: "body { font-family: Arial, sans-serif; }",
      },
      {
        name: "js",
        type: "folder",
        children: [
          {
            name: "app.js",
            type: "file",
            content: "console.log('Application started');",
          },
        ],
      },
    ],
  },
  {
    name: "config",
    type: "folder",
    children: [
      {
        name: "settings.json",
        type: "file",
        content: '{\n  "theme": "dark",\n  "fontSize": 14\n}',
      },
    ],
  },
  {
    name: "README.md",
    type: "file",
    content: "# My Project\n\nThis is a sample project.",
  },
];

const CodeEditor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["src"]);
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>(
    {}
  );

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderPath)
        ? prev.filter((path) => path !== folderPath)
        : [...prev, folderPath]
    );
  };

  const selectFile = (filePath: string, content: string) => {
    setSelectedFile(filePath);
    setFileContents((prev) => ({ ...prev, [filePath]: content }));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop() || "";
    return fileIcons[extension] || fileIcons.default;
  };

  const renderFileTree = (items: any[], basePath = "", depth = 0) => (
    <ul className={`${depth === 0 ? "pl-0" : "pl-3"}`}>
      {items.map((item) => {
        const itemPath = `${basePath}/${item.name}`;
        return (
          <li key={itemPath} className="py-[2px]">
            {item.type === "folder" ? (
              <div>
                <span
                  className="flex items-center cursor-pointer text-[#A0A0A0] hover:text-[#E1E1E1] text-xs"
                  onClick={() => toggleFolder(itemPath)}
                >
                  <FontAwesomeIcon
                    icon={
                      expandedFolders.includes(itemPath)
                        ? faChevronDown
                        : faChevronRight
                    }
                    className="w-2 h-2 mr-1"
                  />
                  <FontAwesomeIcon
                    icon={
                      expandedFolders.includes(itemPath)
                        ? faFolderOpen
                        : faFolder
                    }
                    className="text-[#E8AB53] mr-1 w-3 h-3"
                  />
                  {item.name}
                </span>
                {expandedFolders.includes(itemPath) &&
                  item.children &&
                  renderFileTree(item.children, itemPath, depth + 1)}
              </div>
            ) : (
              <div
                className={`flex items-center cursor-pointer pl-3 text-xs ${
                  selectedFile === itemPath
                    ? "text-[#E1E1E1] bg-[#2C2C2C]"
                    : "text-[#A0A0A0] hover:text-[#E1E1E1]"
                }`}
                onClick={() => selectFile(itemPath, item.content)}
              >
                <span className="mr-1">{getFileIcon(item.name)}</span>
                {item.name}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const getLanguageExtension = (fileName: string) => {
    const extension = fileName.split(".").pop();
    switch (extension) {
      case "html":
        return html();
      case "js":
        return javascript();
      case "py":
      case "css":
        return css();
      default:
        return javascript();
    }
  };

  return (
    <div className="flex h-screen bg-[#1A1A1B] text-xs">
      {/* Left Sidebar */}
      <div className="w-52 bg-[#1A1A1B] border-r border-[#2E2D31] flex flex-col">
        {/* File Explorer */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h2 className="text-[#E1E1E1] text-[11px] font-semibold uppercase mb-1 pl-2">
              Explorer
            </h2>
            {renderFileTree(fileStructure)}
          </div>
        </div>
        {/* Tools Section */}
        <div className="p-2 border-t border-[#2E2D31]">
          <h2 className="text-[#E1E1E1] text-[11px] font-semibold uppercase mb-1 pl-2">
            Tools
          </h2>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-[#A0A0A0] cursor-pointer hover:text-[#E1E1E1] pl-2">
              <FontAwesomeIcon icon={faCog} className="mr-2 w-3 h-3" />
              <span className="text-xs">Settings</span>
            </div>
            <div className="flex items-center text-[#A0A0A0] cursor-pointer hover:text-[#E1E1E1] pl-2">
              <FontAwesomeIcon icon={faRobot} className="mr-2 w-3 h-3" />
              <span className="text-xs">AI Assistant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div className="bg-[#1A1A1B] text-[#A0A0A0] flex items-center px-3 py-1 border-b border-[#2E2D31]">
          {selectedFile && (
            <span className="mr-2 bg-[#2C2C2C] px-2 py-0.5 rounded text-[#E1E1E1] text-xs">
              {getFileIcon(selectedFile.split("/").pop() || "")}{" "}
              {selectedFile.split("/").pop()}
            </span>
          )}
        </div>

        {/* Code Area */}
        <div className="flex-1 bg-[#1A1A1B] overflow-hidden">
          {selectedFile ? (
            <CodeMirror
              value={fileContents[selectedFile] || ""}
              height="100%"
              theme={githubDark}
              extensions={[
                getLanguageExtension(selectedFile),
                EditorView.lineWrapping,
                EditorView.theme({
                  "&": { fontSize: "13px" },
                  ".cm-gutters": {
                    backgroundColor: "#1A1A1B",
                    borderRight: "1px solid #2E2D31",
                  },
                  ".cm-activeLineGutter": { backgroundColor: "#2C2C2C" },
                }),
              ]}
              onChange={(value) =>
                setFileContents((prev) => ({ ...prev, [selectedFile]: value }))
              }
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                history: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#A0A0A0] text-xs">
              Select a file to start editing
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-[#1A1A1B] text-[#A0A0A0] px-3 py-0.5 text-[10px] flex justify-between border-t border-[#2E2D31]">
          <span>
            {selectedFile
              ? selectedFile.split(".").pop()?.toUpperCase()
              : "No file selected"}
          </span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
