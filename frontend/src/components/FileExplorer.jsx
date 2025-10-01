import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "../config/axios";
import "../styles/components/FileExplorer.css";

const FileExplorer = ({
  fileTree,
  setCurrentFile,
  setOpenFiles,
  currentFile,
  isLoadingVersions,
  projectVersion, // NEW: Current project version info
  project, // Project object to fetch versions
  onLoadProjectVersion, // Handler for loading project version
  projectVersions = [], // NEW: Project versions passed from parent
}) => {
  const [showProjectVersions, setShowProjectVersions] = useState(false);
  const dropdownRef = useRef(null);

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
    <div className="file-explorer">
      <div className="file-explorer__container">
        <div className="file-explorer__header">
          <h3 className="file-explorer__title">Files</h3>
          {projectVersion && (
            <div className="file-explorer__version-info">
              <span className="file-explorer__version-badge">
                Project v{projectVersion.version}
              </span>
            </div>
          )}

          {/* Project Versions Dropdown */}
          <div className="file-explorer__dropdown" ref={dropdownRef}>
            <button
              className={`file-explorer__dropdown-btn ${
                showProjectVersions ? "file-explorer__dropdown-btn--open" : ""
              }`}
              onClick={() => setShowProjectVersions(!showProjectVersions)}
            >
              <span>Project Versions ({projectVersions.length})</span>
              <i className="ri-arrow-down-s-line"></i>
            </button>

            {showProjectVersions && (
              <div className="file-explorer__dropdown-menu">
                {projectVersions.length === 0 ? (
                  <div className="file-explorer__dropdown-empty">
                    No project versions found
                  </div>
                ) : (
                  projectVersions.map((version, index) => (
                    <button
                      key={version._id}
                      className={`file-explorer__dropdown-item ${
                        index === 0
                          ? "file-explorer__dropdown-item--latest"
                          : ""
                      }`}
                      onClick={() => handleVersionSelect(version)}
                    >
                      <div className="file-explorer__version-header">
                        <div className="file-explorer__version-left">
                          <span
                            className={`file-explorer__version-tag ${
                              index === 0
                                ? "file-explorer__version-tag--latest"
                                : "file-explorer__version-tag--normal"
                            }`}
                          >
                            v{version.version}
                            {index === 0 && " (Latest)"}
                          </span>
                        </div>
                        <span className="file-explorer__version-count">
                          {version.filesCount} files
                        </span>
                      </div>
                      {version.description && (
                        <div className="file-explorer__version-desc">
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
          <div className="file-explorer__loading">
            <div className="file-explorer__spinner"></div>
            <p className="file-explorer__loading-text">
              Loading project files...
            </p>
          </div>
        ) : Object.keys(fileTree).length === 0 ? (
          <div className="file-explorer__empty">
            <p className="file-explorer__empty-title">No files available</p>
            <p className="file-explorer__empty-subtitle">
              Send an @ai command to generate files
            </p>
          </div>
        ) : (
          <div className="file-explorer__file-list">
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
                  className={`file-explorer__file-item ${
                    isSelected
                      ? "file-explorer__file-item--selected"
                      : "file-explorer__file-item--normal"
                  }`}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles((prev) =>
                      Array.from(new Set([...prev, file]))
                    );
                  }}
                >
                  <div className="file-explorer__file-header">
                    <div className="file-explorer__file-main">
                      <div
                        className={`file-explorer__file-dot ${
                          isSelected
                            ? "file-explorer__file-dot--selected"
                            : "file-explorer__file-dot--normal"
                        }`}
                      ></div>
                      <p className="file-explorer__file-name">
                        {file.split("/").pop()}
                      </p>
                    </div>

                    <div className="file-explorer__file-status">
                      {hasVersion && (
                        <span
                          className={`file-explorer__version-badge ${
                            isLatest
                              ? "file-explorer__version-badge--latest"
                              : "file-explorer__version-badge--normal"
                          }`}
                        >
                          v{fileData.version}
                        </span>
                      )}
                      {fromMessage && (
                        <div
                          className="file-explorer__status-dot file-explorer__status-dot--ai"
                          title="From AI chat"
                        ></div>
                      )}
                      {isModified && (
                        <div
                          className="file-explorer__status-dot file-explorer__status-dot--modified"
                          title="Modified"
                        ></div>
                      )}
                    </div>
                  </div>

                  <div className="file-explorer__file-meta">
                    <p className="file-explorer__file-path">{file}</p>
                    {fileData.lastModified && (
                      <p className="file-explorer__file-time">
                        {formatDistanceToNow(new Date(fileData.lastModified), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>

                  <div className="file-explorer__file-tags">
                    {fromMessage && (
                      <span className="file-explorer__tag file-explorer__tag--ai">
                        From Chat
                      </span>
                    )}
                    {isModified && (
                      <span className="file-explorer__tag file-explorer__tag--modified">
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
