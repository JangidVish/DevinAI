import React from "react";
import Markdown from "markdown-to-jsx";
import SyntaxHighlightedCode from "./SyntaxHighlightedCode";

const ChatPanel = ({
  messages,
  isLoadingMessages,
  message,
  setMessage,
  send,
  user,
  getSenderDisplayName,
  messageBox,
  writeAiMessage,
}) => (
  <div className="conversation-area flex-grow flex flex-col p-2 max-w-100">
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
);

export default ChatPanel;