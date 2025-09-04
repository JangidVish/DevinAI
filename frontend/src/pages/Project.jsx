import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import { getWebContainer } from '../config/webContainer';
import toast from 'react-hot-toast';

import ChatPanel from '../components/ChatPanel';
import SidePanel from '../components/SidePanel';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import AddUserPopUp from '../components/AddUserPopUp';
import SyntaxHighlightedCode from '../components/SyntaxHighlightedCode';

import Markdown from 'markdown-to-jsx';

const useScrollToBottom = (ref, dependency) => {
  useEffect(() => {
    if (ref.current) {
      const box = ref.current;
      const isAtBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 70;
      if (isAtBottom) box.scrollTop = box.scrollHeight;
    }
  }, [dependency]);
};

const Project = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const initialProject = location.state?.project;
  const [project, setProject] = useState(initialProject);
  const [sidePanel, setSidePanel] = useState(false);
  const [addCollaborator, setAddCollaborator] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messageBox = useRef(null);

  useEffect(() => { if (!project) navigate('/'); }, [project, navigate]);

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/project/get-project/${project._id}`);
 
      setProject(res.data.project);
    } catch (err) {
      console.error('Project fetch error:', err);
      setLogs(prev => [...prev, `Error: ${err.message}`]);
    }
  }, [project?._id]);

  useEffect(() => {
    fetchProject();
  
  }, [])


  const fetchMessages = useCallback(async () => {
    try {
      setIsLoadingMessages(true)
      const res = await api.get(`/project/${project._id}/messages`);
      const newMessages = Array.isArray(res.data) ? res.data : [];
      
      setMessages(prev => {
        const existingIds = new Set(prev.map(msg => msg._id));
        const filtered = newMessages.filter(msg => !existingIds.has(msg._id));
        return [...prev, ...filtered].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
    } catch (err) {
      toast.error('Messages fetch error:', err);
      setLogs(prev => [...prev, `Error: ${err.message}`]);
    }finally{
      setIsLoadingMessages(false)
    }
  }, [project._id]);

  useEffect(() => { if (project?._id) fetchMessages(); }, [project._id, fetchMessages]);

  useEffect(() => {
    if (!project?._id) return;

    const socket = initializeSocket(project._id);
    socket.on('connect_error', err => setLogs(prev => [...prev, `Socket error: ${err.message}`]));

    const mountFileTree = async (container, tree) => {
      if (!Object.keys(tree).length) return;
      try {
        await container.mount(tree);
        setLogs(prev => [...prev, 'Mounted file tree']);
      } catch (err) {
        setLogs(prev => [...prev, `Mount error: ${err.message}`]);
      }
    };

    if (!webContainer) {
      getWebContainer().then(async container => {
        await mountFileTree(container, fileTree);
        setWebContainer(container);
        container.on('server-ready', (port, url) => setLogs(prev => [...prev, `Server: ${url}`]));
      }).catch(err => setLogs(prev => [...prev, `WebContainer error: ${err.message}`]));
    }

const handleMessage = (data) => {
  if(data.sender===user._id) return;
  console.log("Message at handle message: ", data);
  if (data.sender?._id === 'ai') {
    try {
      const aiData = JSON.parse(data.message);
      if (aiData.fileTree) {
        setFileTree(aiData.fileTree);
      }
      console.log(data)
    } catch (error) {
      toast.error("Error while handling AI message: " + error.message);
    }
  }
setMessages((prev) => {
  const newMessage = {
    ...data,
    _id: data._id || `${data.sender._id}-${Date.now()}-${Math.random()}`,
  };

  const exists = prev.some((m) => m._id === newMessage._id);
  if (exists) return prev;

  return [...prev, newMessage].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
});

 
};

    receiveMessage('project-message', handleMessage);
    return () => socket.disconnect();
  }, [project._id]);

  useScrollToBottom(messageBox, messages);

  const send = () => {
    const userMessage = {
      _id: crypto.randomUUID(),
      message,
      sender: user._id,
      timestamp: new Date().toISOString(),
    };
    console.log("Message send to socket: ", userMessage)

    setMessages(prev => [...prev, userMessage]);
    sendMessage('project-message', userMessage);
    setMessage('');
  };

  
  const getSenderDisplayName = useCallback(senderId => {
    // console.log(project)
    if (senderId === user._id) return 'You';
    const senderUser = project.users?.find(u => u._id === senderId);
    return senderUser?.username || 'Unknown';
  }, [project.users]);

const writeAiMessage = (message) => {
  try {
    const parsed = JSON.parse(message);
    return (
      <Markdown
        options={{
          overrides: {
            code: {
              component: SyntaxHighlightedCode,
            },
            pre: {
              component: (props) => (
                <pre {...props} className="hljs rounded-lg p-2 bg-slate-900 overflow-x-auto" />
              ),
            },
          },
        }}
      >
        {parsed.text}
      </Markdown>
    );
  } catch (error) {
    console.error("Error while writing AI message: ", error);
    return <div>Error rendering AI message</div>;
  }
};
  

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/project/delete-project/${project._id}`);
      toast.success(response)
      navigate('/');
    } catch (err) {
      setLogs(prev => [...prev, `Delete error: ${err.message}`]);
    }
  };


  if (!project) return null;


  return (
    <main className="h-screen w-screen flex">
      <section className="left h-full min-w-92 bg-zinc-950/90 flex flex-col justify-between">
        <header className="flex justify-between items-center p-4 w-full bg-indigo-400">
          <h1 className="text-lg   uppercase font-bold text-white font-serif">
            {typeof project?.name === 'object' ? project.name.name : project.name}
          </h1>
          <button className="p-2 rounded-full bg-slate-200" onClick={() => setSidePanel(true)}>
            <i className="ri-group-fill text-black" />
          </button>
        </header>

        <ChatPanel
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          message={message}
          setMessage={setMessage}
          send={send}
          user={user}
          getSenderDisplayName={getSenderDisplayName}
          messageBox={messageBox}
          writeAiMessage={writeAiMessage}
        />

        <SidePanel
          sidePanel={sidePanel}
          setSidePanel={setSidePanel}
          setAddCollaborator={setAddCollaborator}
          project={project}
          handleDelete={handleDelete}
        />

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

      <section className="right bg-slate-950 flex-grow h-full flex">
        <FileExplorer
          fileTree={fileTree}
          setCurrentFile={setCurrentFile}
          setOpenFiles={setOpenFiles}
        />
        <CodeEditor
          currentFile={currentFile}
          fileTree={fileTree}
          setFileTree={setFileTree}
          openFiles={openFiles}
          setOpenFiles={setOpenFiles}
          setCurrentFile={setCurrentFile}
          webContainer={webContainer}
          setLogs={setLogs}
          logs={logs}
        />
      </section>
    </main>
  );
};

export default Project;