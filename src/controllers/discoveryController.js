import prisma from "../config/prismaClient.js";

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
    const { keyword, category, province } = req.query;

    const where = {
      isDeleted: false,
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (province) {
      where.province = province;
    }

    const destinations = await prisma.destination.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: 20
    });

    res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (err) {
    next(err);
  }
};
