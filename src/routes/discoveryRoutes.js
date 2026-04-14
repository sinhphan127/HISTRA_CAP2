import express from "express";
import { getHomeData, getDestinations, getMemories } from "../controllers/discoveryController.js";
import { authMiddleware } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/home", getHomeData);
router.get("/destinations", getDestinations);
router.get("/memories", authMiddleware, getMemories);

export default router;
