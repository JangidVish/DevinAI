import Message from "../model/message.model.js";
import projectModel from "../model/project.model.js";
import User from "../model/user.model.js";
import {
  addUserToProject,
  createProject,
  getAllProjectsByUserId,
} from "../services/project.service.js";
import { validationResult } from "express-validator";

export const createProjectController = async (req, res) => {
  //   console.log(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // console.log("Creating project with data:", req.body);

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }
  try {
    if (await projectModel.exists({ name })) {
      return res.status(400).json({ error: "Project name already exists" });
    }

    const loggedInUser = await User.findOne({ email: req.user.email });
    const userId = loggedInUser._id;

    const project = createProject({
      name: name,
      userId: userId,
    });
    if (!project) {
      return res.status(400).json({ error: "Project creation failed" });
    }
    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProjectsController = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const project = await getAllProjectsByUserId(user);
    // console.log(project);
    if (!project || project.length === 0) {
      return res.status(404).json({ error: "No projects found for this user" });
    }
    return res.status(200).json({
      message: "Projects retrieved successfully",
      project,
    });
  } catch (error) {
    console.error("Error retrieving projects:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addUserToProjectController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { users, projectId } = req.body;
    if (!projectId) {
      return res
        .status(400)
        .json({ error: "Project ID and user IDs are required" });
    }
    if (!Array.isArray(users) || users.some((userId) => !userId)) {
      return res.status(400).json({ error: "Invalid user IDs provided" });
    }

    const loggedInUser = await User.findOne({ email: req.user.email });

    const project = await addUserToProject({
      projectId: projectId,
      users: users,
      userId: loggedInUser._id,
    });
    if (!project) {
      return res.status(400).json({ error: "Failed to add users to project" });
    }

    return res.status(200).json({
      message: "Users added to project successfully",
      project,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getProjectsController = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await projectModel
      .findById(projectId)
      .populate("users", "email username");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // console.log("Project Data at backend: ", project);

    // Check if logged-in user is in the project's users array
    const loggedInUser = await User.findOne({ email: req.user.email });
    const userId = loggedInUser?._id?.toString();
    const isUserInProject = project.users.some(
      (user) => user._id.toString() === userId
    );
    if (!isUserInProject) {
      return res
        .status(403)
        .json({ error: "Access denied: not a project member" });
    }
    return res.status(200).json({
      message: "Project retrieved successfully",
      project,
    });
  } catch (error) {
    console.error("Error retrieving project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessagesController = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const messages = await Message.find({ projectId: projectId }).sort({
      timestamp: 1,
    });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};
export const deleteProjectController = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Find project
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if logged-in user is a member of the project
    const loggedInUser = await User.findOne({ email: req.user.email });
    const userId = loggedInUser?._id?.toString();
    const isUserInProject = project.users.some(
      (user) => user.toString() === userId
    );
    if (!isUserInProject) {
      return res
        .status(403)
        .json({ error: "Access denied: not a project member" });
    }

    // Delete related messages
    await Message.deleteMany({ projectId: projectId });

    // Delete the project
    await projectModel.findByIdAndDelete(projectId);

    return res
      .status(200)
      .json({ message: "Project and related messages deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const removeCollaborater = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { userId, projectId } = req.body;
    if (!userId || !projectId) {
      return res
        .status(400)
        .json({ error: "User ID and Project ID are required" });
    }

    // Find project
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if logged-in user is a member of the project
    const loggedInUser = await User.findOne({ email: req.user.email });
    const userid = loggedInUser?._id?.toString();
    const isUserInProject = project.users.some(
      (user) => user.toString() === userid
    );
    if (!isUserInProject) {
      return res
        .status(403)
        .json({ error: "Access denied: not a project member" });
    }

    // Remove user from project
    project.users = project.users.filter((user) => user.toString() !== userId);
    await project.save();

    return res
      .status(200)
      .json({ message: "User removed from project successfully" });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
