import express from "express";
import multer from "multer";
import path from "path";
import { createStory, getStories, deleteStory } from "../controllers/storyController.js";
import authMiddleware from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Cấu hình Multer cho Stories
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'story-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post("/", authMiddleware, upload.single("image"), createStory);
router.get("/", authMiddleware, getStories);
router.delete("/:id", authMiddleware, deleteStory);

export default router;
