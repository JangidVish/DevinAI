import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Select Project Version</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-2">
          {sortedVersions.length > 0 ? (
            sortedVersions.map((version, index) => (
              <button
                key={version._id}
                className={`w-full text-left p-3 rounded ${index === 0 ? 'bg-purple-600' : 'bg-slate-700'} hover:bg-purple-500 transition-colors`}
                onClick={() => {
                  onSelectVersion(version, index);
                  toast.success(`Loaded project version ${version.version}`);
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-white">
                      Project Version {version.version} {index === 0 && '(Latest)'}
                    </span>
                    <p className="text-sm text-gray-300 mt-1">
                      {version.filesCount || 0} files
                    </p>
                  </div>
                  <span className="text-xs text-gray-300">
                    {version.createdAt ? 
                      formatDistanceToNow(new Date(version.createdAt), { addSuffix: true }) :
                      'Now'
                    }
                  </span>
                </div>
                {version.description && (
                  <p className="text-sm text-gray-300 mt-1 truncate">{version.description}</p>
                )}
              </button>
            ))
          ) : (
            <p className="text-center text-gray-400">No project versions available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionSelector;
