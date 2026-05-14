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
  getLocationHistoryAudio
} from "../controllers/tripController.js";
import { authMiddleware } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Tất cả các route liên quan đến Trip đều yêu cầu đăng nhập
router.use(authMiddleware);

router.post("/generate", generateTrip);
router.get("/location-history-audio", getLocationHistoryAudio);
router.post("/chat", chatItinerary);
router.post("/", saveTrip);
router.get("/my-trips", getMyTrips);

// Active trip tracking
router.get("/active", getActiveTrip);
router.post("/:tripId/start", startTrip);
router.post("/:tripId/complete", completeTrip);
router.patch("/locations/:locationId/visit", markLocationVisited);

export default router;
