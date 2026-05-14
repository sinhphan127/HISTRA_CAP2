import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("[MAILER] Lỗi: Chưa cấu hình EMAIL_USER hoặc EMAIL_PASS trong file .env");
  console.log("[MAILER] Đã thử load file .env tại:", path.resolve(__dirname, "../../.env"));
  console.log("[MAILER] Giá trị hiện tại - USER:", process.env.EMAIL_USER, "| PASS:", process.env.EMAIL_PASS ? "******" : "Missing");
}

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log(`[MAILER] Đang gửi email tới: ${to}`);
    
    const info = await transporter.sendMail({
      from: `"Histra" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || "Vui lòng xem trên trình duyệt hỗ trợ HTML",
      html, 
    });
    console.log(`[MAILER] Gửi thành công! ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[MAILER] Lỗi gửi mail:`, error.message);
    throw error; 
  }
};