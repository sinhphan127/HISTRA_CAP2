import prisma from "../config/prismaClient.js";
import { getPostMemories } from "../services/postService.js";

/**
 * Lấy dữ liệu tổng hợp cho trang chủ
 */
export const getHomeData = async (req, res, next) => {
  try {
    // 1. Lấy Foods mới nhất (4 cái)
    const foods = await prisma.food.findMany({
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
        foods,
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

export const getExplorePreview = async (req, res, next) => {
  try {
    const previewTrip = await prisma.trip.findFirst({
      where: { 
        status: 'public',
      },
      orderBy: { id: 'desc' },
      include: {
        costEstimations: true,
        tripLocations: {
          where: { dayNumber: 1 },
          orderBy: { visitOrder: 'asc' },
          include: {
            destination: true
          }
        }
      }
    });

    if (!previewTrip) {
      return res.status(404).json({ success: false, message: 'No preview trip found' });
    }

    res.status(200).json({
      success: true,
      data: previewTrip
    });
  } catch (err) {
    next(err);
  }
};

export const getProvinces = async (req, res, next) => {
  try {
    const provinces = await prisma.destination.findMany({
      where: { isDeleted: false },
      select: { province: true },
      distinct: ['province'],
    });

    const provinceList = provinces
      .map(p => p.province)
      .filter(p => p !== null && p !== '')
      .sort();

    res.status(200).json({
      success: true,
      data: provinceList
    });
  } catch (err) {
    next(err);
  }
};
