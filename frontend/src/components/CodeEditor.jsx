import React, { useState, useEffect } from "react";
import hljs from "highlight.js";
import FileVersionList from "./FileVersionList";
import api from "../config/axios";
import { toast } from "react-hot-toast";
import "../styles/components/CodeEditor.css";

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
      <div className="code-editor code-editor--welcome">
        <div className="code-editor__welcome-content">
          <div className="code-editor__welcome-icon">
            <i className="ri-code-s-slash-line"></i>
          </div>
          <p className="code-editor__welcome-title">Welcome to DevMetaAI</p>
          <p className="code-editor__welcome-subtitle">
            Select a file from the explorer to start editing, or use AI commands
            to generate new files
          </p>
          <div className="code-editor__welcome-hint">
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
    <div className="code-editor">
      <div className="code-editor__header">
        <div className="code-editor__actions">
          {currentVersion && (
            <div className="code-editor__version-info">
              <span>Project Version {currentVersion.version}</span>
              <button
                className="code-editor__version-reset"
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
            className="code-editor__btn code-editor__btn--start"
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
            className="code-editor__btn code-editor__btn--test"
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
            className="code-editor__btn code-editor__btn--refresh"
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

        <div className="code-editor__tabs">
          {openFiles.map((file) => (
            <div
              key={file}
              className={`code-editor__tab ${
                currentFile === file
                  ? "code-editor__tab--active"
                  : "code-editor__tab--inactive"
              }`}
              onClick={() => setCurrentFile && setCurrentFile(file)}
            >
              <h1 className="code-editor__tab-title">
                {file.split("/").pop()}
              </h1>
              <button
                className="code-editor__tab-close"
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
                <i className="ri-close-line" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area - Fixed height with flex-grow */}
      <div className="code-editor__editor-section">
        {fileTree[currentFile] && fileTree[currentFile].file ? (
          <div className="code-editor__area">
            <pre className="code-editor__pre">
              <code
                className="code-editor__code"
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
          <div className="code-editor__empty">
            <div className="code-editor__empty-content">
              <div className="code-editor__empty-icon">
                <i className="ri-file-code-line"></i>
              </div>
              <p className="code-editor__empty-title">No file selected</p>
              <p className="code-editor__empty-subtitle">
                Choose a file from the explorer to start editing
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Area - Fixed 25% height */}
      <div className="code-editor__terminal">
        <div className="code-editor__terminal-container">
          <div className="code-editor__terminal-header">
            <div className="code-editor__terminal-title-group">
              <div className="code-editor__terminal-icon">
                <i className="ri-terminal-line"></i>
              </div>
              <h3 className="code-editor__terminal-title">Terminal</h3>
              <div className="code-editor__terminal-status">
                <div className="code-editor__terminal-status-dot"></div>
                <span className="code-editor__terminal-status-text">Ready</span>
              </div>
            </div>
            <button
              className="code-editor__terminal-clear"
              onClick={() => setLogs([])}
            >
              <i className="ri-delete-bin-line"></i>
              Clear
            </button>
          </div>
          <div className="code-editor__terminal-content">
            {logs && logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="code-editor__terminal-log">
                  <span className="code-editor__terminal-prompt">$</span>
                  <p className="code-editor__terminal-text">{log}</p>
                </div>
              ))
            ) : (
              <div className="code-editor__terminal-empty">
                <i className="ri-information-line"></i>
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
