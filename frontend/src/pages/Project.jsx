import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context";
import { getWebContainer } from "../config/webContainer";
import toast from "react-hot-toast";

import ChatPanel from "../components/ChatPanel";
import SidePanel from "../components/SidePanel";
import FileExplorer from "../components/FileExplorer";
import CodeEditor from "../components/CodeEditor";
import AddUserPopUp from "../components/AddUserPopUp";
import SyntaxHighlightedCode from "../components/SyntaxHighlightedCode";
import VersionSelector from "../components/VersionSelector";

import Markdown from "markdown-to-jsx";

const useScrollToBottom = (ref, dependency) => {
  useEffect(() => {
    if (ref.current) {
      const box = ref.current;
      const isAtBottom =
        box.scrollHeight - box.scrollTop - box.clientHeight < 70;
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
  const [message, setMessage] = useState("");
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [saveFileTree, setSaveFileTree] = useState({});
  const [showVersionSelector, setShowVersionSelector] = useState(false);
  const [fileVersions, setFileVersions] = useState([]);
  // PROJECT VERSIONING STATE
  const [projectVersions, setProjectVersions] = useState([]);
  const [currentProjectVersion, setCurrentProjectVersion] = useState(null);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const messageBox = useRef(null);
  useEffect(() => {
    if (!project) navigate("/home");
  }, [project, navigate]);
  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/project/get-project/${project._id}`);
      setProject(res.data.project);
    } catch (err) {
      console.error("Project fetch error:", err);
      setLogs((prev) => [...prev, `Error: ${err.message}`]);
    }
  }, [project?._id]);
  // Fetch latest project version and load files
  const fetchLatestProjectVersion = useCallback(async () => {
    if (!project?._id) return;

    try {
      setIsLoadingVersions(true);
      console.log("🔄 Fetching latest project version...");

      // Get latest project version
      const response = await api.get(`/project/${project._id}/versions`);
      console.log("📊 Project versions response:", response.data);

      if (response.data.success && response.data.data.length > 0) {
        const versions = response.data.data.sort(
          (a, b) => b.version - a.version
        );
        console.log("📈 Sorted versions:", versions);
        setProjectVersions(versions);

        const latestVersion = versions[0];
        console.log("🎯 Latest version:", latestVersion);

        // Get full project version data with file tree
        const versionResponse = await api.get(
          `/project/${project._id}/version/${latestVersion._id}`
        );
        console.log("🌳 Version response with fileTree:", versionResponse.data);

        if (versionResponse.data.success) {
          const projectVersion = versionResponse.data.data;
          setCurrentProjectVersion(projectVersion);
          console.log("📁 Setting fileTree:", projectVersion.fileTree);

          // Force state update with new object reference
          const newFileTree = { ...projectVersion.fileTree };
          setFileTree(newFileTree);

          // Auto-select first file if none selected
          const fileKeys = Object.keys(projectVersion.fileTree || {});
          console.log("🔑 File keys:", fileKeys);

          if (fileKeys.length > 0) {
            const firstFile = fileKeys[0];
            console.log("📄 Setting current file:", firstFile);
            setCurrentFile(firstFile);
            setOpenFiles([firstFile]);
          } else {
            setCurrentFile(null);
            setOpenFiles([]);
          }

          setLogs((prev) => [
            ...prev,
            `✅ Loaded project version ${projectVersion.version} with ${fileKeys.length} files`,
          ]);
          toast.success(
            `✅ Loaded project v${projectVersion.version} with ${fileKeys.length} files`
          );
        }
      } else {
        console.log("⚠️ No project versions found");
        setFileTree({});
        setProjectVersions([]);
        setCurrentProjectVersion(null);
      }
    } catch (error) {
      console.error("❌ Error fetching project versions:", error);
      setLogs((prev) => [
        ...prev,
        `❌ Error loading project: ${error.message}`,
      ]);
    } finally {
      setIsLoadingVersions(false);
    }
  }, [project?._id]);
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);
  // Load latest project version when project loads
  useEffect(() => {
    if (project?._id) {
      console.log("🚀 Project loaded, fetching versions...");
      fetchLatestProjectVersion();
    }
  }, [project?._id, fetchLatestProjectVersion]);
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoadingMessages(true);
      const res = await api.get(`/project/${project._id}/messages`);
      const newMessages = Array.isArray(res.data) ? res.data : [];
      setMessages((prev) => {
        const existingIds = new Set(prev.map((msg) => msg._id));
        const filtered = newMessages.filter((msg) => !existingIds.has(msg._id));
        return [...prev, ...filtered].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      });
    } catch (err) {
      toast.error("Messages fetch error:", err);
      setLogs((prev) => [...prev, `Error: ${err.message}`]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [project._id]);
  useEffect(() => {
    if (project?._id) fetchMessages();
  }, [project._id, fetchMessages]);
  useEffect(() => {
    if (!project?._id) return;
    const socket = initializeSocket(project._id);
    socket.on("connect_error", (err) =>
      setLogs((prev) => [...prev, `Socket error: ${err.message}`])
    );
    const mountFileTree = async (container, tree) => {
      if (!Object.keys(tree).length) return;
      try {
        await container.mount(tree);
        setSaveFileTree(tree);
        setLogs((prev) => [...prev, "Mounted file tree"]);
      } catch (err) {
        setLogs((prev) => [...prev, `Mount error: ${err.message}`]);
      }
    };
    if (!webContainer) {
      getWebContainer()
        .then(async (container) => {
          await mountFileTree(container, fileTree);
          setWebContainer(container);
          container.on("server-ready", (port, url) =>
            setLogs((prev) => [...prev, `Server: ${url}`])
          );
        })
        .catch((err) =>
          setLogs((prev) => [...prev, `WebContainer error: ${err.message}`])
        );
    }
    const handleMessage = (data) => {
      if (data.sender === user._id) return;
      console.log("📨 New message received:", data);

      if (data.sender?._id === "ai") {
        console.log("🤖 AI message detected, scheduling refresh...");
        // Refresh project versions when new AI message arrives
        setTimeout(() => {
          console.log("🔄 Refreshing project versions after AI response...");
          fetchLatestProjectVersion();
        }, 3000); // Increased timeout to ensure backend processing is complete
      }
      setMessages((prev) => {
        const newMessage = {
          ...data,
          _id: data._id || `${data.sender._id}-${Date.now()}-${Math.random()}`,
          messageId:
            data.sender?._id === "ai"
              ? data.messageId || data._id
              : data.messageId,
        };
        const exists = prev.some((m) => m._id === newMessage._id);
        if (exists) return prev;
        return [...prev, newMessage].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      });
    };
    receiveMessage("project-message", handleMessage);
    return () => socket.disconnect();
  }, [project._id, fetchLatestProjectVersion, fileTree, webContainer]);
  useScrollToBottom(messageBox, messages);
  const send = () => {
    const userMessage = {
      _id: crypto.randomUUID(),
      message,
      sender: user._id,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    sendMessage("project-message", userMessage);
    setMessage("");
  };
  const getSenderDisplayName = useCallback(
    (senderId) => {
      if (senderId === user._id) return "You";
      const senderUser = project.users?.find((u) => u._id === senderId);
      return senderUser?.username || "Unknown";
    },
    [project.users]
  );
  const writeAiMessage = (message) => {
    try {
      const parsed = JSON.parse(message);
      return (
        <Markdown
          children={parsed.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
              pre: {
                component: (props) => (
                  <pre
                    {...props}
                    className="hljs rounded-lg p-2 bg-slate-900 overflow-x-auto"
                  />
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
      const response = await api.delete(
        `/project/delete-project/${project._id}`
      );
      toast.success("Project deleted successfully");
      navigate("/home");
    } catch (err) {
      setLogs((prev) => [...prev, `Delete error: ${err.message}`]);
    }
  };
  // Handler for loading specific project version
  const handleLoadProjectVersion = useCallback(
    async (projectVersion) => {
      try {
        setIsLoadingVersions(true);
        console.log("🔄 Loading project version:", projectVersion.version);
        // Get full project version data
        const response = await api.get(
          `/project/${project._id}/version/${projectVersion._id}`
        );
        if (response.data.success) {
          const fullProjectVersion = response.data.data;
          console.log("📁 Full project version data:", fullProjectVersion);
          console.log("🌳 FileTree from version:", fullProjectVersion.fileTree);

          setCurrentProjectVersion(fullProjectVersion);
          // Force state update with new object reference
          const newFileTree = { ...fullProjectVersion.fileTree };
          console.log("🔄 Setting new fileTree:", newFileTree);
          setFileTree(newFileTree);

          // Update current file if it exists in this version
          const fileKeys = Object.keys(fullProjectVersion.fileTree || {});
          console.log("🔑 Available file keys in this version:", fileKeys);

          if (fileKeys.length > 0) {
            if (!fileKeys.includes(currentFile)) {
              console.log("📄 Switching to first file:", fileKeys[0]);
              setCurrentFile(fileKeys[0]);
              setOpenFiles([fileKeys[0]]);
            }
          } else {
            setCurrentFile(null);
            setOpenFiles([]);
          }
          toast.success(
            ` Loaded project version ✅ ${fullProjectVersion.version}`
          );
          setLogs((prev) => [
            ...prev,
            ` Loaded project version ✅ ${fullProjectVersion.version}`,
          ]);
        }
      } catch (error) {
        console.error("❌ Error loading project version:", error);
        toast.error("❌ Failed to load project version");
      } finally {
        setIsLoadingVersions(false);
      }
    },
    [project._id, currentFile]
  );

  // Debug function to force refresh
  const forceRefresh = () => {
    console.log("🔧 Force refreshing...");
    setLogs((prev) => [...prev, "🔧 Force refresh triggered"]);
    fetchLatestProjectVersion();
  };
  if (!project) return null;
  return (
    <main className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden">
      <section className="left h-full w-full lg:w-[25%] bg-zinc-950/90 flex flex-col border-r border-slate-700 flex-shrink-0">
        <header className="flex justify-between items-center p-3 lg:p-4 w-full bg-gradient-to-r from-slate-800 to-indigo-900 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Back arrow to Home */}
            <button
              onClick={() => navigate("/home")}
              className="text-white hover:text-gray-300 transition-colors flex-shrink-0"
              title="Back to Home"
            >
              <i className="ri-arrow-left-line text-lg lg:text-xl"></i>
            </button>
            <h1 className="text-sm lg:text-lg uppercase font-bold text-white font-serif min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {typeof project?.name === "object"
                ? project.name.name
                : project.name}
            </h1>
          </div>
          <div className="flex gap-1 lg:gap-2 items-center flex-shrink-0">
            <button
              className="p-1.5 lg:p-2 rounded-full bg-slate-200"
              onClick={() => setSidePanel(true)}
            >
              <i className="ri-group-fill text-black text-sm lg:text-base" />
            </button>
          </div>
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
          project={project}
          setCurrentFile={setCurrentFile}
          setFileTree={setFileTree}
          projectVersions={projectVersions}
          currentProjectVersion={currentProjectVersion}
          onLoadProjectVersion={handleLoadProjectVersion}
          isLoadingVersions={isLoadingVersions}
          forceRefresh={forceRefresh}
        />
        <SidePanel
          sidePanel={sidePanel}
          setSidePanel={setSidePanel}
          setAddCollaborator={setAddCollaborator}
          project={project}
          handleDelete={handleDelete}
          onCollaboratorRemoved={fetchProject}
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
      <section className="right bg-slate-950 flex-grow h-full flex flex-col lg:flex-row overflow-hidden">
        <FileExplorer
          fileTree={fileTree}
          setCurrentFile={setCurrentFile}
          setOpenFiles={setOpenFiles}
          currentFile={currentFile}
          isLoadingVersions={isLoadingVersions}
          projectVersion={currentProjectVersion}
          project={project}
          onLoadProjectVersion={handleLoadProjectVersion}
          projectVersions={projectVersions}
        />
        <div className="flex flex-col flex-grow min-w-0 overflow-hidden">
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
            saveFileTree={setSaveFileTree}
            project={project}
            currentProjectVersion={currentProjectVersion}
            onLoadProjectVersion={handleLoadProjectVersion}
            isLoadingVersions={isLoadingVersions}
            forceRefresh={forceRefresh}
          />
        </div>
      </section>
      {/* Version Selector Modal */}
      <VersionSelector
        isOpen={showVersionSelector}
        onClose={() => setShowVersionSelector(false)}
        versions={projectVersions}
        onSelectVersion={(selectedVersion) => {
          handleLoadProjectVersion(selectedVersion);
          setShowVersionSelector(false);
        }}
      />
    </main>
  );
};

export default Project;
