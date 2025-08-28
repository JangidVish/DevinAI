import socket from "socket.io-client";

let socketInstance = null;

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
  // console.log("Receiving message via socket: ", eventName);
  socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  // console.log("Sending message via socket: ", data);
  socketInstance.emit(eventName, data);
};
