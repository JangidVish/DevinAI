import React, { useState, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import SyntaxHighlightedCode from "./SyntaxHighlightedCode";
import api from "../config/axios";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";
import "../styles/components/ChatPanel.css";

const ChatPanel = ({
  messages = [],
  isLoadingMessages,
  message,
  setMessage,
  send,
  user,
  getSenderDisplayName,
  messageBox,
  writeAiMessage,
  project,
  setCurrentFile,
  setFileTree,
  projectVersions = [],
  currentProjectVersion,
  onLoadProjectVersion,
  isLoadingVersions,
  forceRefresh,
}) => {
  // Function to find project version associated with a message
  const getMessageProjectVersion = (messageId) => {
    return projectVersions.find((version) => version.messageId === messageId);
  };

  const handleProjectVersionLoad = (projectVersion) => {
    if (onLoadProjectVersion) {
      onLoadProjectVersion(projectVersion);
    }
  };

  return (
    <div className="chat-panel">
      {/* Chat Header */}
      <div className="chat-panel__header">
        <div className="chat-panel__header-left">
          <div className="chat-panel__ai-avatar">
            <i className="ri-robot-line"></i>
          </div>
          <div className="chat-panel__ai-info">
            <h3 className="chat-panel__ai-title">AI Assistant</h3>
            <p className="chat-panel__ai-subtitle">Always ready to help</p>
          </div>
        </div>
        <div className="chat-panel__status">
          <div className="chat-panel__status-dot"></div>
          <span className="chat-panel__status-text">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      {isLoadingMessages ? (
        <div className="chat-panel__loading">
          <div className="chat-panel__loading-spinner"></div>
          <p className="chat-panel__loading-text">Loading conversation...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="chat-panel__empty-state">
          <div className="chat-panel__empty-icon">
            <i className="ri-chat-3-line"></i>
          </div>
          <p className="chat-panel__empty-title">Start a conversation</p>
          <p className="chat-panel__empty-subtitle">
            Ask me anything about your project or development needs
          </p>
        </div>
      ) : (
        <div ref={messageBox} className="chat-panel__messages">
          {messages.map((msg, index) => {
            if (!msg) return null;

            const isSenderAI =
              typeof msg?.sender === "object" && msg.sender !== null;
            const isCurrentUser = !isSenderAI && msg.sender === user?._id;
            const displayName = isSenderAI
              ? msg.sender?.name || "AI"
              : getSenderDisplayName
              ? getSenderDisplayName(msg.sender)
              : "User";

            // Get associated project version for AI messages
            const associatedVersion = isSenderAI
              ? getMessageProjectVersion(msg._id)
              : null;

            return (
              <div
                key={`message-${index}-${msg._id}`}
                className="chat-panel__message-container"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  } items-end gap-2`}
                >
                  {/* Avatar for AI messages */}
                  {!isCurrentUser && (
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <i className="ri-robot-line text-white text-xs"></i>
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${
                      isCurrentUser ? "items-end" : "items-start"
                    } max-w-[85%]`}
                  >
                    {/* Header with name and version */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium ${
                          isCurrentUser ? "text-indigo-300" : "text-slate-400"
                        }`}
                      >
                        {displayName}
                      </span>
                      {/* Show version button for AI messages with associated versions */}
                      {isSenderAI && associatedVersion && (
                        <button
                          onClick={() =>
                            handleProjectVersionLoad(associatedVersion)
                          }
                          className="inline-flex items-center px-2 py-1 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full transition-all duration-200 border border-purple-500/30 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                          title={`Load project version ${associatedVersion.version}`}
                        >
                          <i className="ri-git-branch-line mr-1"></i>v
                          {associatedVersion.version}
                        </button>
                      )}
                      <span className="text-xs text-slate-500">
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Now"}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl break-words overflow-hidden backdrop-blur-sm border transition-all duration-200 hover:scale-[1.02] ${
                        isSenderAI
                          ? "bg-slate-800/70 text-slate-100 border-slate-700/50 rounded-tl-md shadow-lg"
                          : isCurrentUser
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500/30 rounded-tr-md shadow-lg shadow-indigo-500/25"
                          : "bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white border-indigo-400/30 rounded-tr-md shadow-lg shadow-indigo-400/25"
                      }`}
                    >
                      <div className="relative z-10">
                        {isSenderAI
                          ? writeAiMessage
                            ? writeAiMessage(msg.message)
                            : msg.message
                          : msg.message}
                      </div>

                      {/* Subtle glow effect */}
                      <div
                        className={`absolute inset-0 rounded-2xl opacity-20 ${
                          isSenderAI
                            ? "bg-gradient-to-br from-slate-600 to-slate-800"
                            : "bg-gradient-to-br from-indigo-400 to-purple-500"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Avatar for user messages */}
                  {isCurrentUser && (
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <i className="ri-user-line text-white text-xs"></i>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="chat-panel__input-section">
        <div className="chat-panel__input-container">
          <div className="flex items-center gap-2 text-slate-400">
            <i className="ri-chat-3-line text-sm"></i>
          </div>
          <input
            type="text"
            value={message || ""}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-panel__input"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                send();
              }
            }}
          />
          <div className="flex items-center gap-2">
            <button
              className="p-1 text-slate-400 hover:text-slate-300 transition-colors"
              title="Attach file"
            >
              <i className="ri-attachment-2 text-sm"></i>
            </button>
            <button
              className="chat-panel__send-btn"
              onClick={send}
              disabled={!message?.trim()}
            >
              <i className="ri-send-plane-2-fill" />
            </button>
          </div>
        </div>

        {/* Typing indicator placeholder */}
        <div className="flex items-center gap-2 mt-2 px-3 opacity-0">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></div>
            <div
              className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span className="text-xs text-slate-500">AI is typing...</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
