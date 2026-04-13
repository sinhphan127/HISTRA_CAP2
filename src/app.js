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

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Setup socket events
io.on("connection", (socket) => {
  console.log("✅ New socket connection:", socket.id);
  
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

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


// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message || err);
  const status = err.status || 400;
  res.status(status).json({
    success: false,
    message: err.message || "Lỗi Server"
  });
});

export { app, httpServer, io };
export default app;