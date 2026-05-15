import express from "express";
import {
    getAllFoods,
    getFoodById,
    getFoodsByCategory,
    getTopFoods,
} from "../controllers/foodController.js";

const router = express.Router();

router.get("/", getAllFoods);
router.get("/top", getTopFoods);
router.get("/category/:category", getFoodsByCategory);
router.get("/:id", getFoodById);

export default router;
