import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", notificationController.getNotifications);
router.patch("/all-read", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
