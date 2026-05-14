import * as notificationService from "../services/notificationService.js";

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skip, take } = req.query;
    const notifications = await notificationService.getNotifications(userId, skip, take);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await notificationService.markAsRead(id, userId);
    res.status(200).json({ success: true, message: "Đã đánh dấu là đã đọc" });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await notificationService.markAllAsRead(userId);
    res.status(200).json({ success: true, message: "Đã đánh dấu tất cả là đã đọc" });
  } catch (error) {
    next(error);
  }
};
