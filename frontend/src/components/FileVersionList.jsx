import React, { useState, useEffect } from "react";
import api from "../config/axios";
import { formatDistanceToNow } from "date-fns";
import "../styles/components/FileVersionList.css";

const FileVersionList = ({ projectId, filePath, onVersionSelect }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!projectId || !filePath) return;

    const fetchVersions = async () => {
      try {
        setLoading(true);
        const encodedFilePath = encodeURIComponent(filePath);
        const response = await api.get(
          `/fileversion/versions/${projectId}/${encodedFilePath}`
        );

        if (response.data.success) {
          // Sort versions by version number (descending)
          const sortedVersions = response.data.data.sort(
            (a, b) => b.version - a.version
          );
          setVersions(sortedVersions);
        } else {
          setError("Failed to fetch file versions");
        }
      } catch (err) {
        console.error("Error fetching file versions:", err);
        setError(
          err.response?.data?.message || "Failed to fetch file versions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [projectId, filePath]);

  const handleVersionClick = (version) => {
    if (onVersionSelect) {
      onVersionSelect(version);
    }
  };

  if (!projectId || !filePath) {
    return null;
  }

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="file-version-list">
      <div className="file-version-list__header" onClick={toggleExpanded}>
        <h3 className="file-version-list__title">
          Version History ({versions.length})
        </h3>
        <span className="file-version-list__toggle">
          {expanded ? "▼" : "►"}
        </span>
      </div>

      {expanded && (
        <div className="file-version-list__content">
          {loading ? (
            <div className="file-version-list__loading">
              <div className="file-version-list__spinner"></div>
              <p className="file-version-list__loading-text">
                Loading versions...
              </p>
            </div>
          ) : error ? (
            <p className="file-version-list__error">{error}</p>
          ) : versions.length === 0 ? (
            <p className="file-version-list__empty">No versions found</p>
          ) : (
            <ul className="file-version-list__versions">
              {versions.map((version, index) => (
                <li
                  key={version._id}
                  className={`file-version-list__version-item ${
                    index === 0 ? "file-version-list__version-item--latest" : ""
                  }`}
                  onClick={() => handleVersionClick(version)}
                >
                  <div className="file-version-list__version-info">
                    <div className="file-version-list__version-left">
                      <span
                        className={`file-version-list__version-badge ${
                          index === 0
                            ? "file-version-list__version-badge--latest"
                            : "file-version-list__version-badge--normal"
                        }`}
                      >
                        V{version.version}
                        {index === 0 && " (Latest)"}
                      </span>
                      <span className="file-version-list__version-time">
                        {formatDistanceToNow(new Date(version.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {version.metadata && version.metadata.generatedBy && (
                      <span className="file-version-list__version-tag">
                        {version.metadata.generatedBy}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default FileVersionList;
