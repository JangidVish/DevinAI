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
      <div className="code-editor flex-grow bg-zinc-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="mb-4">
            <i className="ri-code-s-slash-line text-6xl text-gray-500"></i>
          </div>
          <p className="text-lg font-semibold">No file selected</p>
          <p className="text-sm text-gray-400">
            Select a file from the explorer or generate files with @ai commands
          </p>
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
                className="ml-2 text-gray-400 hover:text-white focus:outline-0 focus:border-0 flex-shrink-0"
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
                <i className="ri-close-fill text-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area - 80% height */}
      <div
        className="editor-section flex-grow bg-zinc-800"
        style={{ height: "80%" }}
      >
        {fileTree[currentFile] && fileTree[currentFile].file ? (
          <div className="code-editor-area h-full overflow-auto bg-slate-50">
            <pre className="hljs h-full">
              <code
                className="hljs h-full outline-none block"
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
                }}
              />
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <i className="ri-file-code-line text-4xl mb-2"></i>
              <p>Select a file to view its content</p>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Area - 20% height */}
      <div
        className="terminal-section bg-slate-900 border-t border-slate-700"
        style={{ height: "20%" }}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-2 border-b border-slate-700">
            <h3 className="text-white text-sm font-medium">Terminal</h3>
            <button
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-700 transition-colors"
              onClick={() => setLogs([])}
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-white text-sm font-mono">
            {logs && logs.length > 0 ? (
              logs.map((log, index) => (
                <p key={index} className="mb-1">
                  {log}
                </p>
              ))
            ) : (
              <p className="text-gray-400">No terminal output yet...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
