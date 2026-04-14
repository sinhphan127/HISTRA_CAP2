import express from "express";
import { generateTrip, saveTrip, getMyTrips } from "../controllers/tripController.js";
import { authMiddleware } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Tất cả các route liên quan đến Trip đều yêu cầu đăng nhập
router.use(authMiddleware);

router.post("/generate", generateTrip);
router.post("/", saveTrip);
router.get("/my-trips", getMyTrips);

export default router;
