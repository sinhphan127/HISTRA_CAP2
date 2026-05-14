import prisma from "../config/prismaClient.js";
import bcrypt from "bcryptjs";

// =============================================
// STATS
// =============================================
export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPosts, totalDestinations, pendingReports, totalTrips, totalFoods] =
      await Promise.all([
        prisma.user.count({ where: { isDeleted: false } }),
        prisma.post.count({ where: { isDeleted: false } }),
        prisma.destination.count({ where: { isDeleted: false } }),
        prisma.report.count({ where: { status: "pending" } }),
        prisma.trip.count(),
        prisma.food.count(),
      ]);

    // Người dùng mới trong 7 ngày
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: lastWeek }, isDeleted: false },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        totalDestinations,
        pendingReports,
        totalTrips,
        totalFoods,
        newUsersThisWeek,
      },
    });
  } catch (err) {
    next(err);
  }
};

// =============================================
// USER MANAGEMENT
// =============================================
export const getUsers = async (req, res, next) => {
  try {
    const { keyword = "", page = 1, limit = 15, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isDeleted: false,
      ...(status && { status }),
      ...(keyword && {
        OR: [
          { username: { contains: keyword } },
          { email: { contains: keyword } },
          { fullName: { contains: keyword } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          userRoles: { include: { role: true } },
          _count: { select: { posts: true, trips: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const mapped = users.map((u) => ({
      ...u,
      role: u.userRoles?.[0]?.role?.roleName || "user",
    }));

    res.status(200).json({
      success: true,
      data: mapped,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'blocked'

    if (!["active", "blocked"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
      select: { id: true, username: true, status: true },
    });

    res.status(200).json({
      success: true,
      message: `Tài khoản đã được ${status === "blocked" ? "khóa" : "mở khóa"}`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isDeleted: true, status: "deleted" },
    });
    res.status(200).json({ success: true, message: "Đã xóa tài khoản người dùng" });
  } catch (err) {
    next(err);
  }
};

// =============================================
// POST MANAGEMENT
// =============================================
export const getPosts = async (req, res, next) => {
  try {
    const { keyword = "", page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(keyword && {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
          _count: { select: { comments: true, postLikes: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.post.update({
      where: { id: parseInt(id) },
      data: { isDeleted: true },
    });
    res.status(200).json({ success: true, message: "Đã xóa bài viết" });
  } catch (err) {
    next(err);
  }
};

// =============================================
// DESTINATION MANAGEMENT
// =============================================
export const getDestinations = async (req, res, next) => {
  try {
    const { keyword = "", page = 1, limit = 15, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isDeleted: false,
      ...(category && category !== "All" && { category }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { city: { contains: keyword } },
          { province: { contains: keyword } },
        ],
      }),
    };

    const [destinations, total] = await Promise.all([
      prisma.destination.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { id: "desc" },
      }),
      prisma.destination.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: destinations,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const createDestination = async (req, res, next) => {
  try {
    const {
      name, city, country, description, latitude, longitude,
      imageUrl, category, province, address, openingHours,
      duration, ticketPrice, rating,
    } = req.body;

    const destination = await prisma.destination.create({
      data: {
        name, city, country, description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        imageUrl, category, province, address, openingHours,
        duration, ticketPrice: ticketPrice ? parseFloat(ticketPrice) : null,
        rating: rating ? parseFloat(rating) : null,
      },
    });

    res.status(201).json({ success: true, message: "Tạo địa điểm thành công", data: destination });
  } catch (err) {
    next(err);
  }
};

export const updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, city, country, description, latitude, longitude,
      imageUrl, category, province, address, openingHours,
      duration, ticketPrice, rating,
    } = req.body;

    const destination = await prisma.destination.update({
      where: { id: parseInt(id) },
      data: {
        name, city, country, description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        imageUrl, category, province, address, openingHours,
        duration, ticketPrice: ticketPrice ? parseFloat(ticketPrice) : null,
        rating: rating ? parseFloat(rating) : null,
      },
    });

    res.status(200).json({ success: true, message: "Cập nhật địa điểm thành công", data: destination });
  } catch (err) {
    next(err);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.destination.update({
      where: { id: parseInt(id) },
      data: { isDeleted: true },
    });
    res.status(200).json({ success: true, message: "Đã xóa địa điểm" });
  } catch (err) {
    next(err);
  }
};

// =============================================
// REPORT MANAGEMENT
// =============================================
export const getReports = async (req, res, next) => {
  try {
    const { status = "pending", page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { ...(status !== "all" && { status }) };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status: "resolved" },
    });
    res.status(200).json({ success: true, message: "Đã xử lý báo cáo", data: report });
  } catch (err) {
    next(err);
  }
};

// =============================================
// FOOD MANAGEMENT
// =============================================
export const getFoods = async (req, res, next) => {
  try {
    const { keyword = "", page = 1, limit = 15, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(category && { category }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      }),
    };

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: { destination: { select: { id: true, name: true } } },
      }),
      prisma.food.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: foods,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const createFood = async (req, res, next) => {
  try {
    const { name, description, category, price, imageUrl, rating, address, destinationId } = req.body;

    const food = await prisma.food.create({
      data: {
        name,
        description,
        category,
        price: price ? parseFloat(price) : null,
        imageUrl,
        rating: rating ? parseFloat(rating) : null,
        address,
        destinationId: destinationId ? parseInt(destinationId) : null,
      },
    });

    res.status(201).json({ success: true, message: "Tạo món ăn thành công", data: food });
  } catch (err) {
    next(err);
  }
};

export const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, imageUrl, rating, address, destinationId } = req.body;

    const food = await prisma.food.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        price: price ? parseFloat(price) : null,
        imageUrl,
        rating: rating ? parseFloat(rating) : null,
        address,
        destinationId: destinationId ? parseInt(destinationId) : null,
      },
    });

    res.status(200).json({ success: true, message: "Cập nhật món ăn thành công", data: food });
  } catch (err) {
    next(err);
  }
};

export const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.food.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ success: true, message: "Đã xóa món ăn" });
  } catch (err) {
    next(err);
  }
};
