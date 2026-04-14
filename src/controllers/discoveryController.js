import prisma from "../config/prismaClient.js";
import { getPostMemories } from "../services/postService.js";

/**
 * Lấy dữ liệu tổng hợp cho trang chủ
 */
export const getHomeData = async (req, res, next) => {
  try {
    // 1. Lấy Deals mới nhất (4 cái)
    const deals = await prisma.deal.findMany({
      take: 4,
      orderBy: { id: 'desc' },
      include: {
        destination: true
      }
    });

    // 2. Lấy Travel Inspiration (Cấu trúc giống Featured Post và Grid)
    const inspiration = await prisma.post.findMany({
      take: 5,
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            fullName: true,
            avatarUrl: true
          }
        },
        postLikes: true,
        _count: {
          select: { comments: true }
        }
      }
    });

    // 3. Lấy Suggested Schedules (Trips)
    const suggestedSchedules = await prisma.trip.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            fullName: true,
            avatarUrl: true
          }
        },
        tripLocations: {
          include: {
            destination: true
          }
        },
        costEstimations: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        deals,
        inspiration,
        suggestedSchedules
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Lấy danh sách điểm đến với tìm kiếm và phân loại
 */
export const getDestinations = async (req, res, next) => {
  try {
    const { keyword, category, province, minRating } = req.query;
    console.log(`[Discovery] Search with: keyword=${keyword}, category=${category}, province=${province}, minRating=${minRating}`);

    const where = {
      isDeleted: false,
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    if (category && category !== 'All') {
      where.category = { contains: category };
    }

    if (province && province !== 'All') {
      where.province = { contains: province };
    }

    if (minRating && !isNaN(parseFloat(minRating))) {
      where.rating = { gte: parseFloat(minRating) };
    }

    const destinations = await prisma.destination.findMany({
      where,
      orderBy: [
        { rating: 'desc' },
        { reviewsCount: 'desc' }
      ],
      take: 50
    });

    res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (err) {
    next(err);
  }
};

export const getMemories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const memories = await getPostMemories(userId);

    res.status(200).json({
      success: true,
      data: memories
    });
  } catch (err) {
    next(err);
  }
};
