import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import connectDB from "./db/db.js"; // Import the database connection function
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import projectRoute from "./routes/project.route.js";
import aiRoute from "./routes/ai.routes.js";
import createRedisClient from "./services/redis.service.js";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import { authorisedUser } from "./middlewares/user.middeware.js";
import mongoose from "mongoose";
import projectModel from "./model/project.model.js";
import Message from "./model/message.model.js";
import { generateResult } from "./services/ai.service.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow cookies to be sent
  })
);
app.use("/user", userRoute);
app.use("/project", authorisedUser, projectRoute);
app.use("/ai", aiRoute);

app.use(morgan("dev")); // Logging middleware for development

const redisClient = createRedisClient();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    const projectId = socket.handshake.query?.projectId;
    // console.log(token);

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    socket.project = await projectModel.findById(projectId);

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.secret_key);

    if (!decoded) {
      return next(new Error("Authentication error"));
    }

    socket.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  // socket.roomId = socket.project._id.toString();

  console.log("a user connected");
  socket.roomId = socket.project._id.toString();
  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    const { message, sender } = data;

    const messageIncludesAi = message.includes("@ai");

    if (messageIncludesAi) {
      const prompt = message.replace("@ai", " ");
      const result = await generateResult(prompt);

      io.to(socket.roomId).emit("project-message", {
        message: result,
        sender: {
          _id: "ai",
          name: "AI",
        },
      });
    }

    // Save to MongoDB
    if (!messageIncludesAi) {
      await Message.create({
        projectId: socket.project._id,
        sender,
        message,
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
