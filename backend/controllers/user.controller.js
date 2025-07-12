import { validationResult } from "express-validator";
import userModel from "../model/user.model.js";
import { createUser, loginUser } from "../services/user.service.js";
import createRedisClient from "../services/redis.service.js";
import projectModel from "../model/project.model.js";
import mongoose from "mongoose";

export const createUserController = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  try {
    const user = await createUser(req.body);
    delete user.password; // Remove password from response
    const token = await user.generateJWT();
    return res.status(200).json({ token: token, user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const loginController = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  try {
    const user = await loginUser(req.body);
    const token = await user.generateJWT();
    delete user.password; // Remove password from response
    return res.status(200).json({ token: token, user: user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    const redisClient = createRedisClient();
    redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    res.status(200).json({ message: "User logout successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUserController = async (req, res) => {
  const projectId = req.params.id;

  try {
    // if (!mongoose.isValidObjectId(projectId)) {
    //   return res.status(400).json({ error: "Invalid project ID" });
    // }

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const users = await userModel
      .find({
        email: { $ne: req.user.email }, // exclude current user
        _id: { $nin: project.users }, // exclude already in project
      })
      .select("-password -__v");

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No available users found" });
    }

    return res.status(200).json({ users });
  } catch (error) {
    console.error("getAllUserController Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const profileController = async (req, res) => {
  return res.status(200).json(req.user);
};
