import React from "react";
import { formatDistanceToNow } from 'date-fns';

const FileExplorer = ({ 
  fileTree, 
  setCurrentFile, 
  setOpenFiles, 
  currentFile, 
  isLoadingVersions,
  projectVersion // NEW: Current project version info
}) => (
  <div className="explorer h-full max-w-64 min-w-52 bg-slate-900">
    <div className="file-tree flex flex-col gap-2">
      <div className="p-2 border-b border-slate-700">
        <h3 className="text-white font-bold">Files</h3>
        {projectVersion && (
          <div className="mt-1">
            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
              Project v{projectVersion.version}
            </span>
          </div>
        )}
      </div>
      
      {isLoadingVersions ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading project files...</p>
        </div>
      ) : Object.keys(fileTree).length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-gray-400 text-sm">No files available</p>
          <p className="text-gray-500 text-xs mt-1">Send an @ai command to generate files</p>
        </div>
      ) : (
        Object.keys(fileTree).map((file, index) => {
          const fileData = fileTree[file];
          const isSelected = file === currentFile;
          const hasVersion = fileData.version !== undefined;
          const isLatest = fileData.isLatestVersion;
          const fromMessage = fileData.fromMessage;
          const isModified = fileData.isModified;
          
          return (
            <button
              key={`file-${index}-${file}`}
              className={`tree-element p-3 flex flex-col w-full transition-all duration-200 ${
                isSelected 
                  ? 'bg-indigo-700 border-l-4 border-indigo-400' 
                  : 'bg-slate-700 hover:bg-slate-600'
              } border-0 rounded-r`}
              onClick={() => {
                setCurrentFile(file);
                setOpenFiles((prev) => Array.from(new Set([...prev, file])));
              }}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-indigo-300' : 'bg-gray-500'
                  }`}></div>
                  <p className="cursor-pointer font-semibold text-sm w-full truncate">
                    {file.split('/').pop()}
                  </p>
                </div>
                
                <div className="flex gap-1 items-center">
                  {hasVersion && (
                    <span className={`text-white text-xs px-2 py-0.5 rounded-full ${
                      isLatest ? 'bg-green-600' : 'bg-indigo-600'
                    }`}>
                      v{fileData.version}
                    </span>
                  )}
                  {fromMessage && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" title="From AI chat"></div>
                  )}
                  {isModified && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full" title="Modified"></div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-400 truncate">{file}</p>
                {fileData.lastModified && (
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(fileData.lastModified), { addSuffix: true })}
                  </p>
                )}
              </div>
              
              <div className="flex gap-1 mt-1">
                {fromMessage && (
                  <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">
                    From Chat
                  </span>
                )}
                {isModified && (
                  <span className="text-xs bg-orange-900 text-orange-200 px-2 py-0.5 rounded">
                    Modified
                  </span>
                )}
              </div>
            </button>
          );
        })
      )}
    </div>
  </div>
);

export default FileExplorer;
