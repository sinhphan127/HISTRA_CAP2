import prisma from "../config/prismaClient.js";
import * as notificationService from "./notificationService.js";

/**
 * Tạo bài viết mới
 */
export async function createPost(userId, { title, content, thumbnailUrl, destinationIds, mediaFiles }) {
  const uid = parseInt(userId, 10);
  const data = {
    userId: uid,
    title,
    content,
    thumbnailUrl,
  };

  if (destinationIds && Array.isArray(destinationIds)) {
    data.postLocations = {
      create: destinationIds.map(id => ({ destinationId: parseInt(id, 10) }))
    };
  }

  if (mediaFiles && Array.isArray(mediaFiles)) {
    data.mediaFiles = {
      create: mediaFiles.map(m => ({ 
        fileUrl: m.fileUrl, 
        fileType: m.fileType 
      }))
    };
  }

  return await prisma.post.create({
    data,
    include: {
      postLocations: { include: { destination: true } },
      user: { select: { id: true, fullName: true, avatarUrl: true } }
    }
  });
}

/**
 * Lấy danh sách bài viết
 */
export async function getAllPosts(currentUserId, skip = 0, take = 20) {
  const uid = currentUserId ? parseInt(currentUserId, 10) : null;
  const safeSkip = isNaN(parseInt(skip, 10)) ? 0 : parseInt(skip, 10);
  const safeTake = isNaN(parseInt(take, 10)) ? 20 : parseInt(take, 10);
  
  const posts = await prisma.post.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
    skip: safeSkip,
    take: safeTake,
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true, userRoles: { include: { role: true } } }
      },
      _count: {
        select: { comments: true, postLikes: true }
      },
      postLikes: uid ? { where: { userId: uid } } : false,
      savedPosts: uid ? { where: { userId: uid } } : false
    }
  });

  return posts.map(post => ({
    ...post,
    likes: post._count.postLikes,
    comments: post._count.comments,
    isLiked: uid ? post.postLikes.length > 0 : false,
    isSaved: uid ? post.savedPosts.length > 0 : false,
    user: {
      ...post.user,
      isVerified: post.user.userRoles?.some(ur => ur.role.roleName === 'admin') || false
    }
  }));
}

/**
 * Thả tim / Bỏ thả tim
 */
export async function toggleLike(userId, postId) {
  const uid = parseInt(userId, 10);
  const pid = parseInt(postId, 10);

  const existingLike = await prisma.postLike.findUnique({
    where: { uq_post_like: { postId: pid, userId: uid } }
  });

  if (existingLike) {
    await prisma.postLike.delete({ where: { id: existingLike.id } });
    return { liked: false };
  } else {
    await prisma.postLike.create({ data: { userId: uid, postId: pid } });
    
    // Tạo thông báo
    const post = await prisma.post.findUnique({ where: { id: pid }, select: { userId: true } });
    if (post && post.userId !== uid) {
      await notificationService.createNotification({
        userId: post.userId,
        actorId: uid,
        postId: pid,
        type: 'LIKE',
        content: 'đã thích bài viết của bạn'
      });
    }

    return { liked: true };
  }
}

/**
 * Thêm bình luận
 */
export async function addComment(userId, postId, content) {
  const comment = await prisma.comment.create({
    data: {
      userId: parseInt(userId, 10),
      postId: parseInt(postId, 10),
      content
    },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } }
    }
  });

  // Tạo thông báo
  const post = await prisma.post.findUnique({ where: { id: parseInt(postId, 10) }, select: { userId: true } });
  if (post && post.userId !== parseInt(userId, 10)) {
    await notificationService.createNotification({
      userId: post.userId,
      actorId: userId,
      postId: postId,
      type: 'COMMENT',
      content: `đã bình luận: "${content.length > 30 ? content.substring(0, 30) + '...' : content}"`
    });
  }

  return comment;
}

/**
 * Chi tiết bài viết (bao gồm bình luận)
 */
export async function getPostDetail(postId, currentUserId) {
  const pid = parseInt(postId, 10);
  const uid = currentUserId ? parseInt(currentUserId, 10) : null;

  const post = await prisma.post.findUnique({
    where: { id: pid },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } },
      comments: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } }
      },
      _count: { select: { postLikes: true, comments: true } },
      postLikes: uid ? { where: { userId: uid } } : false,
      savedPosts: uid ? { where: { userId: uid } } : false
    }
  });

  if (!post) throw new Error("Bài viết không tồn tại");

  return {
    ...post,
    likes: post._count.postLikes,
    commentsCount: post._count.comments,
    isLiked: uid ? post.postLikes.length > 0 : false,
    isSaved: uid ? post.savedPosts.length > 0 : false
  };
}

/**
 * Lấy bài viết của một người dùng cụ thể
 */
export async function getUserPosts(userId, skip = 0, take = 20) {
  const safeSkip = isNaN(parseInt(skip, 10)) ? 0 : parseInt(skip, 10);
  const safeTake = isNaN(parseInt(take, 10)) ? 20 : parseInt(take, 10);

  const posts = await prisma.post.findMany({
    where: { userId: parseInt(userId, 10), isDeleted: false },
    orderBy: { createdAt: 'desc' },
    skip: safeSkip,
    take: safeTake,
    include: {
      _count: { select: { comments: true, postLikes: true } }
    }
  });

  return posts.map(post => ({
    ...post,
    likes: post._count.postLikes,
    comments: post._count.comments
  }));
}

/**
 * Lấy danh sách bài viết đã lưu của người dùng
 */
export async function getSavedPosts(userId, skip = 0, take = 10) {
  const safeSkip = isNaN(parseInt(skip, 10)) ? 0 : parseInt(skip, 10);
  const safeTake = isNaN(parseInt(take, 10)) ? 10 : parseInt(take, 10);

  const saved = await prisma.savedPost.findMany({
    where: { userId: parseInt(userId, 10) },
    orderBy: { createdAt: 'desc' },
    skip: safeSkip,
    take: safeTake,
    include: {
      post: {
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
          _count: { select: { comments: true, postLikes: true } }
        }
      }
    }
  });

  return saved.map(s => ({
    ...s.post,
    likes: s.post._count.postLikes,
    comments: s.post._count.comments
  }));
}

/**
 * Lưu / Bỏ lưu bài viết
 */
export async function toggleSavePost(userId, postId) {
  const uid = parseInt(userId, 10);
  const pid = parseInt(postId, 10);

  const existing = await prisma.savedPost.findUnique({
    where: { uq_saved_post: { userId: uid, postId: pid } }
  });

  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
    return { saved: false };
  } else {
    await prisma.savedPost.create({ data: { userId: uid, postId: pid } });

    // Tạo thông báo
    const post = await prisma.post.findUnique({ where: { id: pid }, select: { userId: true } });
    if (post && post.userId !== uid) {
      await notificationService.createNotification({
        userId: post.userId,
        actorId: uid,
        postId: pid,
        type: 'SAVE',
        content: 'đã lưu bài viết của bạn'
      });
    }

    return { saved: true };
  }
}

