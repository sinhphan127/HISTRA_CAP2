import prisma from "../config/prismaClient.js";
import * as notificationService from "./notificationService.js";

/**
 * Tạo bài viết mới
 */
export async function createPost(userId, { title, content, thumbnailUrl, destinationIds, mediaFiles, visibility = 'PUBLIC' }) {
  const uid = parseInt(userId, 10);
  const data = {
    userId: uid,
    title,
    content,
    thumbnailUrl,
    visibility: visibility.toUpperCase()
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
      user: { select: { id: true, fullName: true, avatarUrl: true } },
      mediaFiles: true
    }
  });
}

/**
 * Lấy danh sách bài viết với lọc và sắp xếp nâng cao
 */
export async function getAllPosts(currentUserId, params = {}) {
  const { skip = 0, take = 20, keyword, category, sortBy = 'newest' } = params;
  const uid = currentUserId ? parseInt(currentUserId, 10) : null;
  const safeSkip = isNaN(parseInt(skip, 10)) ? 0 : parseInt(skip, 10);
  const safeTake = isNaN(parseInt(take, 10)) ? 20 : parseInt(take, 10);
  
  const where = { isDeleted: false };

  // Lọc theo từ khóa (tiêu đề hoặc nội dung)
  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { content: { contains: keyword } }
    ];
  }

  // Lọc theo danh mục (thông qua địa điểm gắn kèm)
  if (category && category !== 'all') {
    where.postLocations = {
      some: {
        destination: {
          category: { contains: category }
        }
      }
    };
  }

  // Logic Visibility & Friends
  if (sortBy === 'friends' && uid) {
    // Lấy ID của tất cả bạn bè
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: uid, status: 'accepted' },
          { addresseeId: uid, status: 'accepted' }
        ]
      },
      select: { requesterId: true, addresseeId: true }
    });
    
    const friendIds = friendships.map(f => f.requesterId === uid ? f.addresseeId : f.requesterId);
    
    where.OR = [
      { userId: uid }, // Bài viết của mình
      { 
        userId: { in: friendIds },
        visibility: { in: ['PUBLIC', 'FRIENDS'] }
      }
    ];
  } else {
    // Luồng mặc định (Trending/Newest)
    if (uid) {
      // Nếu đã đăng nhập: Thấy bài PUBLIC, bài FRIENDS của bạn bè, và bài PRIVATE của chính mình
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: uid, status: 'accepted' },
            { addresseeId: uid, status: 'accepted' }
          ]
        },
        select: { requesterId: true, addresseeId: true }
      });
      const friendIds = friendships.map(f => f.requesterId === uid ? f.addresseeId : f.requesterId);

      where.OR = [
        { visibility: 'PUBLIC' },
        { userId: uid },
        { 
          userId: { in: friendIds },
          visibility: 'FRIENDS'
        }
      ];
    } else {
      // Chưa đăng nhập: Chỉ thấy bài PUBLIC
      where.visibility = 'PUBLIC';
    }
  }

  // Sắp xếp
  let orderBy = { createdAt: 'desc' };
  if (sortBy === 'trending') {
    orderBy = [
      { postLikes: { _count: 'desc' } },
      { comments: { _count: 'desc' } },
      { createdAt: 'desc' }
    ];
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy,
    skip: safeSkip,
    take: safeTake,
    include: {
      user: {
        select: { 
          id: true, 
          fullName: true, 
          avatarUrl: true, 
          userRoles: { include: { role: true } } 
        }
      },
      _count: {
        select: { comments: true, postLikes: true }
      },
      postLikes: uid ? { where: { userId: uid } } : false,
      savedPosts: uid ? { where: { userId: uid } } : false,
      mediaFiles: true,
      postLocations: {
        include: {
          destination: {
            select: { name: true, category: true, province: true }
          }
        }
      }
    }
  });

  return posts.map(post => ({
    ...post,
    likes: post._count.postLikes,
    commentsCount: post._count.comments,
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
 * Thêm bình luận (hỗ trợ nested comments)
 */
export async function addComment(userId, postId, content, parentId = null) {
  const data = {
    userId: parseInt(userId, 10),
    postId: parseInt(postId, 10),
    content
  };

  if (parentId) {
    data.parentId = parseInt(parentId, 10);
  }

  const comment = await prisma.comment.create({
    data,
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } }
    }
  });

  // Tạo thông báo cho chủ bài viết
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

  // Nếu là reply, thông báo cho chủ comment cha
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({ where: { id: parseInt(parentId, 10) }, select: { userId: true } });
    if (parentComment && parentComment.userId !== parseInt(userId, 10)) {
      await notificationService.createNotification({
        userId: parentComment.userId,
        actorId: userId,
        postId: postId,
        type: 'COMMENT_REPLY',
        content: 'đã trả lời bình luận của bạn'
      });
    }
  }

  return comment;
}

/**
 * Thả tim / Bỏ thả tim bình luận
 */
export async function toggleLikeComment(userId, commentId) {
  const uid = parseInt(userId, 10);
  const cid = parseInt(commentId, 10);

  const existingLike = await prisma.commentLike.findUnique({
    where: { uq_comment_like: { commentId: cid, userId: uid } }
  });

  if (existingLike) {
    await prisma.commentLike.delete({ where: { id: existingLike.id } });
    return { liked: false };
  } else {
    await prisma.commentLike.create({ data: { userId: uid, commentId: cid } });
    
    // Tạo thông báo cho chủ comment
    const comment = await prisma.comment.findUnique({ where: { id: cid }, select: { userId: true, postId: true } });
    if (comment && comment.userId !== uid) {
      await notificationService.createNotification({
        userId: comment.userId,
        actorId: uid,
        postId: comment.postId,
        type: 'COMMENT_LIKE',
        content: 'đã thích bình luận của bạn'
      });
    }

    return { liked: true };
  }
}

/**
 * Chi tiết bài viết (bao gồm bình luận lồng nhau và likes của comment)
 */
export async function getPostDetail(postId, currentUserId) {
  const pid = parseInt(postId, 10);
  const uid = currentUserId ? parseInt(currentUserId, 10) : null;

  const post = await prisma.post.findUnique({
    where: { id: pid },
    include: {
      user: { 
        select: { 
          id: true, 
          fullName: true, 
          avatarUrl: true,
          userRoles: { include: { role: true } }
        } 
      },
      comments: {
        where: { isDeleted: false, parentId: null }, // Chỉ lấy comment gốc
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { select: { id: true, fullName: true, avatarUrl: true } },
          _count: { select: { commentLikes: true, replies: true } },
          commentLikes: uid ? { where: { userId: uid } } : false,
          replies: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'asc' },
            include: { 
              user: { select: { id: true, fullName: true, avatarUrl: true } },
              _count: { select: { commentLikes: true } },
              commentLikes: uid ? { where: { userId: uid } } : false
            }
          }
        }
      },
      _count: { select: { postLikes: true, comments: true } },
      postLikes: uid ? { where: { userId: uid } } : false,
      savedPosts: uid ? { where: { userId: uid } } : false,
      mediaFiles: true,
      postLocations: {
        include: {
          destination: true
        }
      }
    }
  });

  if (!post) throw new Error("Bài viết không tồn tại");

  const processComment = (c) => ({
    ...c,
    likesCount: c._count.commentLikes,
    isLiked: uid ? c.commentLikes.length > 0 : false,
    replies: c.replies?.map(r => ({
      ...r,
      likesCount: r._count.commentLikes,
      isLiked: uid ? r.commentLikes.length > 0 : false,
    }))
  });

  return {
    ...post,
    likes: post._count.postLikes,
    commentsCount: post._count.comments,
    isLiked: uid ? post.postLikes.length > 0 : false,
    isSaved: uid ? post.savedPosts.length > 0 : false,
    comments: post.comments.map(processComment),
    user: {
      ...post.user,
      isVerified: post.user.userRoles?.some(ur => ur.role.roleName === 'admin') || false
    }
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
      _count: { select: { comments: true, postLikes: true } },
      mediaFiles: true
    }
  });

  return posts.map(post => ({
    ...post,
    likes: post._count.postLikes,
    commentsCount: post._count.comments
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
          _count: { select: { comments: true, postLikes: true } },
          mediaFiles: true
        }
      }
    }
  });

  return saved.map(s => ({
    ...s.post,
    likes: s.post._count.postLikes,
    commentsCount: s.post._count.comments
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
/**
 * Lấy danh sách bài viết có gắn địa điểm để hiển thị trên bản đồ ký ức
 */
export async function getPostMemories(userId) {
  const posts = await prisma.post.findMany({
    where: {
      userId: parseInt(userId, 10),
      isDeleted: false,
      postLocations: {
        some: {} // Chỉ lấy những bài có gắn địa điểm
      }
    },
    include: {
      postLocations: {
        include: {
          destination: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return posts.map(post => {
    // Lấy tọa độ từ địa điểm đầu tiên gắn với bài viết
    const firstLoc = post.postLocations[0]?.destination;
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      thumbnailUrl: post.thumbnailUrl,
      createdAt: post.createdAt,
      latitude: firstLoc?.latitude ? parseFloat(firstLoc.latitude) : null,
      longitude: firstLoc?.longitude ? parseFloat(firstLoc.longitude) : null,
      locationName: firstLoc?.name
    };
  }).filter(p => p.latitude && p.longitude); // Lọc bỏ nếu ko có tọa độ
}
