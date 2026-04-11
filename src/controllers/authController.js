import * as authService from '../services/authService.js';
import { validatePassword } from '../utils/passwordPolicy.js';
import prisma from "../config/prismaClient.js";
import validator from "validator";

const authController = {
  register: async (req, res, next) => {
    try {
      const { full_name, email, phone_number, password, confirm_password } = req.body;
      const user = await authService.register({ full_name, email, phone_number, password, confirm_password });
      res.status(201).json({ success: true, message: "Đăng ký thành công!", data: user });
    } catch (err) {
      if (err.code === "P2002") return res.status(409).json({ success: false, message: "Email đã tồn tại" });
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, loginIdentifier, password } = req.body;
      const userEmail = email || loginIdentifier;
      
      if (!userEmail) {
        return res.status(400).json({ success: false, message: "Email hoặc mã đăng nhập là bắt buộc" });
      }

      const result = await authService.login({ email: userEmail, password });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

 verifyOtp: async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp({ email, otp }); 
    res.status(200).json({ 
      success: true, 
      ...result 
    });
  } catch (err) {
    next(err);
  }
},

resetPassword: async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body; 
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin: email, resetToken hoặc mật khẩu mới." });
    }
    const result = await authService.resetPassword({ 
      email, 
      resetToken, 
      newPassword 
    });

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
},
  getMe: async (req, res, next) => {
    try {
      res.status(200).json({ success: true, data: req.user });
    } catch (err) {
      next(err);
    }
  }
};

export default authController;