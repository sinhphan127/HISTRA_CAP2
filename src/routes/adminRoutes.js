import express from "express";
import authMiddleware, { restrictToAdmin } from "../middlewares/authMiddlewares.js";
import {
  getStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getPosts,
  deletePost,
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getReports,
  resolveReport,
  getFoods,
  createFood,
  updateFood,
  deleteFood,
} from "../controllers/adminController.js";

const router = express.Router();

// Bảo vệ tất cả routes bởi auth + admin role
router.use(authMiddleware, restrictToAdmin);

// Stats
router.get("/stats", getStats);

// User management
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

// Post management
router.get("/posts", getPosts);
router.delete("/posts/:id", deletePost);

// Destination management
router.get("/destinations", getDestinations);
router.post("/destinations", createDestination);
router.put("/destinations/:id", updateDestination);
router.delete("/destinations/:id", deleteDestination);

// Report management
router.get("/reports", getReports);
router.patch("/reports/:id/resolve", resolveReport);

// Food management
router.get("/foods", getFoods);
router.post("/foods", createFood);
router.put("/foods/:id", updateFood);
router.delete("/foods/:id", deleteFood);

export default router;
