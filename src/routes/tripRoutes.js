import express from "express";
import { 
  generateTrip, 
  saveTrip, 
  getMyTrips, 
  chatItinerary, 
  getActiveTrip, 
  startTrip, 
  markLocationVisited,
  completeTrip,
  getLocationHistoryAudio,
  getTripById
} from "../controllers/tripController.js";
import { authMiddleware } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Tất cả các route liên quan đến Trip đều yêu cầu đăng nhập
router.use(authMiddleware);

// Active trip tracking
router.get("/active", getActiveTrip);

router.post("/generate", generateTrip);
router.get("/location-history-audio", getLocationHistoryAudio);
router.post("/chat", chatItinerary);
router.post("/", saveTrip);
router.get("/my-trips", getMyTrips);
router.get("/:tripId", getTripById);

router.post("/:tripId/start", startTrip);
router.post("/:tripId/complete", completeTrip);
router.patch("/locations/:locationId/visit", markLocationVisited);

export default router;
