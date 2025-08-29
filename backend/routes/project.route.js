import Router from "express";
import {
  addUserToProjectController,
  createProjectController,
  deleteProjectController,
  getAllProjectsController,
  getMessagesController,
  getProjectsController,
  removeCollaborater,
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
route.delete("/delete-project/:projectId", deleteProjectController);
route.delete("/remove-collaborator", removeCollaborater);

export default route;
