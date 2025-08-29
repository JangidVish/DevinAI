import React from "react";
import { useState } from "react";

const FileExplorer = ({ fileTree, setCurrentFile, setOpenFiles }) => (
  <div className="explorer h-full max-w-64 min-w-52 bg-slate-900">
    <div className="file-tree flex flex-col gap-2">
      {Object.keys(fileTree).map((file, index) => (
        <button
          key={index}
          className="tree-element p-2 flex items-center w-full bg-slate-700 hover:bg-slate-600 border-0"
          onClick={() => {
            setCurrentFile(file);
            setOpenFiles((prev) => Array.from(new Set([...prev, file])));
          }}
        >
          <p className="cursor-pointer font-semibold text-lg w-full">{file}</p>
        </button>
      ))}
    </div>
  </div>
);

export default FileExplorer;