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
  isLoadingVersions
}) => {  
  const [currentVersion, setCurrentVersion] = useState(null);
  const [showVersions, setShowVersions] = useState(false);
  const [projectVersions, setProjectVersions] = useState([]);
  
  // Fetch project versions (not individual file versions)
  useEffect(() => {
    const fetchProjectVersions = async () => {
      if (!project?._id) return;
      
      try {
        const response = await api.get(`/project/${project._id}/versions`);
        if (response.data.success) {
          setProjectVersions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching project versions:', error);
      }
    };

    fetchProjectVersions();
  }, [project?._id]);
  
  const handleVersionSelect = async (projectVersion) => {
    try {
      if (!projectVersion?._id) {
        console.error('Invalid project version');
        setLogs(prev => [...prev, 'Error: Invalid project version']);
        return;
      }
      
      // Load entire project state from this version
      if (onLoadProjectVersion) {
        onLoadProjectVersion(projectVersion);
      }
      
      setCurrentVersion(projectVersion);
      setLogs(prev => [...prev, `Loaded project version ${projectVersion.version}`]);
      toast.success(`Loaded project version ${projectVersion.version}`);
    } catch (error) {
      console.error('Error loading project version:', error);
      setLogs(prev => [...prev, `Error loading version: ${error.message}`]);
    }
  };
  
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
          isModified: true
        },
      };
      setFileTree(ft);
      if (saveFileTree) saveFileTree(ft);
    } catch (error) {
      console.error('Error updating content:', error);
      if (setLogs) {
        setLogs(prev => [...prev, `Error updating content: ${error.message}`]);
      }
    }
  };

  const getHighlightedContent = () => {
    try {
      if (!currentFile || !fileTree[currentFile] || !fileTree[currentFile].file) {
        return '';
      }
      
      const content = fileTree[currentFile].file.contents || '';
      const language = currentFile.endsWith('.js') || currentFile.endsWith('.jsx') ? 'javascript' :
                      currentFile.endsWith('.css') ? 'css' :
                      currentFile.endsWith('.html') ? 'html' :
                      currentFile.endsWith('.json') ? 'json' :
                      currentFile.endsWith('.md') ? 'markdown' :
                      'javascript';
      
      return hljs.highlight(language, content).value;
    } catch (error) {
      console.error('Error highlighting content:', error);
      return fileTree[currentFile]?.file?.contents || '';
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
          <p className="text-sm text-gray-400">Select a file from the explorer or generate files with @ai commands</p>
        </div>
      </div>
    );
  }

  const fileData = fileTree[currentFile];
  const isFromMessage = fileData?.fromMessage;
  const isModified = fileData?.isModified;

  return (
    <div className="code-editor flex-grow bg-zinc-700 flex flex-col">
      {/* Header with file info */}
      <div className="bg-slate-800 p-3 border-b border-slate-600">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <i className="ri-file-code-line text-indigo-400"></i>
              <span className="text-white font-medium">{currentFile.split('/').pop()}</span>
            </div>
            
            <div className="flex gap-2">
              {fileData?.version && (
                <span className={`text-xs px-2 py-1 rounded-full text-white ${
                  fileData.isLatestVersion ? 'bg-green-600' : 'bg-indigo-600'
                }`}>
                  v{fileData.version}
                </span>
              )}
              {currentVersion && (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-600 text-white">
                  Project v{currentVersion.version}
                </span>
              )}
              {isFromMessage && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                  From Chat
                </span>
              )}
              {isModified && (
                <span className="text-xs px-2 py-1 rounded-full bg-orange-600 text-white">
                  Modified
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-2 py-1 rounded transition-colors"
              onClick={() => setShowVersions(!showVersions)}
            >
              {showVersions ? 'Hide Project Versions' : 'Show Project Versions'}
            </button>
          </div>
        </div>
      </div>

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
                  setLogs && setLogs((prev) => [...prev, 'Error: WebContainer not initialized']);
                  return;
                }
                await webContainer.mount(fileTree);
                setLogs && setLogs((prev) => [...prev, 'File tree mounted']);

                const installProcess = await webContainer.spawn('npm', ['install', '--no-fund']);
                await installProcess.output.pipeTo(
                  new WritableStream({
                    write(chunk) {
                      if (!/[|\/-]/.test(chunk)) {
                        setLogs && setLogs((prev) => [...prev, `npm install: ${chunk}`]);
                      }
                    },
                  })
                );
                const installExitCode = await installProcess.exit;
                if (installExitCode !== 0) {
                  setLogs && setLogs((prev) => [...prev, `npm install failed with exit code: ${installExitCode}`]);
                  return;
                }

                const runProcess = await webContainer.spawn('npm', ['start']);
                const timeout = new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('npm start timed out')), 30000)
                );
                await Promise.race([
                  runProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        setLogs && setLogs((prev) => [...prev, `npm start: ${chunk}`]);
                      },
                    })
                  ),
                  timeout,
                ]);
                const runExitCode = await runProcess.exit;
                if (runExitCode !== 0) {
                  setLogs && setLogs((prev) => [...prev, `npm start failed with exit code: ${runExitCode}`]);
                }
              } catch (err) {
                console.error('Start button error:', err);
                setLogs && setLogs((prev) => [...prev, `Start error: ${err.message}`]);
              }
            }}
          >
            Start
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:3000');
                const text = await response.text();
                setLogs && setLogs((prev) => [...prev, `Server response: ${text}`]);
              } catch (err) {
                setLogs && setLogs((prev) => [...prev, `Server fetch failed: ${err.message}`]);
              }
            }}
          >
            Test Server
          </button>
        </div>

        <div className="file-tabs flex gap-1">
          {openFiles.map((file) => (
            <div
              key={file}
              className="code-editor-header flex justify-between items-center p-1 px-2 w-44 bg-base-300 rounded"
            >
              <h1 className="font-semibold text-lg truncate">{file.split('/').pop()}</h1>
              <button
                className="ml-2 text-gray-400 hover:text-white focus:outline-0 focus:border-0"
                onClick={() => {
                  setOpenFiles && setOpenFiles((prev) => prev.filter((f) => f !== file));
                  if (currentFile === file && setCurrentFile) setCurrentFile(null);
                }}
              >
                <i className="ri-close-fill" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom flex flex-grow max-w-full shrink overflow-auto bg-zinc-800">
        {showVersions && project && (
          <div className="version-sidebar w-64 bg-slate-900 p-2 overflow-y-auto">
            <div className="project-versions bg-slate-800 rounded-md p-2">
              <h3 className="text-sm font-medium text-white mb-2">
                Project Versions ({projectVersions.length})
              </h3>
              
              {projectVersions.length === 0 ? (
                <p className="text-gray-400 text-xs p-2">No project versions found</p>
              ) : (
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {projectVersions.map((projectVersion, index) => (
                    <li 
                      key={projectVersion._id} 
                      className={`text-xs p-2 hover:bg-slate-700 rounded cursor-pointer transition-colors ${
                        index === 0 ? 'bg-slate-700' : ''
                      }`}
                      onClick={() => handleVersionSelect(projectVersion)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${
                            index === 0 ? 'bg-green-600' : 'bg-purple-600'
                          }`}>
                            Project v{projectVersion.version}
                            {index === 0 && ' (Latest)'}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {projectVersion.filesCount} files
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {projectVersion.description || 'No description'}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {fileTree[currentFile] && fileTree[currentFile].file && (
          <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
            <pre className="hljs h-full">
              <code
                className="hljs h-full outline-none"
                contentEditable
                suppressContentEditableWarning
                onBlur={handleContentEdit}
                dangerouslySetInnerHTML={{
                  __html: getHighlightedContent(),
                }}
                style={{
                  whiteSpace: "pre-wrap",
                  paddingBottom: "25rem",
                  counterSet: "line-numbering",
                }}
              />
            </pre>
          </div>
        )}
      </div>

      {logs && logs.length > 0 && (
        <div className="logs p-2 bg-slate-900 text-white max-h-40 overflow-y-auto">
          {logs.map((log, index) => (
            <p key={index} className="text-sm">{log}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
