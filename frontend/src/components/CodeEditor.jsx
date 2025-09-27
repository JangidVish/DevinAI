import React, { useState, useEffect } from "react";
import hljs from "highlight.js";
import FileVersionList from "./FileVersionList";
import api from "../config/axios";
import { toast } from "react-hot-toast";

const CodeEditor = ({
  currentFile,
  fileTree = {},
  setFileTree,
  openFiles = [],
  setOpenFiles,
  setCurrentFile,
  webContainer,
  setLogs,
  logs = [],
  saveFileTree,
  project,
  allFileVersions = {}, // NEW: Receive all file versions
  onLoadProjectVersion, // NEW: Handler for loading entire project version
  forceRefresh, // NEW: Force refresh function
  isLoadingVersions,
}) => {
  const [currentVersion, setCurrentVersion] = useState(null);

  const handleContentEdit = (e) => {
    try {
      const updatedContent = e.target.innerText;
      if (!currentFile || !setFileTree) return;

      const ft = {
        ...fileTree,
        [currentFile]: {
          file: {
            contents: updatedContent,
          },
          version: fileTree[currentFile]?.version,
          versionId: fileTree[currentFile]?.versionId,
          isLatestVersion: false,
          lastModified: new Date().toISOString(),
          isModified: true,
        },
      };
      setFileTree(ft);
      if (saveFileTree) saveFileTree(ft);
    } catch (error) {
      console.error("Error updating content:", error);
      if (setLogs) {
        setLogs((prev) => [
          ...prev,
          `Error updating content: ${error.message}`,
        ]);
      }
    }
  };

  const getHighlightedContent = () => {
    try {
      if (
        !currentFile ||
        !fileTree[currentFile] ||
        !fileTree[currentFile].file
      ) {
        return "";
      }

      const content = fileTree[currentFile].file.contents || "";
      const language =
        currentFile.endsWith(".js") || currentFile.endsWith(".jsx")
          ? "javascript"
          : currentFile.endsWith(".css")
          ? "css"
          : currentFile.endsWith(".html")
          ? "html"
          : currentFile.endsWith(".json")
          ? "json"
          : currentFile.endsWith(".md")
          ? "markdown"
          : "javascript";

      return hljs.highlight(language, content).value;
    } catch (error) {
      console.error("Error highlighting content:", error);
      return fileTree[currentFile]?.file?.contents || "";
    }
  };

  if (!currentFile) {
    return (
      <div className="code-editor flex-grow bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center mb-6 mx-auto">
            <i className="ri-code-s-slash-line text-3xl text-slate-500"></i>
          </div>
          <p className="text-xl font-semibold text-white mb-3">
            Welcome to DevMetaAI
          </p>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Select a file from the explorer to start editing, or use AI commands
            to generate new files
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500">
            <i className="ri-lightbulb-line"></i>
            <span>Try typing @ai to get started</span>
          </div>
        </div>
      </div>
    );
  }

  const fileData = fileTree[currentFile];
  const isFromMessage = fileData?.fromMessage;
  const isModified = fileData?.isModified;

  return (
    <div className="code-editor flex-grow bg-zinc-700 flex flex-col min-w-0 overflow-hidden">
      <div className="top flex gap-1 p-1 justify-between bg-zinc-800">
        <div className="actions flex gap-2">
          {currentVersion && (
            <div className="version-info bg-purple-900 text-white text-xs px-2 py-1 rounded flex items-center">
              <span>Project Version {currentVersion.version}</span>
              <button
                className="ml-2 bg-purple-700 px-1 rounded hover:bg-purple-600"
                onClick={() => {
                  setCurrentVersion(null);
                  // Reload latest project state
                  window.location.reload();
                }}
                title="Return to latest version"
              >
                Reset
              </button>
            </div>
          )}

          <button
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded transition-colors"
            onClick={async () => {
              try {
                if (!webContainer) {
                  setLogs &&
                    setLogs((prev) => [
                      ...prev,
                      "Error: WebContainer not initialized",
                    ]);
                  return;
                }
                await webContainer.mount(fileTree);
                setLogs && setLogs((prev) => [...prev, "File tree mounted"]);

                const installProcess = await webContainer.spawn("npm", [
                  "install",
                  "--no-fund",
                ]);
                await installProcess.output.pipeTo(
                  new WritableStream({
                    write(chunk) {
                      if (!/[|\/-]/.test(chunk)) {
                        setLogs &&
                          setLogs((prev) => [...prev, `npm install: ${chunk}`]);
                      }
                    },
                  })
                );
                const installExitCode = await installProcess.exit;
                if (installExitCode !== 0) {
                  setLogs &&
                    setLogs((prev) => [
                      ...prev,
                      `npm install failed with exit code: ${installExitCode}`,
                    ]);
                  return;
                }

                const runProcess = await webContainer.spawn("npm", ["start"]);
                const timeout = new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error("npm start timed out")),
                    30000
                  )
                );
                await Promise.race([
                  runProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        setLogs &&
                          setLogs((prev) => [...prev, `npm start: ${chunk}`]);
                      },
                    })
                  ),
                  timeout,
                ]);
                const runExitCode = await runProcess.exit;
                if (runExitCode !== 0) {
                  setLogs &&
                    setLogs((prev) => [
                      ...prev,
                      `npm start failed with exit code: ${runExitCode}`,
                    ]);
                }
              } catch (err) {
                console.error("Start button error:", err);
                setLogs &&
                  setLogs((prev) => [...prev, `Start error: ${err.message}`]);
              }
            }}
          >
            Start
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
            onClick={async () => {
              try {
                const response = await fetch("http://localhost:3000");
                const text = await response.text();
                setLogs &&
                  setLogs((prev) => [...prev, `Server response: ${text}`]);
              } catch (err) {
                setLogs &&
                  setLogs((prev) => [
                    ...prev,
                    `Server fetch failed: ${err.message}`,
                  ]);
              }
            }}
          >
            Test Server
          </button>
          <button
            className="bg-slate-600 hover:bg-slate-700 text-white text-xs px-2 py-1 rounded transition-colors"
            onClick={() => {
              // Call the forceRefresh function passed from parent
              if (forceRefresh) {
                forceRefresh();
              }
            }}
            title="Refresh project files"
          >
            <i className="ri-refresh-line"></i>
          </button>
        </div>

        <div
          className="file-tabs flex gap-1 overflow-x-auto overflow-y-hidden flex-nowrap"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#6366f1 transparent",
          }}
        >
          {openFiles.map((file) => (
            <div
              key={file}
              className={`code-editor-header flex justify-between items-center p-1 px-2 min-w-32 max-w-44 rounded flex-shrink-0 transition-colors cursor-pointer ${
                currentFile === file
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-600 text-gray-200 hover:bg-slate-500"
              }`}
              onClick={() => setCurrentFile && setCurrentFile(file)}
            >
              <h1 className="font-semibold text-xs lg:text-sm truncate">
                {file.split("/").pop()}
              </h1>
              <button
                className="ml-2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600/50 focus:outline-0 focus:border-0 flex-shrink-0 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenFiles &&
                    setOpenFiles((prev) => prev.filter((f) => f !== file));
                  if (currentFile === file && setCurrentFile) {
                    // Switch to the first remaining file or null
                    const remainingFiles = openFiles.filter((f) => f !== file);
                    setCurrentFile(
                      remainingFiles.length > 0 ? remainingFiles[0] : null
                    );
                  }
                }}
              >
                <i className="ri-close-line text-xs" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area - Fixed height with flex-grow */}
      <div className="editor-section flex-1 bg-gradient-to-br from-slate-800 to-slate-900 min-h-0 overflow-hidden">
        {fileTree[currentFile] && fileTree[currentFile].file ? (
          <div className="code-editor-area h-full overflow-auto bg-slate-900 custom-scrollbar">
            <pre className="hljs h-full p-4">
              <code
                className="hljs h-full outline-none block text-sm leading-relaxed"
                contentEditable
                suppressContentEditableWarning
                onBlur={handleContentEdit}
                dangerouslySetInnerHTML={{
                  __html: getHighlightedContent(),
                }}
                style={{
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  paddingBottom: "2rem",
                  counterSet: "line-numbering",
                  backgroundColor: "transparent",
                  color: "#e2e8f0",
                }}
              />
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <i className="ri-file-code-line text-2xl text-slate-500"></i>
              </div>
              <p className="text-lg font-medium mb-2">No file selected</p>
              <p className="text-sm text-slate-500 max-w-64 mx-auto">
                Choose a file from the explorer to start editing
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Area - Fixed 25% height */}
      <div className="terminal-section h-1/4 bg-slate-950 border-t border-slate-700/50 flex-shrink-0">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center">
                <i className="ri-terminal-line text-white text-xs"></i>
              </div>
              <h3 className="text-white text-sm font-medium">Terminal</h3>
              <div className="flex items-center gap-1 ml-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">Ready</span>
              </div>
            </div>
            <button
              className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50"
              onClick={() => setLogs([])}
            >
              <i className="ri-delete-bin-line mr-1"></i>
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 text-slate-100 text-sm font-mono custom-scrollbar bg-slate-950/50">
            {logs && logs.length > 0 ? (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 mb-2 hover:bg-slate-800/30 px-2 py-1 rounded transition-colors"
                >
                  <span className="text-slate-500 flex-shrink-0 text-xs mt-0.5">
                    $
                  </span>
                  <p className="flex-1 text-slate-200">{log}</p>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 text-slate-500 p-4">
                <i className="ri-information-line text-lg"></i>
                <p>Terminal ready for output...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
