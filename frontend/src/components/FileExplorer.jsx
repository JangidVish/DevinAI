import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "../config/axios";

const FileExplorer = ({
  fileTree,
  setCurrentFile,
  setOpenFiles,
  currentFile,
  isLoadingVersions,
  projectVersion, // NEW: Current project version info
  project, // Project object to fetch versions
  onLoadProjectVersion, // Handler for loading project version
}) => {
  const [showProjectVersions, setShowProjectVersions] = useState(false);
  const [projectVersions, setProjectVersions] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch project versions
  useEffect(() => {
    const fetchProjectVersions = async () => {
      if (!project?._id) return;

      try {
        const response = await api.get(`/project/${project._id}/versions`);
        if (response.data.success) {
          setProjectVersions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching project versions:", error);
      }
    };

    fetchProjectVersions();
  }, [project?._id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProjectVersions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleVersionSelect = async (selectedVersion) => {
    if (onLoadProjectVersion) {
      await onLoadProjectVersion(selectedVersion);
    }
    setShowProjectVersions(false);
  };

  return (
    <div className="explorer h-full w-full lg:w-64 xl:w-72 lg:max-w-80 lg:min-w-52 bg-slate-900 flex-shrink-0 border-r border-slate-700 overflow-hidden">
      <div className="file-tree flex flex-col h-full">
        <div className="p-2 lg:p-3 border-b border-slate-700 flex-shrink-0">
          <h3 className="text-white font-bold text-sm lg:text-base">Files</h3>
          {projectVersion && (
            <div className="mt-1">
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded whitespace-nowrap">
                Project v{projectVersion.version}
              </span>
            </div>
          )}

          {/* Project Versions Dropdown */}
          <div className="mt-2 relative" ref={dropdownRef}>
            <button
              className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white text-xs px-2 py-1.5 rounded border border-slate-600 flex items-center justify-between transition-colors"
              onClick={() => setShowProjectVersions(!showProjectVersions)}
            >
              <span>Project Versions ({projectVersions.length})</span>
              <i
                className={`ri-arrow-down-s-line transition-transform ${
                  showProjectVersions ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {showProjectVersions && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-slate-800 border border-slate-600 rounded shadow-lg max-h-48 overflow-y-auto">
                {projectVersions.length === 0 ? (
                  <div className="p-2 text-gray-400 text-xs">
                    No project versions found
                  </div>
                ) : (
                  projectVersions.map((version, index) => (
                    <button
                      key={version._id}
                      className={`w-full text-left p-2 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                        index === 0 ? "bg-slate-700" : ""
                      }`}
                      onClick={() => handleVersionSelect(version)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs text-white ${
                              index === 0 ? "bg-green-600" : "bg-purple-600"
                            }`}
                          >
                            v{version.version}
                            {index === 0 && " (Latest)"}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {version.filesCount} files
                        </span>
                      </div>
                      {version.description && (
                        <div className="mt-1 text-xs text-gray-500 truncate">
                          {version.description}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {isLoadingVersions ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading project files...</p>
          </div>
        ) : Object.keys(fileTree).length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-400 text-sm">No files available</p>
            <p className="text-gray-500 text-xs mt-1">
              Send an @ai command to generate files
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {Object.keys(fileTree).map((file, index) => {
              const fileData = fileTree[file];
              const isSelected = file === currentFile;
              const hasVersion = fileData.version !== undefined;
              const isLatest = fileData.isLatestVersion;
              const fromMessage = fileData.fromMessage;
              const isModified = fileData.isModified;

              return (
                <button
                  key={`file-${index}-${file}`}
                  className={`tree-element p-2 lg:p-3 flex flex-col w-full transition-all duration-200 ${
                    isSelected
                      ? "bg-indigo-700 border-l-4 border-indigo-400"
                      : "bg-slate-700 hover:bg-slate-600"
                  } border-0 rounded-r text-left`}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles((prev) =>
                      Array.from(new Set([...prev, file]))
                    );
                  }}
                >
                  <div className="flex justify-between items-center w-full min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isSelected ? "bg-indigo-300" : "bg-gray-500"
                        }`}
                      ></div>
                      <p className="cursor-pointer font-semibold text-xs lg:text-sm truncate">
                        {file.split("/").pop()}
                      </p>
                    </div>

                    <div className="flex gap-1 items-center flex-shrink-0 ml-2">
                      {hasVersion && (
                        <span
                          className={`text-white text-xs px-1.5 py-0.5 rounded-full ${
                            isLatest ? "bg-green-600" : "bg-indigo-600"
                          }`}
                        >
                          v{fileData.version}
                        </span>
                      )}
                      {fromMessage && (
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          title="From AI chat"
                        ></div>
                      )}
                      {isModified && (
                        <div
                          className="w-2 h-2 bg-orange-500 rounded-full"
                          title="Modified"
                        ></div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate flex-1">
                      {file}
                    </p>
                    {fileData.lastModified && (
                      <p className="text-xs text-gray-500 flex-shrink-0 ml-2 hidden lg:block">
                        {formatDistanceToNow(new Date(fileData.lastModified), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 mt-1 flex-wrap">
                    {fromMessage && (
                      <span className="text-xs bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                        From Chat
                      </span>
                    )}
                    {isModified && (
                      <span className="text-xs bg-orange-900 text-orange-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                        Modified
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
