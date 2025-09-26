import Router from "express";
import {
  addUserToProjectController,
  createProjectController,
  deleteProjectController,
  getAllProjectsController,
  getMessagesController,
  getProjectsController,
  removeCollaborater,
  // cleanupOrphanedDataController, // Remove this line for now
} from "../controllers/project.controller.js";
import { body } from "express-validator";

const route = Router();

route.post(
  "/create",
  body("name").isString().withMessage("Project name must be a required"),
  createProjectController
);

route.get("/all", getAllProjectsController);

route.post(
  "/addUser",
  body("projectId").isString().withMessage("Project ID must be a required"),
  body("users")
    .isArray()
    .withMessage("Users must be a non-empty array")
    .notEmpty()
    .withMessage("Users array cannot be empty"),
  addUserToProjectController
);

route.get("/get-project/:projectId", getProjectsController);
route.get("/:projectId/messages", getMessagesController);

// ✅ Updated delete route with cascade delete
route.delete("/delete-project/:projectId", deleteProjectController);
route.delete("/remove-collaborator", removeCollaborater);

// ✅ Remove cleanup route for now - we'll add it later
// route.delete("/cleanup-orphaned-data", cleanupOrphanedDataController);

export default route;
