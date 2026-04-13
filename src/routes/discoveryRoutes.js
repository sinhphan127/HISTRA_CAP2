import express from "express";
import { getHomeData, getDestinations } from "../controllers/discoveryController.js";

const router = express.Router();

router.get("/home", getHomeData);
router.get("/destinations", getDestinations);

export default router;
