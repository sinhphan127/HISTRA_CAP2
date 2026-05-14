import express from "express"; 
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import  authController  from "../controllers/authController.js"; 

const router = express.Router();

// Multer cho avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/avatars/"),
  filename: (req, file, cb) => cb(null, `avatar_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword
} from "../middlewares/validateAuth.js";

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/forgot-password", validateForgotPassword, authController.forgotPassword);
router.post("/verify-otp", validateVerifyOtp, authController.verifyOtp);
router.post("/verify-register-otp", validateVerifyOtp, authController.verifyRegisterOtp);
router.post("/resend-register-otp", validateForgotPassword, authController.resendRegisterOtp);
router.post("/reset-password", validateResetPassword, authController.resetPassword);
router.get("/me", authMiddleware, authController.getMe);
router.put("/profile", authMiddleware, authController.updateProfile);
router.get("/friends", authMiddleware, authController.getFriends);
router.post("/avatar", authMiddleware, upload.single("avatar"), authController.updateAvatar);

export default router;