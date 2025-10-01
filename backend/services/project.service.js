import mongoose from "mongoose";
import projectModel from "../model/project.model.js";

export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Project name is required");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const project = new projectModel({
      name,
      users: [userId],
    });
    await project.save();
    return project;
  } catch (error) {
    throw new Error("Error creating project: " + error.message);
  }
};

export const getAllProjectsByUserId = async (user) => {
  if (!user || !user._id) {
    throw new Error("User ID is required");
  }

  try {
    const projects = await projectModel
      .find({
        users: { $elemMatch: { $eq: user._id } },
      })
      .populate("users", "email");
    return projects;
  } catch (error) {
    throw new Error("Error retrieving projects: " + error.message);
  }
};

export const addUserToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("Project ID are required");
  }
  if (!users || users.length === 0) {
    throw new Error("Users array cannot be empty");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const project = await projectModel.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (
      !Array.isArray(users) ||
      users.some((userId) => !mongoose.isValidObjectId(userId))
    ) {
      throw new Error("Invalid user IDs provided");
    }

    // Check if the requesting user has permission to add users to this project
    const hasPermission = project.users.some(user => user.toString() === userId.toString());

    if (!hasPermission) {
      console.log(`Permission check failed - Project ID: ${projectId}, User ID: ${userId}`);
      console.log(`Project users:`, project.users.map(u => u.toString()));
      console.log(`Requesting user ID:`, userId.toString());
      throw new Error("You don't have permission to add users to this project");
    }

    const updatedProject = await projectModel.findOneAndUpdate(
      { _id: projectId },
      { $addToSet: { users: { $each: users } } },
      { new: true }
    );
    if (!updatedProject) {
      throw new Error("Failed to add users to project");
    }
    return updatedProject;
  } catch (error) {
    throw new Error("Error adding user to project: " + error.message);
  }
};
