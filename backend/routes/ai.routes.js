import { Router } from "express";
import { getresultaiController } from "../controllers/ai.controller.js";

const route = Router();

route.get("/getresult", getresultaiController);

export default route;
