import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import userAvatar from '../assets/userAvatar.webp';
import AddUserPopUp from '../components/AddUserPopUp';
import api from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer';

function SyntaxHighlightedCode({ className, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current);
      ref.current.removeAttribute('data-highlighted');
    }
  }, [className, children]);

  return <code {...props} ref={ref} className={className}>{children}</code>;
}

const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const initialProject = location.state?.project;
  const [project, setProject] = useState(initialProject);
  const [sidePanel, setSidePanel] = useState(false);
  const [addCollaborator, setAddCollaborator] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [logs, setLogs] = useState([]);
  const messageBox = useRef(null);

  // Redirect if project is missing
  useEffect(() => {
    if (!project) {
      navigate('/');
    }
  }, [project, navigate]);

  // Fetch latest project data
  const fetchProject = async () => {
    try {
      const res = await api.get(`/project/get-project/${project._id}`);
      setProject(res.data.project);
    } catch (err) {
      console.error('Failed to refresh project data:', err);
      setLogs((prev) => [...prev, `Error fetching project: ${err.message}`]);
    }
  };

  // Fetch historical messages
  const fetchMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const res = await api.get(`/project/${project._id}/messages`);
      const fetchedMessages = Array.isArray(res.data) ? res.data : [];
      setMessages((prev) => {
        const existingIds = new Set(prev.map((msg) => msg._id));
        const newMessages = fetchedMessages.filter((msg) => !existingIds.has(msg._id));
        return [...prev, ...newMessages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setMessages([]);
      setLogs((prev) => [...prev, `Error fetching messages: ${err.message}`]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Fetch messages on mount or when project._id changes
  useEffect(() => {
    if (project?._id) {
      fetchMessages();
    }
  }, [project._id]);

  // Initialize socket and WebContainer
  useEffect(() => {
    if (!project?._id) {
      console.warn('project._id is missing, skipping socket and WebContainer setup');
      return;
    }

    const socket = initializeSocket(project._id);

    socket.on('connect', () => {
      console.log(`WebSocket connected for project ${project._id}`);
    });
    socket.on('connect_error', (err) => {
      console.error('WebSocket connection failed:', err);
      setLogs((prev) => [...prev, `WebSocket error: ${err.message}`]);
    });

    const mountFileTree = async (container, tree) => {
      if (Object.keys(tree).length === 0) {
        console.warn('fileTree is empty, skipping mount');
        setLogs((prev) => [...prev, 'Error: fileTree is empty']);
        return;
      }
      try {
        console.log('Mounting fileTree:', JSON.stringify(tree, null, 2));
        await container.mount(tree);
        console.log('✅ File tree mounted');
        setLogs((prev) => [...prev, 'File tree mounted successfully']);
      } catch (err) {
        console.error('Failed to mount file tree:', err);
        setLogs((prev) => [...prev, `Error mounting file tree: ${err.message}`]);
      }
    };

    if (!webContainer) {
      getWebContainer()
        .then(async (container) => {
          await mountFileTree(container, fileTree);
          setWebContainer(container);
          container.on('server-ready', (port, url) => {
            console.log(`Server running at ${url}`);
            setLogs((prev) => [...prev, `Server running at ${url}`]);
          });
          console.log('✅ Container started');
        })
        .catch((err) => {
          console.error('Failed to get WebContainer:', err);
          setLogs((prev) => [...prev, `WebContainer error: ${err.message}`]);
        });
    }

    const handleMessage = async(data) => {
      let message;
      try {
        if (data.sender._id === "ai") {
      const message = JSON.parse(data.message);
      console.log("AI message:", message);

      const normalizedTree = Object.fromEntries(
        Object.entries(fileTree).map(([key, value]) => [[key], value])
      );

      await webContainer?.mount(normalizedTree); // ✅ re-mount on AI reply

 
      if (message.fileTree) {
        setFileTree(message.fileTree);
        if (webContainer) {
          mountFileTree(webContainer, message.fileTree);
        }
      }
      setMessages((prevMessages) => [...prevMessages, data]);
    } else {
      setMessages((prevMessages) => [...prevMessages, data]);
    }
      } catch (err) {
        console.error('Invalid JSON message received:', err);
        setLogs((prev) => [...prev, `Invalid message: ${data.message}`]);
        return;
      }


      setMessages((prev) => {
        if (data._id && prev.some((msg) => msg._id === data._id)) {
          return prev;
        }
        return [...prev, data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
    };

    receiveMessage('project-message', handleMessage);

    return () => {
      if (socket) {
        socket.off('project-message', handleMessage);
        socket.disconnect();
        console.log('WebSocket disconnected');
      }
    };
  }, [project._id, webContainer, fileTree]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const box = messageBox.current;
    if (box && messages.length > 0) {
      const isAtBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 70;
      if (isAtBottom) {
        box.scrollTop = box.scrollHeight;
      }
    }
  }, [messages]);

  const send = () => {
    if (!message.trim()) return;

    const userMessage = {
      _id: crypto.randomUUID(),
      message,
      sender: user._id,
      timestamp: new Date(Date.now() + 500).toISOString(),
    };

    setMessages((prev) => [...prev, userMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    sendMessage('project-message', userMessage);
    setMessage('');
  };

  const getSenderDisplayName = (senderId) => {
    if (senderId === user._id) return 'You';
    const senderUser = project.users?.find((u) => u._id === senderId);
    return senderUser?.email || senderId || 'Unknown';
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/project/delete-project/${project._id}`);
      console.log('Successfully deleted project');
      navigate('/project');
    } catch (err) {
      console.error('Error deleting project:', err);
      setLogs((prev) => [...prev, `Error deleting project: ${err.message}`]);
    }
  };

  const writeAiMessage = (message) => {
    let messageObject;
    try {
      messageObject = JSON.parse(message);
    } catch (err) {
      console.error('Invalid AI message:', err);
      return <div>Error rendering AI message</div>;
    }
    return (
      <div>
        <Markdown
          children={messageObject.text}
          options={{ overrides: { code: SyntaxHighlightedCode } }}
        />
      </div>
    );
  };

  if (!project) return null;

  return (
    <main className="h-screen w-screen flex">
      <section className="left h-full max-w-92 bg-zinc-950/90 flex flex-col justify-between">
        <header className="flex justify-between items-center p-4 w-full bg-indigo-400">
          <h1 className="text-xl uppercase font-bold text-white font-serif">
            {typeof project?.name === 'object' ? project.name.name : project.name}
          </h1>
          <button className="p-2 rounded-full bg-slate-200" onClick={() => setSidePanel(true)}>
            <i className="ri-group-fill text-black" />
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col p-2">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full text-white">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-white">No messages yet.</div>
          ) : (
            <div
              ref={messageBox}
              className="message-box flex-grow flex flex-col gap-2 overflow-y-auto px-2"
              style={{ maxHeight: 'calc(100vh - 165px)' }}
            >
              {messages.map((msg, index) => {
                const isSenderAI = typeof msg?.sender === 'object';
                const isCurrentUser = !isSenderAI && msg.sender === user._id;
                const displayName = isSenderAI ? msg.sender.name : getSenderDisplayName(msg.sender);

                return (
                  <div
                    key={index}
                    className={`chat ${isCurrentUser ? 'chat-end' : 'chat-start'}`}
                  >
                    <div className="chat-header">{displayName}</div>
                    <div
                      className={`chat-bubble max-w-[90%] ${
                        isSenderAI ? 'bg-slate-900 text-white' : isCurrentUser ? 'bg-indigo-400' : 'bg-indigo-400/70'
                      }`}
                    >
                      {isSenderAI ? writeAiMessage(msg.message) : msg.message}
                    </div>
                    <div className="chat-footer opacity-50 text-xs">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Sent'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="inputField flex justify-between p-2 border border-indigo-400 rounded-lg">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message"
              className="focus:outline-none flex-grow bg-transparent text-white"
            />
            <button className="p-2 ml-2 bg-indigo-600 rounded-full" onClick={send}>
              <i className="ri-send-plane-2-fill" />
            </button>
          </div>
        </div>

        <div
          className={`sidePanel w-full h-full absolute bg-gradient-to-b from-indigo-400/80 to-blue-200/80 transition-all left-[-100%] ${
            sidePanel ? 'translate-x-full' : ''
          } flex flex-col`}
        >
          <header className="flex justify-between p-4 w-full bg-indigo-400 text-white items-center">
            <button className="text-lg font-serif flex items-center gap-2" onClick={() => setAddCollaborator(true)}>
              <i className="ri-user-add-fill text-white" /> Add Collaborators
            </button>
            <button onClick={() => setSidePanel(false)}>
              <i className="ri-close-large-line font-bold text-black" />
            </button>
          </header>
          <div className="user-tiles mt-2 flex flex-col gap-2 flex-grow">
            {project.users?.map((u, index) => (
              <div key={u._id || index} className="tile w-full bg-indigo-300 hover:bg-indigo-400 rounded flex gap-4 items-center">
                <div className="avatar p-2">
                  <div className="w-12 rounded-full">
                    <img src={userAvatar} alt="avatar" />
                  </div>
                </div>
                <div className="name">{u.email || 'user@gmail.com'}</div>
              </div>
            ))}
          </div>
          <div className="tile w-full text-white bg-red-400 rounded-2xl rounded-b-none justify-center p-2 text-lg mt-2 flex items-center">
            <button onClick={handleDelete}>
              <i className="ri-delete-bin-line text-xl" /> Delete Project
            </button>
          </div>
        </div>

        {addCollaborator && (
          <AddUserPopUp
            projectId={project._id}
            onClose={() => setAddCollaborator(false)}
            onSuccess={() => {
              setAddCollaborator(false);
              fetchProject();
            }}
          />
        )}
      </section>

      <section className="right bg-red-200 flex-grow h-full flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-900">
          <div className="file-tree flex flex-col gap-2">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                className="tree-element p-2 flex items-center w-full bg-slate-700 hover:bg-slate-600"
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
        {currentFile && (
          <div className="code-editor flex-grow bg-slate-700 flex flex-col">
            <div className="top flex gap-1 p-1">
              <div className="actions flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      if (!webContainer) {
                        setLogs((prev) => [...prev, 'Error: WebContainer not initialized']);
                        return;
                      }
                      console.log('File tree:', JSON.stringify(fileTree, null, 2));
                      await webContainer.mount(fileTree);
                      setLogs((prev) => [...prev, 'File tree mounted']);

                      const installProcess = await webContainer.spawn('npm', ['install', '--no-fund']);
                      await installProcess.output.pipeTo(
                        new WritableStream({
                          write(chunk) {
                            if (!/[|\\/-]/.test(chunk)) {
                              setLogs((prev) => [...prev, `npm install: ${chunk}`]);
                              console.log(chunk)
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
                  className="code-editor-header flex justify-between items-center p-1 px-4 w-44 bg-slate-800 rounded"
                >
                  <h1 className="font-semibold text-lg">{file}</h1>
                  <button
                    className="p-1"
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
            <div className="bottom bg-slate-800 flex-grow w-full h-full">
              {fileTree[currentFile] && (
                <textarea
                  value={fileTree[currentFile]?.file?.contents || ''}
                  className="w-full h-full p-4 bg-slate-800 text-white font-mono"
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
        )}
      </section>
    </main>
  );
};

export default Project;