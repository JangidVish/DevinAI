import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import connectDB from "./db/db.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import projectRoute from "./routes/project.route.js";
import aiRoute from "./routes/ai.routes.js";
import fileVersionRoute from "./routes/fileVersion.route.js";
import projectVersionRoute from "./routes/projectVersion.route.js";

import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import { authorisedUser } from "./middlewares/user.middeware.js";
import mongoose from "mongoose";
import projectModel from "./model/project.model.js";
import Message from "./model/message.model.js";
import { generateResult } from "./services/ai.service.js";
import {
  getresultaiController,
  getResultForSocket,
} from "./controllers/ai.controller.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ SIMPLE CORS CONFIGURATION
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.CLIENT_URL || "http://localhost:5173"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// ✅ DO NOT ADD app.options('*', cors()) - This was causing the error!

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Routes registration
app.use("/user", userRoute);
app.use("/ai", aiRoute);
app.use("/fileversion", authorisedUser, fileVersionRoute);
app.use("/project", authorisedUser, projectRoute);
app.use("/", projectVersionRoute);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.CLIENT_URL || "http://localhost:5173"
    ],
    credentials: true
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization
        ? socket.handshake.headers.authorization.split(" ")[1]
        : null);
    const projectId = socket.handshake.query?.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.log("Invalid projectId received:", projectId);
      return next(new Error("Invalid projectId"));
    }

    socket.project = await projectModel.findById(projectId);
    if (!socket.project) {
      console.log("Project not found for projectId:", projectId);
      return next(new Error("Project not found"));
    }

    if (!token) {
      console.log("No token received");
      return next(new Error("Authentication error"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.secret_key);
    } catch (err) {
      console.log("JWT verification failed:", err.message);
      return next(new Error("Authentication error"));
    }

    if (!decoded) {
      console.log("JWT verification returned null/undefined");
      return next(new Error("Authentication error"));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    console.log("Socket.IO middleware error:", error);
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();
  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    console.log("Received project-message:", data);
    const { message, sender } = data;

    const messageIncludesAi = message.includes("@ai");

    let savedMessage = null;
    if (!messageIncludesAi) {
      savedMessage = await Message.create({
        projectId: socket.project._id,
        sender,
        message,
      });
    }

    if (messageIncludesAi) {
      const prompt = message.replace("@ai", " ");

      const aiRequestMessage = await Message.create({
        projectId: socket.project._id,
        sender,
        message,
      });

      // Create AI response message first to get its ID
      const aiResponseMessage = await Message.create({
        projectId: socket.project._id,
        sender: {
          _id: "ai",
          name: "AI",
        },
        message: "Processing...", // Temporary message
      });

      // Now call AI with the response message ID
      const result = await getResultForSocket(
        prompt,
        socket.project._id.toString(),
        aiResponseMessage._id
      );

      // Update the AI response message with the actual result
      await Message.findByIdAndUpdate(aiResponseMessage._id, {
        message: result,
      });

      io.to(socket.roomId).emit("project-message", {
        ...aiResponseMessage.toObject(),
        message: result,
        messageId: aiResponseMessage._id,
        _id: aiResponseMessage._id,
      });
    }

    io.to(socket.roomId).emit("project-message", data);
  });

  socket.on("event", (data) => {
    /*..*/
  });
  socket.on("disconnect", (data) => {
    /*..*/
  });
});

app.get("/", (req, res) => {
  res.send("Hello, DevinAI Backend!");
});

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
