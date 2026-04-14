import * as friendService from '../services/friendService.js';

const friendController = {
  sendRequest: async (req, res, next) => {
    try {
      const { targetId } = req.body;
      const result = await friendService.sendFriendRequest(req.user.id, targetId);
      res.status(201).json({ success: true, message: "Đã gửi lời mời kết bạn", data: result });
    } catch (err) {
      next(err);
    }
  },

  acceptRequest: async (req, res, next) => {
    try {
      const { requestId } = req.params;
      const result = await friendService.acceptFriendRequest(requestId, req.user.id);
      res.status(200).json({ success: true, message: "Đã chấp nhận kết bạn", data: result });
    } catch (err) {
      next(err);
    }
  },

  rejectRequest: async (req, res, next) => {
    try {
      const { requestId } = req.params;
      await friendService.deleteFriendship(requestId, req.user.id);
      res.status(200).json({ success: true, message: "Đã từ chối/huỷ lời mời" });
    } catch (err) {
      next(err);
    }
  },

  unfriend: async (req, res, next) => {
    try {
      const { friendshipId } = req.params;
      await friendService.deleteFriendship(friendshipId, req.user.id);
      res.status(200).json({ success: true, message: "Đã huỷ kết bạn" });
    } catch (err) {
      next(err);
    }
  },

  getPending: async (req, res, next) => {
    try {
      const requests = await friendService.getPendingRequests(req.user.id);
      res.status(200).json({ success: true, data: requests });
    } catch (err) {
      next(err);
    }
  },

  getFriends: async (req, res, next) => {
    try {
      const friends = await friendService.getFriendsList(req.user.id);
      res.status(200).json({ success: true, data: friends });
    } catch (err) {
      next(err);
    }
  },

  getTravelerProfile: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const profile = await friendService.getTravelerProfile(userId, req.user.id);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
};

export default friendController;
