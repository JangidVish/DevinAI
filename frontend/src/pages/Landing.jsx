import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll(".fade-in-section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-slate-900 to-purple-950 text-white overflow-x-hidden overflow-y-auto">
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 lg:px-12 w-full">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center">
            <i className="ri-code-s-slash-fill text-xl text-white"></i>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
            DevMate AI
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-gray-200 hover:text-black transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 bg-gradient-to-r from-black-800 to-purple-950 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-semibold text-black transition-all duration-200 transform hover:scale-105"
            style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-slate-700 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pb-20 w-full">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-indigo-200 bg-clip-text text-transparent">
              Code with
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent">
              AI Power
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of collaborative development with DevMate AI.
            Build, debug, and deploy projects faster than ever with intelligent
            AI assistance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-indigo-950 to-purple-800 hover:from-indigo-800 hover:to-purple-700 rounded-xl font-semibold text-lg text-black hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-indigo-500/25"
              style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
            >
              Start Building Free
              <i className="ri-arrow-right-line ml-2"></i>
            </Link>
            <button
              onClick={() => {
                // Scroll to features section or open a demo modal
                document
                  .getElementById("features")
                  .scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 border-2 border-indigo-500 hover:border-indigo-400 rounded-xl font-semibold text-lg text-white transition-all duration-300 hover:bg-indigo-500/10"
            >
              Watch Demo
              <i className="ri-play-fill ml-2"></i>
            </button>
          </div>

          {/* Feature Cards */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="ri-brain-fill text-2xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                AI-Powered Coding
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Let AI write, debug, and optimize your code. Focus on creativity
                while we handle the complexity.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="ri-team-fill text-2xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Real-time Collaboration
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Work seamlessly with your team. Share projects, collaborate in
                real-time, and build together.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="ri-rocket-fill text-2xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Instant Deployment
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Deploy your projects instantly with our integrated cloud
                platform. From code to production in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Unique Features Section - The X Factor */}
        <div className="mt-32 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Experience the Future of Coding
          </h2>
          <p className="text-xl text-gray-200 mb-16 max-w-3xl mx-auto">
            Revolutionary features that make DevMate AI more than just another
            AI assistant
          </p>

          {/* Interactive Demo Cards */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Live Code Collaboration */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-indigo-500/50 transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Live Code Sync
                  </h3>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-2 animate-pulse"></span>
                    Live
                  </div>
                </div>
                <div className="bg-black/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="ml-4 text-sm text-gray-400">
                      collaborative-app.jsx
                    </span>
                  </div>
                  <div className="text-left font-mono text-sm">
                    <div className="text-purple-400">const</div>
                    <div className="text-white ml-2 typing-animation">
                      <span className="text-blue-400">liveSync</span> =
                      <span className="text-green-400"> () =&gt;</span> &#123;
                    </div>
                    <div className="text-gray-400 ml-4">
                      // Multiple devs coding together ✨
                    </div>
                    <div className="text-white ml-2">&#125;</div>
                  </div>
                </div>
                <p className="text-gray-300 text-left">
                  See your team's code changes in real-time. No more merge
                  conflicts, no more waiting.
                </p>
              </div>
            </div>

            {/* AI Context Understanding */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Context-Aware AI
                  </h3>
                  <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-purple-400 rounded-full inline-block mr-2 animate-pulse"></span>
                    Smart
                  </div>
                </div>
                <div className="bg-black/50 rounded-xl p-4 mb-4">
                  <div className="text-left text-sm">
                    <div className="flex items-center mb-2">
                      <i className="ri-brain-fill text-purple-400 mr-2"></i>
                      <span className="text-gray-300">
                        AI analyzing your entire codebase...
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <div className="text-green-400 text-xs">
                      ✓ Understanding project structure
                    </div>
                    <div className="text-green-400 text-xs">
                      ✓ Learning your coding patterns
                    </div>
                    <div className="text-yellow-400 text-xs">
                      ⚡ Generating contextual suggestions
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-left">
                  Our AI doesn't just complete code—it understands your entire
                  project context.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Preview Animation - Fixed Position */}
        <div
          className="fixed bottom-20 right-10 hidden lg:block pointer-events-none opacity-120"
          style={{ zIndex: -20 }}
        >
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4 w-80">
            <div className="flex items-center mb-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-red-500/60 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500/60 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500/60 rounded-full"></div>
              </div>
              <span className="ml-4 text-xs text-gray-500">app.jsx</span>
            </div>
            <div className="text-xs font-mono">
              <div className="text-purple-400/60">const</div>
              <div className="text-white/60 ml-2">
                <span className="text-blue-400/60">generateAI</span> =
                <span className="text-green-400/60"> async</span> () =&gt;
                &#123;
              </div>
              <div className="text-gray-400/60 ml-4">
                // AI magic happens here ✨
              </div>
              <div className="text-white/60 ml-2">&#125;</div>
            </div>
          </div>
        </div>

        {/* Background Tech Icons - Fixed position, behind all content */}
        <div
          className="fixed top-20 left-8 hidden lg:block pointer-events-none opacity-20"
          style={{ zIndex: -10 }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-full flex items-center justify-center border border-indigo-500/10">
            <i className="ri-javascript-fill text-lg text-yellow-400/40"></i>
          </div>
        </div>

        <div
          className="fixed top-32 right-16 hidden lg:block pointer-events-none opacity-20"
          style={{ zIndex: -10 }}
        >
          <div className="w-14 h-14 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-full flex items-center justify-center border border-blue-500/10">
            <i className="ri-reactjs-fill text-base text-blue-400/40"></i>
          </div>
        </div>

        <div
          className="fixed bottom-32 left-16 hidden lg:block pointer-events-none opacity-20"
          style={{ zIndex: -10 }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 rounded-full flex items-center justify-center border border-purple-500/10">
            <i className="ri-nodejs-fill text-lg text-green-400/40"></i>
          </div>
        </div>

        {/* Statistics Section - Commented out for development phase 
        <div className="mt-32 text-center">
          <h2 className="text-4xl font-bold mb-16 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Trusted by Developers Worldwide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                10K+
              </div>
              <p className="text-gray-300 mt-2">Active Users</p>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                50K+
              </div>
              <p className="text-gray-300 mt-2">Projects Created</p>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                99.9%
              </div>
              <p className="text-gray-300 mt-2">Uptime</p>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <p className="text-gray-300 mt-2">AI Support</p>
            </div>
          </div>
        </div>

        {/* Testimonials - Commented out for development phase 
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            What Developers Say
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/50 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white">Sarah Chen</h4>
                  <p className="text-gray-300 text-sm">Full Stack Developer</p>
                </div>
              </div>
              <p className="text-gray-200 italic">
                "DevinAI has revolutionized how I code. The AI suggestions are incredibly accurate and save me hours every day."
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/50 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white">Marcus Johnson</h4>
                  <p className="text-gray-300 text-sm">Startup Founder</p>
                </div>
              </div>
              <p className="text-gray-200 italic">
                "The collaborative features are game-changing. My team can work together seamlessly on complex projects."
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/50 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white">Alex Rivera</h4>
                  <p className="text-gray-300 text-sm">Senior Engineer</p>
                </div>
              </div>
              <p className="text-gray-200 italic">
                "From prototype to production in minutes. DevinAI's deployment features are absolutely incredible."
              </p>
            </div>
          </div>
        </div>
        */}

        {/* Final CTA Section */}
        <div className="mt-32 text-center bg-gradient-to-r from-slate-900/70 to-indigo-900/50 rounded-3xl p-12 border border-slate-700/30">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Ready to Transform Your Development?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are building the future with
            AI-powered coding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="px-12 py-5 bg-gradient-to-r from-gray-800 to-gray-700to-purple-800
                hover:from-indigo-950 hover:to-purple-700 rounded-lg font-semibold text-lg text-white transition-transform duration-300 transform hover:scale-105 hover:shadow-lg shadow-gray-900/50"
              style={{ textShadow: "0 2px 6px rgba(0, 0, 0, 0.8)" }}
            >
              Start Your Journey
              <i className="ri-arrow-right-line ml-3"></i>
            </Link>

            <Link
              to="/login"
              className="px-10 py-4 text-indigo-300 hover:text-white transition-colors duration-200 font-semibold text-xl"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-400 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center">
                <i className="ri-code-s-slash-fill text-white"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                DevMate AI
              </span>
            </div>
            <p>&copy; 2025 DevMate AI. Empowering developers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
