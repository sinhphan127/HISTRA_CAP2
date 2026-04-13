import express from "express";
import multer from "multer";
import path from "path";
import { getPosts, createPost, getPostDetail, toggleLike, addComment, getMyPosts, getSavedPosts, toggleSave } from "../controllers/postController.js";
import authMiddleware from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Cấu hình Multer cho bài viết
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `post_${Date.now()}_${Math.floor(Math.random() * 1000)}${path.extname(file.originalname)}`)
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|mp4|mov|avi/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Chỉ hỗ trợ định dạng ảnh (jpg, png, webp) và video (mp4, mov, avi)."));
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Giới hạn 50MB cho video
});

/**
 * Các route công khai
 */
router.get("/", getPosts);

/**
 * Các route yêu cầu đăng nhập cụ thể (đặt trước /:id để tránh trùng lặp)
 */
router.get("/me", authMiddleware, getMyPosts);
router.get("/saved", authMiddleware, getSavedPosts);

/**
 * Các route hỗ trợ cả khách và người dùng đã đăng nhập (Optional Auth)
 * Lưu ý: getPostDetail sẽ tự xử lý nếu user đã đăng nhập để hiện trạng thái like/save
 */
router.get("/:id", getPostDetail);

/**
 * Các route bắt buộc đăng nhập cho các hành động tương tác
 */
router.use(authMiddleware);
router.post("/", upload.array("files", 5), createPost);
router.post("/:id/like", toggleLike);
router.post("/:id/save", toggleSave);
router.post("/:id/comment", addComment);

export default router;
