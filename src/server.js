import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prismaClient.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log(`Database connected successfully!`);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};
startServer();