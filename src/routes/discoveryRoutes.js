import express from "express";
import { getHomeData, getDestinations, getMemories, getExplorePreview, getProvinces } from "../controllers/discoveryController.js";
import { authMiddleware } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/home", getHomeData);
router.get("/destinations", getDestinations);
router.get("/provinces", getProvinces);
router.get("/memories", authMiddleware, getMemories);
router.get("/explore-preview", getExplorePreview);

export default router;
