import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import "../styles/components/VersionSelector.css";

const VersionSelector = ({ isOpen, onClose, versions, onSelectVersion }) => {
  const [sortedVersions, setSortedVersions] = useState([]);

  useEffect(() => {
    if (versions && versions.length > 0) {
      // Sort versions by version number (descending)
      const sorted = [...versions].sort((a, b) => b.version - a.version);
      setSortedVersions(sorted);
    }
  }, [versions]);

  if (!isOpen) return null;

  return (
    <div className="version-selector__overlay">
      <div className="version-selector__modal">
        <div className="version-selector__header">
          <h2 className="version-selector__title">Select Project Version</h2>
          <button onClick={onClose} className="version-selector__close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="version-selector__close-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="version-selector__list">
          {sortedVersions.length > 0 ? (
            sortedVersions.map((version, index) => (
              <button
                key={version._id}
                className={`version-selector__item ${
                  index === 0
                    ? "version-selector__item--latest"
                    : "version-selector__item--normal"
                }`}
                onClick={() => {
                  onSelectVersion(version, index);
                  toast.success(`Loaded project version ${version.version}`);
                }}
              >
                <div className="version-selector__item-content">
                  <div className="version-selector__item-info">
                    <span className="version-selector__item-title">
                      Project Version {version.version}{" "}
                      {index === 0 && "(Latest)"}
                    </span>
                    <p className="version-selector__item-files">
                      {version.filesCount || 0} files
                    </p>
                  </div>
                  <span className="version-selector__item-time">
                    {version.createdAt
                      ? formatDistanceToNow(new Date(version.createdAt), {
                          addSuffix: true,
                        })
                      : "Now"}
                  </span>
                </div>
                {version.description && (
                  <p className="version-selector__item-desc">
                    {version.description}
                  </p>
                )}
              </button>
            ))
          ) : (
            <p className="version-selector__empty">
              No project versions available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionSelector;
