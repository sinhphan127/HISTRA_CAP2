import express from "express";
import { createServer } from "http"; 
import { Server } from "socket.io";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import messengerRoutes from "./routes/messengerRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import discoveryRoutes from "./routes/discoveryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { initSocket } from "./socket.js";


dotenv.config();
const app = express();
const httpServer = createServer(app);

// Initialize centralized socket logic
const io = initSocket(httpServer);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes); 
app.use("/api/messenger", messengerRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/admin", adminRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  const message = err.message || "";
  const isTechnicalError =
    err.name === "PrismaClientKnownRequestError" ||
    err.name === "PrismaClientValidationError" ||
    err.name === "ReferenceError" ||
    err.name === "TypeError" ||
    /AxiosError|timeout of \d+ms|ECONNABORTED|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|Prisma|P\d{4}|Cannot read|Ollama API lỗi|Ollama Chat lỗi|Ollama History lỗi/i.test(message);

  const status = isTechnicalError ? 500 : (err.status || err.statusCode || 400);
  const publicMessage = status >= 500
    ? "Đã có lỗi xảy ra. Vui lòng thử lại sau."
    : (message || "Yêu cầu không hợp lệ");

  console.error("Error:", {
    message: message || err,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(status).json({
    success: false,
    message: publicMessage
  });
});

export { app, httpServer, io };
export default app;
