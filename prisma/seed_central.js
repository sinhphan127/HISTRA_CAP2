import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("🌟 Starting COMPREHENSIVE SEEDING (Central Vietnam focus)...");

  const centralProvinces = [
    'Đà Nẵng',
    'Thừa Thiên Huế',
    'Quảng Nam',
    'Quảng Bình',
    'Khánh Hòa',
    'Bình Định',
    'Phú Yên'
  ];

  // 1. Get Base Data
  const roleUser = await prisma.role.findUnique({ where: { roleName: 'user' } });
  if (!roleUser) {
    console.error("❌ 'user' role not found. Please run the base seed first.");
    return;
  }
  const passwordHash = await bcrypt.hash('123456', 10);

  // 2. Import Destinations from locations.json (Central only)
  console.log("📍 Importing Central Vietnam Destinations...");
  const jsonPath = path.join(__dirname, '../../myApp/data/locations.json');
  let centralDestinations = [];

  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const allLocations = JSON.parse(rawData);
    const centralLocations = allLocations.filter(loc => centralProvinces.includes(loc.province));

    for (const loc of centralLocations) {
      const dest = await prisma.destination.upsert({
        where: { name: loc.name }, // Assuming name is unique enough for seeding
        update: {},
        create: {
          name: loc.name,
          province: loc.province,
          city: loc.city || loc.province,
          description: loc.description,
          ticketPrice: loc.ticket_price,
          openingHours: loc.opening_hours,
          rating: loc.rating,
          reviewsCount: loc.reviews_count,
          duration: loc.duration,
          latitude: loc.coordinates.latitude,
          longitude: loc.coordinates.longitude,
          imageUrl: loc.image,
          category: loc.category
        }
      });
      centralDestinations.push(dest);
    }
    console.log(`✅ Processed ${centralDestinations.length} Central destinations.`);
  } else {
    console.warn("⚠️ locations.json not found, using existing DB destinations.");
    centralDestinations = await prisma.destination.findMany({ take: 20 });
  }

  // 3. Create diverse Users
  console.log("👥 Creating community members...");
  const mockUsers = [
    { username: 'hue.monarchy', fullName: 'Lê Bảo Long', bio: 'Đam mê lịch sử cố đô Huế. ⛩️', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
    { username: 'danang.beach', fullName: 'Nguyễn Thùy Chi', bio: 'Yêu biển Đà Nẵng, thích ăn hải sản. 🏖️', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' },
    { username: 'hoian.lantern', fullName: 'Phạm Minh Đức', bio: 'Nhiếp ảnh gia nghiệp dư tại Hội An.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
    { username: 'quangbinh.cave', fullName: 'Trần Anh Khoa', bio: 'Chuyên gia thám hiểm hang động Quảng Bình.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
    { username: 'nhatrang.ocean', fullName: 'Hoàng Diệp Anh', bio: 'Mặn mòi vị biển Nha Trang. 🌊', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' },
  ];

  const createdUsers = [];
  for (const u of mockUsers) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: { avatarUrl: u.avatar, bio: u.bio },
      create: {
        username: u.username,
        email: `${u.username}@histra.com`,
        password: passwordHash,
        fullName: u.fullName,
        bio: u.bio,
        avatarUrl: u.avatar,
        status: 'active',
        userRoles: { create: { roleId: roleUser.id } }
      }
    });
    createdUsers.push(user);
  }

  // 4. Create Posts for Central Vietnam
  console.log("📝 Creating rich posts about Central Vietnam...");
  const centralPostsData = [
    { title: "Vẻ đẹp trầm mặc của Đại Nội Huế", content: "Đến Huế mà chưa đi Đại Nội là một thiếu sót lớn. Không gian cổ kính khiến mình như lạc vào triều đại nhà Nguyễn...", province: "Thừa Thiên Huế" },
    { title: "Ngắm Cầu Bàn Tay Vàng mờ ảo trong sương", content: "Bà Nà Hills hôm nay mây mù che phủ, Cầu Vàng hiện ra như một dải lụa tiên cảnh giữa núi rừng.", province: "Đà Nẵng" },
    { title: "Hội An về đêm lung linh ánh đèn lồng", content: "Dưới ánh đèn lồng, Hội An mang một vẻ đẹp huyền bí và lãng mạn. Đừng quên thử bánh mì Phượng nhé!", province: "Quảng Nam" },
    { title: "Khám phá Động Thiên Đường - Cung điện trong lòng đất", content: "Thạch nhũ ở đây kỳ ảo đến mức mình không tin vào mắt mình. Đây thực sự là kỳ quan của Quảng Bình.", province: "Quảng Bình" },
    { title: "Hoàng hôn trên bãi biển Nha Trang", content: "Nha Trang vẫn luôn là lựa chọn hàng đầu cho một kỳ nghỉ biển. Cát trắng, nắng vàng và sóng nhẹ.", province: "Khánh Hòa" },
  ];

  const createdPosts = [];
  for (let i = 0; i < 15; i++) {
    const postData = centralPostsData[i % centralPostsData.length];
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const dest = centralDestinations.find(d => d.province === postData.province) || centralDestinations[0];

    const post = await prisma.post.create({
      data: {
        title: `${postData.title} (Part ${Math.floor(i / 5) + 1})`,
        content: postData.content,
        thumbnailUrl: dest.imageUrl || 'https://via.placeholder.com/400',
        userId: user.id,
        postLocations: {
          create: [{ destinationId: dest.id }]
        },
        mediaFiles: {
          create: [{ fileUrl: dest.imageUrl || 'https://via.placeholder.com/400', fileType: 'image' }]
        }
      }
    });
    createdPosts.push(post);
  }

  // 5. Create Likes, Comments, and SAVED POSTS
  console.log("🎬 Adding interactions (Likes, Comments, SAVES)...");
  const sampleComments = ["Ảnh đẹp quá!", "Muốn đi quá đi 😍", "Huế lúc nào cũng đẹp.", "Review cực tâm huyết.", "Hẹn Đà Nẵng một ngày gần nhất!"];

  for (const post of createdPosts) {
    // Likes
    const numLikes = Math.floor(Math.random() * 5) + 1;
    for (let l = 0; l < numLikes; l++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      try {
        await prisma.postLike.create({ data: { postId: post.id, userId: user.id } });
      } catch (e) {}
    }

    // Comments
    const numComments = Math.floor(Math.random() * 3);
    for (let c = 0; c < numComments; c++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      await prisma.comment.create({
        data: {
          postId: post.id,
          userId: user.id,
          content: sampleComments[Math.floor(Math.random() * sampleComments.length)]
        }
      });
    }

    // SAVES (This is what the user specifically wanted to test)
    const numSaves = Math.floor(Math.random() * 3) + 1;
    for (let s = 0; s < numSaves; s++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      try {
        await prisma.savedPost.create({ data: { postId: post.id, userId: user.id } });
        
        // Tạo thông báo mẫu
        if (user.id !== post.userId) {
          await prisma.notification.create({
            data: {
              userId: post.userId,
              actorId: user.id,
              postId: post.id,
              type: 'SAVE',
              content: 'đã lưu bài viết của bạn',
              isRead: Math.random() > 0.5
            }
          });
        }
      } catch (e) {}
    }

    // Thêm một vài Comment thông báo mẫu
    const userForComment = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    if (userForComment.id !== post.userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          actorId: userForComment.id,
          postId: post.id,
          type: 'COMMENT',
          content: 'đã bình luận: "Ảnh đẹp quá! 😍"',
          isRead: false
        }
      });
    }
  }

  console.log("✅ Comprehensive Seeding (Central Vietnam) Finished!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
