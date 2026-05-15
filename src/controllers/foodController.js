import prisma from "../config/prismaClient.js";

/**
 * Lấy tất cả foods
 */
export const getAllFoods = async (req, res, next) => {
    try {
        const {
            keyword,
            category,
            destinationId,
            minRating,
            limit = 50,
            skip = 0,
        } = req.query;

        const where = {};

        if (keyword) {
            where.OR = [
                { name: { contains: keyword } },
                { description: { contains: keyword } },
                { address: { contains: keyword } },
            ];
        }

        if (category) {
            where.category = { contains: category };
        }

        if (destinationId) {
            where.destinationId = parseInt(destinationId);
        }

        if (minRating) {
            where.rating = { gte: parseFloat(minRating) };
        }

        const foods = await prisma.food.findMany({
            where,
            take: parseInt(limit),
            skip: parseInt(skip),
            include: {
                destination: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const total = await prisma.food.count({ where });

        res.status(200).json({
            success: true,
            data: foods,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Lấy chi tiết food theo ID
 */
export const getFoodById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const food = await prisma.food.findUnique({
            where: { id: parseInt(id) },
            include: {
                destination: true,
            },
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found",
            });
        }

        res.status(200).json({
            success: true,
            data: food,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Lấy foods theo category
 */
export const getFoodsByCategory = async (req, res, next) => {
    try {
        const { category, limit = 20 } = req.query;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required",
            });
        }

        const foods = await prisma.food.findMany({
            where: {
                category: { contains: category },
            },
            take: parseInt(limit),
            include: {
                destination: true,
            },
            orderBy: { rating: "desc" },
        });

        res.status(200).json({
            success: true,
            data: foods,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Lấy top foods theo rating
 */
export const getTopFoods = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const foods = await prisma.food.findMany({
            take: parseInt(limit),
            include: {
                destination: true,
            },
            orderBy: { rating: "desc" },
            where: {
                rating: { not: null },
            },
        });

        res.status(200).json({
            success: true,
            data: foods,
        });
    } catch (err) {
        next(err);
    }
};
