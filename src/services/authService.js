import prisma from "../config/prismaClient.js";
import crypto from "crypto";
import generateOTP from "../utils/generateOtp.js";
import { sendEmail } from "../utils/mailer.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { signToken } from "../utils/jwt.js";

const OTP_TTL_MINUTES = 10;

export async function register({ full_name, email, password, confirm_password, phone_number }) {
  if (!password || !confirm_password) throw new Error("Vui lòng nhập mật khẩu và xác nhận mật khẩu.");
  if (password !== confirm_password) throw new Error("Mật khẩu xác nhận không khớp.");

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { 
      fullName: full_name, 
      email: email, 
      password: hashed, 
      phoneNumber: phone_number || null, 
      roles: "user",
      status: "active"
    },
    select: { id: true, email: true, fullName: true, phoneNumber: true, createdAt: true },
  });
  return user;
}

export async function login({ email, password, provider, providerId, full_name, role_required }) {
  let user;
  if (provider === "google" || provider === "facebook") {
    user = await prisma.user.upsert({
      where: { email: email },
      update: { [`${provider}Id`]: providerId },
      create: {
        email,
        fullName: full_name, 
        [`${provider}Id`]: providerId,
        roles: "user",        
      },
    });
  } 
  else {
    user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Email hoặc mật khẩu không đúng");
    if (!user.password) throw new Error("Tài khoản này được tạo bằng mạng xã hội. Vui lòng đăng nhập bằng Google/Facebook.");
    
    const match = await comparePassword(password, user.password);
    if (!match) throw new Error("Email hoặc mật khẩu không đúng");
  }

  if (role_required === "admin" && user.roles !== "admin") {
    throw new Error("Bạn không có quyền truy cập vào trang quản trị");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.roles });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.roles
    }
  };
}

export async function forgotPassword ( email ) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Không tìm thấy người dùng với email này");

  const otp = generateOTP(6);
  const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: { 
      otp: String(otp), 
      otpExpiry: expiry 
    },
  });

  const subject = "Mã xác thực bảo mật (OTP) - Hành trình Khám phá Lịch sử";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4a373; border-radius: 12px; background-color: #fffcf2;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6b705c; margin: 0;">Chuyến hành trình đang chờ bạn</h2>
        <p style="color: #a98467; font-style: italic; margin-top: 5px;">Xác thực để bắt đầu khám phá những dấu ấn lịch sử</p>
      </div>
      <p style="font-size: 16px; color: #333;">Xin chào nhà lữ hành,</p>
      <div style="background-color: #ccd5ae; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; border: 1px dashed #6b705c;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b4332;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #555;">Mã hết hạn sau <b>${OTP_TTL_MINUTES} phút</b>.</p>
      <hr style="border: none; border-top: 1px solid #d4a373; margin: 30px 0;">
      <p style="text-align: center; font-size: 12px; color: #a98467;">© 2026 HISTRA Team.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html, text: `OTP: ${otp}` });
  return { message: "Mã OTP đã được gửi thành công" };
}

export async function verifyOtp({ email, otp }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.otp || !user.otpExpiry) throw new Error("Yêu cầu không hợp lệ");
  
  if (String(user.otp).trim() !== String(otp).trim()) throw new Error("Mã OTP không chính xác");
  if (new Date() > user.otpExpiry) throw new Error("Mã OTP đã hết hạn");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      otp: null,
      otpExpiry: null,
      resetToken: resetToken,
      resetTokenExpiry: resetTokenExpiry,
    },
  });

  return { resetToken };
}

export async function resetPassword({ email, resetToken, newPassword }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.resetToken !== resetToken) throw new Error("Token không hợp lệ");
  if (new Date() > user.resetTokenExpiry) throw new Error("Token đã hết hạn");

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: "Đặt lại mật khẩu thành công" };
}