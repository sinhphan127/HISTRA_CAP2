import prisma from "../config/prismaClient.js";
import { io } from "../app.js";

/**
 * Tạo thông báo mới và gửi qua socket
 */
export async function createNotification({ userId, actorId, postId, type, content }) {
  try {
    // 1. Lưu vào Database
    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId, 10),
        actorId: actorId ? parseInt(actorId, 10) : null,
        postId: postId ? parseInt(postId, 10) : null,
        type,
        content
      },
      include: {
        actor: {
          select: { id: true, fullName: true, avatarUrl: true }
        },
        post: {
          select: { id: true, title: true, thumbnailUrl: true }
        }
      }
    });

    // 2. Gửi qua Socket.io (Thời gian thực)
    console.log(`📣 Emitting notification to user_${userId}:`, type);
    io.to(`user_${userId}`).emit("new_notification", notification);

    return notification;
  } catch (error) {
    console.error("❌ Lỗi tạo thông báo:", error);
    // Không ném lỗi để tránh làm hỏng luồng chính (like/comment)
  }
}

/**
 * Lấy danh sách thông báo của người dùng
 */
export async function getNotifications(userId, skip = 0, take = 20) {
  return await prisma.notification.findMany({
    where: { userId: parseInt(userId, 10) },
    orderBy: { createdAt: 'desc' },
    skip: parseInt(skip, 10),
    take: parseInt(take, 10),
    include: {
      actor: {
        select: { id: true, fullName: true, avatarUrl: true }
      },
      post: {
        select: { id: true, title: true, thumbnailUrl: true }
      }
    }
  });
}

/**
 * Đánh dấu đã đọc
 */
export async function markAsRead(notificationId, userId) {
  return await prisma.notification.updateMany({
    where: { 
      id: parseInt(notificationId, 10),
      userId: parseInt(userId, 10)
    },
    data: { isRead: true }
  });
}

/**
 * Đánh dấu tất cả là đã đọc
 */
export async function markAllAsRead(userId) {
  return await prisma.notification.updateMany({
    where: { userId: parseInt(userId, 10) },
    data: { isRead: true }
  });
}
