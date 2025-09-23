import React, { useState, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import SyntaxHighlightedCode from "./SyntaxHighlightedCode";
import api from "../config/axios";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";

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
    <div className="conversation-area flex-grow flex flex-col p-2 max-w-100">
      {/* Chat Messages */}
      {isLoadingMessages ? (
        <div className="flex justify-center items-center h-full text-white">
          Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="flex justify-center items-center h-full text-white">
          No messages yet.
        </div>
      ) : (
        <div
          ref={messageBox}
          className="message-box flex-grow flex flex-col gap-2 overflow-y-auto px-2"
          style={{ maxHeight: "calc(100vh - 150px)" }}
        >
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
                className="flex flex-col gap-2"
              >
                <div
                  className={`chat ${
                    isCurrentUser ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="chat-header flex items-center gap-2">
                    {displayName}
                    {/* Show version button for AI messages with associated versions */}
                    {isSenderAI && associatedVersion && (
                      <button
                        onClick={() =>
                          handleProjectVersionLoad(associatedVersion)
                        }
                        className="inline-flex items-center px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 border border-purple-500"
                        title={`Load project version ${associatedVersion.version}`}
                      >
                        <i className="ri-git-branch-line mr-1"></i>v
                        {associatedVersion.version}
                      </button>
                    )}
                  </div>
                  <div
                    className={`chat-bubble max-w-[90%] ${
                      isSenderAI
                        ? "bg-slate-900 text-white"
                        : isCurrentUser
                        ? "bg-indigo-400"
                        : "bg-indigo-400/70"
                    }`}
                  >
                    {isSenderAI
                      ? writeAiMessage
                        ? writeAiMessage(msg.message)
                        : msg.message
                      : msg.message}
                  </div>
                  <div className="chat-footer opacity-50 text-xs">
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString()
                      : "Sent"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="inputField flex justify-between p-2 border border-indigo-400 rounded-lg">
        <input
          type="text"
          value={message || ""}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message"
          className="focus:outline-none flex-grow bg-transparent text-white"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              send();
            }
          }}
        />
        <button
          className="p-2 ml-2 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors"
          onClick={send}
        >
          <i className="ri-send-plane-2-fill" />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
