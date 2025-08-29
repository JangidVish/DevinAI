import React from "react";

const CodeEditor = ({
  currentFile,
  fileTree,
  setFileTree,
  openFiles,
  setOpenFiles,
  setCurrentFile,
  webContainer,
  setLogs,
  logs,
}) => (
  currentFile && (
    <div className="code-editor flex-grow bg-zinc-700 flex flex-col">
      <div className="top flex gap-1 p-1">
        <div className="actions flex gap-2">
          {/* ...Start and Test Server buttons (copy from your code)... */}
                 <button
                  onClick={async () => {
                    try {
                      if (!webContainer) {
                        setLogs((prev) => [...prev, 'Error: WebContainer not initialized']);
                        return;
                      }
                      // console.log('File tree:', JSON.stringify(fileTree, null, 2));
                      await webContainer.mount(fileTree);
                      setLogs((prev) => [...prev, 'File tree mounted']);

                      const installProcess = await webContainer.spawn('npm', ['install', '--no-fund']);
                      await installProcess.output.pipeTo(
                        new WritableStream({
                          write(chunk) {
                            if (!/[|\\/-]/.test(chunk)) {
                              setLogs((prev) => [...prev, `npm install: ${chunk}`]);
                              // console.log(chunk)
                            }
                          },
                        })
                      );
                      const installExitCode = await installProcess.exit;
                      if (installExitCode !== 0) {
                        setLogs((prev) => [...prev, `npm install failed with exit code: ${installExitCode}`]);
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
                              setLogs((prev) => [...prev, `npm start: ${chunk}`]);
                            },
                          })
                        ),
                        timeout,
                      ]);
                      const runExitCode = await runProcess.exit;
                      if (runExitCode !== 0) {
                        setLogs((prev) => [...prev, `npm start failed with exit code: ${runExitCode}`]);
                      }
                    } catch (err) {
                      console.error('Start button error:', err);
                      setLogs((prev) => [...prev, `Start error: ${err.message}`]);
                    }
                  }}
                >
                  Start
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:3000');
                      const text = await response.text();
                      setLogs((prev) => [...prev, `Server response: ${text}`]);
                    } catch (err) {
                      setLogs((prev) => [...prev, `Server fetch failed: ${err.message}`]);
                    }
                  }}
                >
                  Test Server
                </button>
        </div>
        {openFiles.map((file) => (
          <div
            key={file}
            className="code-editor-header flex justify-between items-center p-1 px-2 w-44 bg-base-300 rounded"
          >
            <h1 className="font-semibold text-lg">{file}</h1>
            <button
              className="p-1 focus:outline-0 focus:border-0"
              onClick={() => {
                setOpenFiles((prev) => prev.filter((f) => f !== file));
                if (currentFile === file) setCurrentFile(null);
              }}
            >
              <i className="ri-close-fill" />
            </button>
          </div>
        ))}
      </div>
      <div className="bottom bg-zinc-800 flex-grow w-full h-full">
        {fileTree[currentFile] && (
          <textarea
            value={fileTree[currentFile]?.file?.contents || ''}
            className="w-full h-full p-4 bg-base-300 text-white font-mono"
            onChange={(e) => {
              setFileTree((prev) => ({
                ...prev,
                [currentFile]: { file: { contents: e.target.value } },
              }));
            }}
          />
        )}
      </div>
      <div className="logs p-2 bg-slate-900 text-white max-h-40 overflow-y-auto">
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  )
);

export default CodeEditor;