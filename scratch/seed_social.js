import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  console.log('Starting seeding social data...');

  // 1. Cập nhật Visibility cho các bài viết hiện có
  await prisma.post.updateMany({
    where: { id: { in: [1, 2, 5] } },
    data: { visibility: 'PUBLIC' }
  });
  await prisma.post.updateMany({
    where: { id: { in: [3] } },
    data: { visibility: 'FRIENDS' }
  });
  await prisma.post.updateMany({
    where: { id: { in: [6] } },
    data: { visibility: 'PRIVATE' }
  });
  console.log('Updated post visibility.');

  // 2. Thêm bình luận lồng nhau
  // Thêm một comment gốc
  const parentComment = await prisma.comment.create({
    data: {
      postId: 1,
      userId: 2, // Bob
      content: 'Chuyến đi tuyệt vời quá Alice ơi!'
    }
  });

  // Thêm các phản hồi (replies)
  await prisma.comment.createMany({
    data: [
      {
        postId: 1,
        userId: 1, // Alice
        parentId: parentComment.id,
        content: 'Cảm ơn Bob nhé, hôm nào đi chung nha!'
      },
      {
        postId: 1,
        userId: 3, // Charlie
        parentId: parentComment.id,
        content: 'Cho mình đi ké với các bạn!'
      }
    ]
  });
  console.log('Added nested comments.');

  // 3. Thêm Comment Likes
  await prisma.commentLike.createMany({
    data: [
      { commentId: parentComment.id, userId: 1 },
      { commentId: parentComment.id, userId: 3 },
      { commentId: parentComment.id, userId: 5 }
    ]
  });
  console.log('Added comment likes.');

  console.log('Seeding finished successfully!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
