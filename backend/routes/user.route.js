import { Router } from "express";
import {
  createUserController,
  getAllUserController,
  loginController,
  logoutController,
  profileController,
} from "../controllers/user.controller.js";
import { body } from "express-validator";
import { authorisedUser } from "../middlewares/user.middeware.js";

const route = Router();

route.post(
  "/register",
  body("email").isEmail().withMessage("Email must be valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be atleast 3 digit"),
  createUserController
);
route.post(
  "/login",
  body("email").isEmail().withMessage("Email must be valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be atleast 3 digit"),
  loginController
);

route.get("/all/:id", authorisedUser, getAllUserController);

route.get("/profile", authorisedUser, profileController);

route.get("/logout", logoutController);
export default route;
