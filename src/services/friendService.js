import prisma from "../config/prismaClient.js";
import { createNotification } from "./notificationService.js";

/**
 * Gửi lời mời kết bạn
 */
export async function sendFriendRequest(requesterId, addresseeId) {
  if (requesterId === addresseeId) throw new Error("Bạn không thể kết bạn với chính mình.");

  // Kiểm tra xem đã có quan hệ chưa
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId }
      ]
    }
  });

  if (existing) {
    if (existing.status === 'accepted') throw new Error("Hai bạn đã là bạn bè.");
    if (existing.status === 'pending') {
      if (existing.requesterId === requesterId) throw new Error("Bạn đã gửi lời mời trước đó rồi.");
      else throw new Error("Người này đã gửi lời mời cho bạn, vui lòng chấp nhận.");
    }
  }

  const friendship = await prisma.friendship.create({
    data: {
      requesterId,
      addresseeId,
      status: 'pending'
    }
  });

  // Tạo thông báo
  await createNotification({
    userId: addresseeId,
    actorId: requesterId,
    type: 'FRIEND_REQUEST',
    content: 'đã gửi cho bạn một lời mời kết bạn.'
  });

  return friendship;
}

/**
 * Chấp nhận lời mời kết bạn
 */
export async function acceptFriendRequest(requestId, userId) {
  const friendship = await prisma.friendship.findUnique({
    where: { id: parseInt(requestId, 10) }
  });

  if (!friendship) throw new Error("Không tìm thấy lời mời kết bạn.");
  if (friendship.addresseeId !== parseInt(userId, 10)) {
    throw new Error("Bạn không có quyền chấp nhận lời mời này.");
  }
  if (friendship.status === 'accepted') throw new Error("Lời mời đã được chấp nhận trước đó.");

  const updated = await prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: 'accepted' }
  });

  // Thông báo lại cho người gửi
  await createNotification({
    userId: friendship.requesterId,
    actorId: userId,
    type: 'FRIEND_ACCEPT',
    content: 'đã chấp nhận lời mời kết bạn của bạn.'
  });

  return updated;
}

/**
 * Từ chối hoặc Huỷ lời mời / Hủy kết bạn
 */
export async function deleteFriendship(friendshipId, userId) {
  const friendship = await prisma.friendship.findUnique({
    where: { id: parseInt(friendshipId, 10) }
  });

  if (!friendship) throw new Error("Không tìm thấy quan hệ bạn bè.");
  
  if (friendship.requesterId !== parseInt(userId, 10) && friendship.addresseeId !== parseInt(userId, 10)) {
    throw new Error("Bạn không có quyền thực hiện hành động này.");
  }

  return await prisma.friendship.delete({
    where: { id: friendship.id }
  });
}

/**
 * Lấy danh sách bạn bè
 */
export async function getFriendsList(userId) {
  const uid = parseInt(userId, 10);
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: uid, status: 'accepted' },
        { addresseeId: uid, status: 'accepted' }
      ]
    },
    include: {
      requester: { select: { id: true, fullName: true, avatarUrl: true, bio: true } },
      addressee: { select: { id: true, fullName: true, avatarUrl: true, bio: true } }
    }
  });

  return friendships.map(f => f.requesterId === uid ? f.addressee : f.requester);
}

/**
 * Lấy danh sách lời mời đang chờ (người khác gửi cho mình)
 */
export async function getPendingRequests(userId) {
  return await prisma.friendship.findMany({
    where: {
      addresseeId: parseInt(userId, 10),
      status: 'pending'
    },
    include: {
      requester: { select: { id: true, fullName: true, avatarUrl: true, bio: true } }
    }
  });
}

/**
 * Lấy trạng thái bạn bè giữa 2 người
 */
export async function getFriendshipStatus(currentUserId, targetUserId) {
  const uid = parseInt(currentUserId, 10);
  const tid = parseInt(targetUserId, 10);

  if (uid === tid) return { status: 'self' };

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: uid, addresseeId: tid },
        { requesterId: tid, addresseeId: uid }
      ]
    }
  });

  if (!friendship) return { status: 'none' };

  return {
    status: friendship.status, // 'pending' hoặc 'accepted'
    requestId: friendship.id,
    isRequester: friendship.requesterId === uid
  };
}

/**
 * Lấy profile công khai của người dùng kèm thống kê
 */
export async function getTravelerProfile(userId, currentUserId) {
  const tid = parseInt(userId, 10);

  const user = await prisma.user.findUnique({
    where: { id: tid },
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      posts: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, thumbnailUrl: true, createdAt: true }
      },
      _count: {
        select: {
          trips: true,
          posts: { where: { isDeleted: false } },
        }
      }
    }
  });

  if (!user) throw new Error("Không tìm thấy người dùng.");

  // Tính số lượng bạn bè (accepted)
  const friendsCount = await prisma.friendship.count({
    where: {
      OR: [{ requesterId: tid, status: 'accepted' }, { addresseeId: tid, status: 'accepted' }]
    }
  });

  const friendship = await getFriendshipStatus(currentUserId, userId);

  return {
    ...user,
    stats: {
      trips: user._count.trips,
      posts: user._count.posts,
      friends: friendsCount
    },
    friendship
  };
}
