import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/pages/Landing.css";

const Landing = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  useEffect(() => {
    // Advanced mouse tracking with momentum and easing
    let mouseVelocity = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      const currentTime = Date.now();

      // Calculate velocity
      mouseVelocity.x = e.clientX - lastMousePos.x;
      mouseVelocity.y = e.clientY - lastMousePos.y;

      setMousePosition({ x: e.clientX, y: e.clientY });
      lastMousePos = { x: e.clientX, y: e.clientY };

      // Advanced CSS custom properties for complex effects
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
      document.documentElement.style.setProperty(
        "--mouse-velocity-x",
        `${mouseVelocity.x}`
      );
      document.documentElement.style.setProperty(
        "--mouse-velocity-y",
        `${mouseVelocity.y}`
      );

      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--hero-mask-x", `${x}%`);
      document.documentElement.style.setProperty("--hero-mask-y", `${y}%`);

      // Dynamic background distortion
      const distortionX = (x - 50) * 0.1;
      const distortionY = (y - 50) * 0.1;
      document.documentElement.style.setProperty(
        "--bg-distort-x",
        `${distortionX}%`
      );
      document.documentElement.style.setProperty(
        "--bg-distort-y",
        `${distortionY}%`
      );
    };

    // Advanced parallax with physics-based scrolling
    let scrollVelocity = 0;
    let lastScrollTop = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          scrollVelocity = scrolled - lastScrollTop;
          lastScrollTop = scrolled;

          // Multi-layer parallax with different speeds and physics
          const parallaxElements = document.querySelectorAll(".parallax-layer");
          parallaxElements.forEach((element, index) => {
            const layer = index + 1;
            const speed = 0.1 + layer * 0.15;
            const resistance = 0.8 + layer * 0.1;
            const yPos = -(scrolled * speed * resistance);
            const rotation = scrollVelocity * 0.01;

            element.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
          });

          // Advanced scroll progress with easing
          const maxScroll = document.body.scrollHeight - window.innerHeight;
          const scrollProgress = Math.min(scrolled / maxScroll, 1);
          const easedProgress = 1 - Math.pow(1 - scrollProgress, 3); // Cubic easing

          document.documentElement.style.setProperty(
            "--scroll-progress",
            easedProgress
          );
          document.documentElement.style.setProperty(
            "--scroll-velocity",
            Math.abs(scrollVelocity)
          );

          // Navigation state management
          const nav = document.querySelector(".landing-page__nav");
          if (scrolled > 100) {
            nav?.classList.add("nav-scrolled");
          } else {
            nav?.classList.remove("nav-scrolled");
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Enhanced Intersection Observer with advanced trigger points
    const observerOptions = {
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      rootMargin: "0px 0px -5% 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        const progress = entry.intersectionRatio;
        const element = entry.target;

        if (entry.isIntersecting) {
          // Staggered cascade animation
          const delay = index * 150;

          setTimeout(() => {
            element.classList.add("animate-in");

            // Add progressive enhancement based on element type
            if (element.classList.contains("tech-card")) {
              element.style.setProperty("--reveal-progress", progress);
              element.classList.add("tech-reveal");
            }

            if (element.classList.contains("code-matrix")) {
              element.classList.add("matrix-active");
            }
          }, delay);
        }

        // Continuous progress tracking for scroll-driven animations
        element.style.setProperty("--intersection-progress", progress);
      });
    }, observerOptions);

    // Observe all animated sections with enhanced selectors
    const sections = document.querySelectorAll(
      ".tech-reveal, .cascade-in, .matrix-effect, .glitch-text, .cyber-card, .neural-network"
    );
    sections.forEach((section) => observer.observe(section));

    // Initialize hero sequence with complex timing
    const heroSequence = () => {
      const heroElements = document.querySelectorAll(".hero-sequence");
      heroElements.forEach((element, index) => {
        const delay = index * 300 + 500; // Extended delays for dramatic effect
        setTimeout(() => {
          element.classList.add("sequence-active");
        }, delay);
      });
    };

    // Matrix digital rain effect initialization
    const initMatrixRain = () => {
      const canvas = document.createElement("canvas");
      canvas.className = "matrix-rain";
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "1";
      canvas.style.opacity = "0.1";

      document.body.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const chars =
        "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
      const matrix = chars.split("");
      const drops = [];

      for (let x = 0; x < canvas.width / 20; x++) {
        drops[x] = 1;
      }

      const draw = () => {
        ctx.fillStyle = "rgba(3, 7, 18, 0.04)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00ff88";
        ctx.font = "15px monospace";

        for (let i = 0; i < drops.length; i++) {
          const text = matrix[Math.floor(Math.random() * matrix.length)];
          ctx.fillText(text, i * 20, drops[i] * 20);

          if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      };

      setInterval(draw, 35);
    };

    // Delayed initialization for performance
    setTimeout(heroSequence, 100);
    setTimeout(initMatrixRain, 2000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      sections.forEach((section) => observer.unobserve(section));

      // Cleanup matrix canvas
      const matrixCanvas = document.querySelector(".matrix-rain");
      if (matrixCanvas) {
        matrixCanvas.remove();
      }
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Subtle Cursor Tracking for Reveals */}
      <div className="landing-page__cursor-overlay"></div>

      {/* Enhanced Background with IDE Elements */}
      <div className="landing-page__background">
        {/* Base gradient */}
        <div className="landing-page__base-gradient"></div>

        {/* Cloud Effect */}
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

        {/* Interactive Code Elements */}
        <div className="group absolute top-16 left-20 w-80 h-48 pointer-events-auto">
          <div className="code-reveal bg-gray-900/20 rounded-lg border border-gray-800/30 p-3 backdrop-blur-sm h-full w-full">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/30">
              <div className="w-3 h-3 bg-red-500/70 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500/70 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500/70 rounded-full"></div>
              <span className="text-xs text-gray-500 ml-2 font-mono">
                DevMate.jsx
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
                <span className="text-blue-400">AI</span>{" "}
                <span className="text-purple-400">from</span>{" "}
                <span className="text-green-400">'@devmate/ai'</span>;
              </div>
              <div className="text-gray-600 mt-2">
                <span className="text-purple-400">export default function</span>{" "}
                <span className="text-yellow-400">DevMate</span>
                <span className="text-gray-400">() {"{"}</span>
              </div>
              <div className="text-gray-600 ml-4">
                <span className="text-purple-400">const</span> [
                <span className="text-blue-400">code</span>,{" "}
                <span className="text-blue-400">setCode</span>] ={" "}
                <span className="text-yellow-400">AI.generate</span>(
                <span className="text-green-400">'landing page'</span>);
              </div>
              <div className="text-gray-600 ml-4">
                <span className="text-purple-400">return</span>{" "}
                <span className="text-gray-400">&lt;</span>
                <span className="text-red-400">LandingPage</span>
                <span className="text-gray-400">/&gt;</span>;
              </div>
              <div className="text-gray-600">
                <span className="text-gray-400">{"}"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="group absolute top-1/2 right-24 w-72 h-40 pointer-events-auto">
          <div className="code-reveal bg-black/40 rounded-lg border border-gray-700/30 p-3 backdrop-blur-sm w-full h-full">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-600/30">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <span className="text-xs text-gray-400 font-mono">Terminal</span>
            </div>
            <div className="font-mono text-xs space-y-1">
              <div className="text-green-400">$ npm create devmate-app</div>
              <div className="text-gray-500">
                ✓ Creating DevMate AI project...
              </div>
              <div className="text-green-400">$ cd my-ai-app</div>
              <div className="text-blue-400">🚀 DevMate AI initialized!</div>
              <div className="text-yellow-400">
                ⚡ Real-time collaboration ready
              </div>
              <div className="text-purple-400">🤖 AI assistant activated</div>
              <div className="text-green-400 animate-pulse">$ _</div>
            </div>
          </div>
        </div>

        {/* Config File Preview */}
        <div className="group absolute bottom-32 left-32 w-64 h-36 pointer-events-auto">
          <div className="code-reveal bg-gray-900/30 rounded-lg border border-gray-800/30 p-3 backdrop-blur-sm w-full h-full">
            <div className="text-xs text-gray-400 mb-2 font-mono">
              devmate.config.js
            </div>
            <div className="font-mono text-xs space-y-1">
              <div className="text-gray-600">export default {"{"}</div>
              <div className="text-gray-600 ml-2">
                <span className="text-blue-400">"ai"</span>:{" "}
                <span className="text-green-400">"advanced"</span>,
              </div>
              <div className="text-gray-600 ml-2">
                <span className="text-blue-400">"collaboration"</span>:{" "}
                <span className="text-green-400">true</span>,
              </div>
              <div className="text-gray-600 ml-2">
                <span className="text-blue-400">"deployment"</span>:{" "}
                <span className="text-green-400">"instant"</span>
              </div>
              <div className="text-gray-600">{"}"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="landing-page__nav">
        <div className="landing-page__nav-brand">
          <div className="landing-page__nav-icon">
            <i className="ri-code-s-slash-fill"></i>
          </div>
          <span className="landing-page__nav-title">DevMate AI</span>
        </div>

        <div className="landing-page__nav-actions">
          <Link to="/login" className="landing-page__nav-link">
            Sign In
          </Link>
          <Link to="/signup" className="landing-page__nav-cta">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="landing-page__hero">
        <div className="landing-page__hero-content">
          {/* Main Heading */}
          <h1 className="landing-page__hero-title">
            <span className="landing-page__hero-title-main">Code with</span>
            <br />
            <span className="landing-page__hero-title-accent">AI Power</span>
          </h1>

          {/* Subtitle */}
          <p className="landing-page__hero-subtitle">
            Experience the future of collaborative development with DevMate AI.
            Build, debug, and deploy projects faster than ever with intelligent
            AI assistance and real-time collaboration.
          </p>

          {/* CTA Buttons */}
          <div className="landing-page__hero-actions">
            <Link to="/signup" className="landing-page__hero-cta-primary">
              Start Building Free
              <i className="ri-arrow-right-line"></i>
            </Link>
            {/*<button
              onClick={() => {
                document
                  .getElementById("features")
                  .scrollIntoView({ behavior: "smooth" });
              }}
              className="landing-page__hero-cta-secondary"
            >
              Watch Demo
              <i className="ri-play-fill"></i>
            </button>*/}
          </div>

          {/* Feature Cards */}
          <div id="features" className="landing-page__features">
            <div className="landing-page__feature-card spotlight-card group">
              <div className="landing-page__feature-icon landing-page__feature-icon--ai">
                <i className="ri-brain-fill"></i>
              </div>
              <h3 className="landing-page__feature-title">AI-Powered Coding</h3>
              <p className="landing-page__feature-description">
                Let AI write, debug, and optimize your code. Focus on creativity
                while we handle the complexity with advanced neural networks.
              </p>
            </div>

            <div className="landing-page__feature-card spotlight-card group">
              <div className="landing-page__feature-icon landing-page__feature-icon--team">
                <i className="ri-team-fill"></i>
              </div>
              <h3 className="landing-page__feature-title">
                Real-time Collaboration
              </h3>
              <p className="landing-page__feature-description">
                Work seamlessly with your team. Share projects, collaborate in
                real-time, and build together with live code synchronization.
              </p>
            </div>

            <div className="landing-page__feature-card spotlight-card group">
              <div className="landing-page__feature-icon landing-page__feature-icon--deploy">
                <i className="ri-rocket-fill"></i>
              </div>
              <h3 className="landing-page__feature-title">
                Instant Deployment
              </h3>
              <p className="landing-page__feature-description">
                Deploy your projects instantly with our integrated cloud
                platform. From code to production in seconds with zero config.
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
                              <p className="text-gray-300 mb-6 leading-relaxed">
                "DevMate AI has revolutionized how I code. The AI suggestions are incredibly accurate and save me hours every day."
              </p>
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
            <Link to="/signup" className="landing-page__hero-cta-primary">
              Start Your Journey
              <i className="ri-arrow-right-line"></i>
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
