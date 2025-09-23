import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { formatDistanceToNow } from 'date-fns';

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
        const response = await api.get(`/fileversion/versions/${projectId}/${encodedFilePath}`);
        
        if (response.data.success) {
          // Sort versions by version number (descending)
          const sortedVersions = response.data.data.sort((a, b) => b.version - a.version);
          setVersions(sortedVersions);
        } else {
          setError('Failed to fetch file versions');
        }
      } catch (err) {
        console.error('Error fetching file versions:', err);
        setError(err.response?.data?.message || 'Failed to fetch file versions');
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
    <div className="file-version-list bg-slate-800 rounded-md p-2 mt-2">
      <div 
        className="flex justify-between items-center cursor-pointer hover:bg-slate-700 p-1 rounded" 
        onClick={toggleExpanded}
      >
        <h3 className="text-sm font-medium text-white">
          Version History ({versions.length})
        </h3>
        <span className="text-white text-xs">
          {expanded ? '▼' : '►'}
        </span>
      </div>

      {expanded && (
        <div className="mt-2">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <p className="text-gray-400 text-xs ml-2">Loading versions...</p>
            </div>
          ) : error ? (
            <p className="text-red-400 text-xs p-2 bg-red-900/20 rounded">{error}</p>
          ) : versions.length === 0 ? (
            <p className="text-gray-400 text-xs p-2">No versions found</p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {versions.map((version, index) => (
                <li 
                  key={version._id} 
                  className={`text-xs p-2 hover:bg-slate-700 rounded cursor-pointer transition-colors ${
                    index === 0 ? 'bg-slate-700' : ''
                  }`}
                  onClick={() => handleVersionClick(version)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${
                        index === 0 ? 'bg-green-600' : 'bg-indigo-600'
                      }`}>
                        V{version.version}
                        {index === 0 && ' (Latest)'}
                      </span>
                      <span className="text-gray-400">
                        {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    {version.metadata && version.metadata.generatedBy && (
                      <span className="text-xs bg-slate-600 px-2 py-1 rounded">
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
