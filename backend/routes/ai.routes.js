import { Router } from "express";
import { getresultaiController } from "../controllers/ai.controller.js";

const route = Router();

route.post("/getresult", getresultaiController);

export default route;
