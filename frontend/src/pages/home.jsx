import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/user.context.jsx";
import { useNavigate } from "react-router-dom";

import api from "../config/axios.js";
import toast, { Toaster } from "react-hot-toast";

const Home = () => {
  const [projectPopup, setProjectPopup] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [projectName, setProjectName] = useState("");
  const { user } = useContext(UserContext);
  console.log(user);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName) {
      toast.error("Project name is required");
      return;
    }
    try {
      const response = await api.post("/project/create", {
        name: projectName,
      });

      if (!response) {
        toast.error("Error while creating project");
      }

      toast.success("Project created successfully");
      getAllProjects();
    } catch (error) {
      toast.error("Error while creating project: ", error);
    } finally {
      setProjectPopup(false);
    }
  };

  const getAllProjects = async () => {
    try {
      const response = await api.get("/project/all");
      setProjectData(response.data.project);
    } catch (error) {
      toast.error("Error while fetching projects: ", error);
    }
  };

  useEffect(() => {
    getAllProjects();
  }, []);

  const navigate = useNavigate();

  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const spotlightRef = React.useRef(null);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Update CSS custom properties for spotlight effect
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-gray-950"
      onMouseMove={(e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        document.documentElement.style.setProperty("--hero-mask-x", `${x}%`);
        document.documentElement.style.setProperty("--hero-mask-y", `${y}%`);
      }}
    >
      {/* Subtle Cursor Tracking for Reveals */}
      <div className="fixed inset-0 pointer-events-none z-30"></div>

      {/* Enhanced Background with Hidden IDE Elements */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black"></div>

        {/* Huly.io Cloud Effect */}
        <div className="cloud-effect"></div>

        {/* Radial Mask Effect */}
        <div className="radial-mask"></div>

        {/* Ethereal Particles */}
        <div className="ethereal-particle"></div>
        <div className="ethereal-particle"></div>
        <div className="ethereal-particle"></div>
        <div className="ethereal-particle"></div>
        <div className="ethereal-particle"></div>
        <div className="ethereal-particle"></div>
        <div className="ethereal-particle"></div>
        <div className="ethereal-particle"></div>

        {/* Hover Area 1 - Code Editor */}
        <div className="group absolute top-16 left-20 w-80 h-48 pointer-events-auto">
          <div className="code-reveal bg-gray-900/20 rounded-lg border border-gray-800/30 p-3 backdrop-blur-sm h-full w-full">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/30">
              <div className="w-3 h-3 bg-red-500/70 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500/70 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500/70 rounded-full"></div>
              <span className="text-xs text-gray-500 ml-2 font-mono">
                App.jsx
              </span>
            </div>
            <div className="font-mono text-xs space-y-1">
              <div className="text-gray-600">
                <span className="text-purple-400">import</span>{" "}
                <span className="text-blue-400">React</span>{" "}
                <span className="text-purple-400">from</span>{" "}
                <span className="text-green-400">'react'</span>;
              </div>
              <div className="text-gray-600">
                <span className="text-purple-400">import</span>{" "}
                <span className="text-blue-400">{"{ useState }"}</span>{" "}
                <span className="text-purple-400">from</span>{" "}
                <span className="text-green-400">'react'</span>;
              </div>
              <div className="text-gray-600 mt-2">
                <span className="text-purple-400">function</span>{" "}
                <span className="text-yellow-400">App</span>
                <span className="text-gray-400">() {"{"}</span>
              </div>
              <div className="text-gray-600 ml-4">
                <span className="text-purple-400">const</span> [
                <span className="text-blue-400">data</span>,{" "}
                <span className="text-blue-400">setData</span>] ={" "}
                <span className="text-yellow-400">useState</span>(
                <span className="text-orange-400">null</span>);
              </div>
              <div className="text-gray-600 ml-4">
                <span className="text-purple-400">return</span>{" "}
                <span className="text-gray-400">&lt;</span>
                <span className="text-red-400">div</span>
                <span className="text-gray-400">&gt;</span>AI-Powered
                <span className="text-gray-400">&lt;/</span>
                <span className="text-red-400">div</span>
                <span className="text-gray-400">&gt;</span>;
              </div>
              <div className="text-gray-600">
                <span className="text-gray-400">{"}"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Terminal Window */}
        <div className="group absolute top-1/2 right-24 w-72 h-40 pointer-events-auto">
          <div className="code-reveal bg-black/40 rounded-lg border border-gray-700/30 p-3 backdrop-blur-sm w-full h-full">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-600/30">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <span className="text-xs text-gray-400 font-mono">Terminal</span>
            </div>
            <div className="font-mono text-xs space-y-1">
              <div className="text-green-400">$ npm install @ai/devtools</div>
              <div className="text-gray-500">
                ✓ Installing AI dependencies...
              </div>
              <div className="text-green-400">$ npm run dev</div>
              <div className="text-blue-400">
                🚀 Server running on http://localhost:3000
              </div>
              <div className="text-yellow-400">⚡ Hot reload enabled</div>
              <div className="text-purple-400">🤖 AI assistant ready</div>
              <div className="text-green-400 animate-pulse">$ _</div>
            </div>
          </div>
        </div>

        {/* Hidden Package.json Preview */}
        <div className="group absolute bottom-32 left-32 w-64 h-36 pointer-events-auto">
          <div className="code-reveal bg-gray-900/30 rounded-lg border border-gray-800/30 p-3 backdrop-blur-sm w-full h-full">
            <div className="text-xs text-gray-400 mb-2 font-mono">
              package.json
            </div>
            <div className="font-mono text-xs space-y-1">
              <div className="text-gray-600">{"{"}</div>
              <div className="text-gray-600 ml-2">
                <span className="text-blue-400">"name"</span>:{" "}
                <span className="text-green-400">"devmeta-ai"</span>,
              </div>
              <div className="text-gray-600 ml-2">
                <span className="text-blue-400">"version"</span>:{" "}
                <span className="text-green-400">"2.0.0"</span>,
              </div>
              <div className="text-gray-600 ml-2">
                <span className="text-blue-400">"dependencies"</span>: {"{"}
              </div>
              <div className="text-gray-600 ml-4">
                <span className="text-blue-400">"react"</span>:{" "}
                <span className="text-green-400">"^18.0.0"</span>,
              </div>
              <div className="text-gray-600 ml-4">
                <span className="text-blue-400">"@ai/core"</span>:{" "}
                <span className="text-green-400">"^1.5.0"</span>
              </div>
              <div className="text-gray-600 ml-2">{"}"}</div>
              <div className="text-gray-600">{"}"}</div>
            </div>
          </div>
        </div>

        {/* Hidden Git Status */}
        <div className="group absolute top-1/3 left-1/3 w-56 h-32 pointer-events-auto">
          <div className="code-reveal bg-gray-800/20 rounded-lg border border-gray-700/30 p-3 backdrop-blur-sm w-full h-full">
            <div className="text-xs text-gray-400 mb-2 font-mono">
              Git Status
            </div>
            <div className="font-mono text-xs space-y-1">
              <div className="text-green-400">● feature/ai-enhancement</div>
              <div className="text-yellow-400">M src/components/AI.jsx</div>
              <div className="text-green-400">A src/hooks/useAI.js</div>
              <div className="text-red-400">D old/legacy.js</div>
              <div className="text-gray-500">3 files changed, +127 -45</div>
            </div>
          </div>
        </div>

        {/* Hidden VS Code Explorer */}
        <div className="group absolute bottom-20 right-1/3 w-48 h-44 pointer-events-auto">
          <div className="code-reveal bg-gray-900/25 rounded-lg border border-gray-800/30 p-2 backdrop-blur-sm w-full h-full">
            <div className="text-xs text-gray-400 mb-2 font-mono">Explorer</div>
            <div className="font-mono text-xs space-y-1">
              <div className="text-gray-500">📁 src/</div>
              <div className="text-gray-500 ml-3">📁 components/</div>
              <div className="text-blue-400 ml-6">🔧 AI.jsx</div>
              <div className="text-blue-400 ml-6">📄 Home.jsx</div>
              <div className="text-gray-500 ml-3">📁 hooks/</div>
              <div className="text-green-400 ml-6">⚡ useAI.js</div>
              <div className="text-gray-500 ml-3">📄 App.jsx</div>
              <div className="text-purple-400">📦 package.json</div>
            </div>
          </div>
        </div>

        {/* Floating Code Snippets */}
        <div className="group absolute top-40 right-1/4 pointer-events-auto">
          <div className="code-reveal text-gray-600/60 text-xs font-mono bg-gray-900/10 px-2 py-1 rounded border border-gray-800/20">
            const AI = await import('@ai/core');
          </div>
        </div>
        <div className="group absolute bottom-1/3 left-1/4 pointer-events-auto">
          <div className="code-reveal text-gray-500/60 text-xs font-mono bg-gray-900/10 px-2 py-1 rounded border border-gray-800/20">
            useEffect(() =&gt; initAI(), []);
          </div>
        </div>
        <div className="group absolute top-2/3 left-1/6 pointer-events-auto">
          <div className="code-reveal text-gray-600/60 text-xs font-mono bg-gray-900/10 px-2 py-1 rounded border border-gray-800/20">
            {"{...ai, enhanced: true}"}
          </div>
        </div>

        {/* Static background elements */}
        <div className="absolute top-32 left-32 w-64 h-64 bg-gray-800/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-32 right-32 w-80 h-80 bg-gray-700/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Header with Logout */}
      <div className="relative z-20 flex justify-between items-center p-6 animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 hover:bg-gray-700 transition-all duration-300 hover:scale-110">
            <i className="ri-code-s-slash-line text-gray-300 text-lg"></i>
          </div>
          <h2 className="text-gray-100 font-medium text-lg hover:text-white transition-colors duration-200">
            DevMetaAI
          </h2>
        </div>
        <button
          className="group p-2.5 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors duration-200"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          title="Logout"
        >
          <i className="ri-logout-box-line text-lg text-gray-300 group-hover:text-red-400 transition-colors"></i>
        </button>
      </div>

      <Toaster
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.8)",
            color: "#fff",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6">
        {/* Hero Section */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight animate-slide-up">
            Welcome to
            <br />
            <span className="text-4xl md:text-5xl text-gray-300 hover:text-gray-200 transition-colors duration-300">
              DevMetaAI
            </span>
          </h1>
          <p
            className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Transform your development workflow with
            <span className="text-gray-200 font-medium hover:text-white transition-colors duration-200">
              {" "}
              AI-powered{" "}
            </span>
            project management
          </p>
        </div>

        {/* Create Project Button - Huly.io Style */}
        <button
          className="huly-glow-button mb-10 animate-slide-up"
          onClick={() => setProjectPopup(true)}
          style={{ animationDelay: "0.4s" }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            e.currentTarget.style.setProperty("--hero-mask-x", `${x}%`);
            e.currentTarget.style.setProperty("--hero-mask-y", `${y}%`);
          }}
        >
          <div className="flex items-center space-x-2">
            <i className="ri-add-line text-lg"></i>
            <span>Create a Project</span>
          </div>
        </button>

        {/* Projects Grid */}
        {!projectData || projectData.length === 0 ? (
          <div
            className="text-center p-8 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/50 animate-fade-in-up spotlight-card"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-700/50 transition-all duration-300">
              <i className="ri-folder-add-line text-2xl text-gray-400 transition-colors duration-200"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-1 transition-colors duration-200">
              No Projects Yet
            </h3>
            <p className="text-gray-500 text-sm transition-colors duration-200">
              Create your first project to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full">
            {projectData.map((project, index) => (
              <div
                key={index}
                className="group p-5 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 cursor-pointer transition-all duration-300 hover:bg-gray-900/80 hover:border-gray-700 transform hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up spotlight-card"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                onClick={() => {
                  navigate("/project", { state: { project } });
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 group-hover:bg-gray-700 transition-all duration-300">
                    <i className="ri-folder-line text-lg text-gray-300 group-hover:text-gray-200 group-hover:scale-110 transition-all duration-300"></i>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500 group-hover:text-gray-400 transition-colors duration-200">
                    <i className="ri-user-line text-xs"></i>
                    <span className="text-xs">{project.users.length}</span>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-100 mb-2 group-hover:text-white transition-colors duration-200">
                  {project.name}
                </h3>

                <p className="text-gray-500 text-sm mb-3 group-hover:text-gray-400 transition-colors duration-200">
                  AI-enhanced development environment
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-500 group-hover:text-green-400 transition-colors duration-200">
                      Active
                    </span>
                  </div>
                  <i className="ri-arrow-right-line text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1 transition-all duration-300"></i>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {projectPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setProjectPopup(false)}
          ></div>
          <div className="relative w-full max-w-md p-6 bg-gray-900/95 backdrop-blur-lg rounded-xl border border-gray-800 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                <i className="ri-add-line text-xl text-gray-300"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-100 mb-1">
                Create New Project
              </h2>
              <p className="text-gray-400 text-sm">
                Start building something amazing
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCreateProject}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  placeholder="Enter project name..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 font-medium hover:bg-gray-700 hover:border-gray-600 transition-colors duration-200"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors duration-200"
                  onClick={() => setProjectPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
