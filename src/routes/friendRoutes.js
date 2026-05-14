import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import friendController from "../controllers/friendController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/request", friendController.sendRequest);
router.post("/accept/:requestId", friendController.acceptRequest);
router.post("/reject/:requestId", friendController.rejectRequest);
router.delete("/unfriend/:friendshipId", friendController.unfriend);
router.get("/pending", friendController.getPending);
router.get("/list", friendController.getFriends);
router.get("/profile/:userId", friendController.getTravelerProfile);

export default router;
