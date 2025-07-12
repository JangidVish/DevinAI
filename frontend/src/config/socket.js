import socket from "socket.io-client";

var socketInstance = null;

export const initializeSocket = (projectId) => {
  socketInstance = socket(
    import.meta.env.VITE_API_URL || "http://localhost:3001",
    {
      auth: {
        token: localStorage.getItem("token"),
      },
      query: {
        projectId,
      },
    }
  );

  return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
  socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  socketInstance.emit(eventName, data);
};
