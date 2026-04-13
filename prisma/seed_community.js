import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("🌟 Starting Community Data Seeding...");

  // 1. Get existing data to link to
  const roleUser = await prisma.role.findUnique({ where: { roleName: 'user' } });
  const destinations = await prisma.destination.findMany({ take: 20 });
  const passwordHash = await bcrypt.hash('123456', 10);

  // 2. Create more diverse Users
  console.log("👥 Creating more community members...");
  const communityUsers = [
    { username: 'travel.junkie', fullName: 'Trần Minh Tâm', bio: 'Living for the next adventure. 🏔️', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
    { username: 'foodie.explorer', fullName: 'Lê Thu Hà', bio: 'Blogger ẩm thực & du lịch. Ăn cả thế giới! 🍜', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' },
    { username: 'mountain.climber', fullName: 'Nguyễn Văn Nam', bio: 'Đam mê trekking và chinh phục những đỉnh cao.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
    { username: 'beach.lover', fullName: 'Đặng Mỹ Linh', bio: 'Vitamin Sea is all I need. 🏖️🌊', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' },
    { username: 'history.buff', fullName: 'Lý Hoàng Nam', bio: 'Khám phá những câu chuyện ẩn sau các di tích lịch sử.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
    { username: 'digital.nomad', fullName: 'Sophie Nguyen', bio: 'Working from anywhere. Tech & Travel.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
    { username: 'wildlife.photog', fullName: 'Vũ Anh Tuấn', bio: 'Capturing nature through my lens. 📸🦅', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a' },
    { username: 'yoga.travel', fullName: 'Mai Phương Thảo', bio: 'Yoga, Meditation & Mindful Travel. 🧘‍♀️✨', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' },
    { username: 'cheap.vacay', fullName: 'Bùi Gia Bảo', bio: 'Du lịch bụi với chi phí rẻ nhất. Ask me how!', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
    { username: 'luxury.stay', fullName: 'Hoàng Kim Chi', bio: 'Reviewing the best resorts in Vietnam. ✨🏨', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
  ];

  const createdUsers = [];
  for (const u of communityUsers) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {
        bio: u.bio,
        avatarUrl: u.avatar,
      },
      create: {
        username: u.username,
        email: `${u.username}@example.com`,
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

  // 3. Create rich Posts
  console.log("📝 Creating community posts...");
  const postContents = [
    { title: "Kinh nghiệm đi Hà Giang một mình", content: "Vừa kết thúc chuyến đi 4 ngày 3 đêm tại Hà Giang. Cảm xúc thật khó tả, từ đèo Mã Pí Lèng hùng vĩ đến những bản làng yên bình...", img: "https://images.unsplash.com/photo-1504457047772-27faf1c00561" },
    { title: "Ăn gì ở Hội An?", content: "Hội An không chỉ đẹp mà còn là thiên đường ẩm thực. Dưới đây là list 10 món bạn nhất định phải thử khi đến đây: 1. Cơm gà, 2. Cao lầu, 3. Bánh mì Phượng...", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1" },
    { title: "Review VinWonders Phú Quốc cực chi tiết", content: "Một ngày vui chơi quên lối về tại VinWonders. Các trò chơi cảm giác mạnh rất đáng thử, buổi tối có show diễn nhạc nước cực đỉnh!", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482" },
    { title: "Chụp ảnh 'sống ảo' tại Đà Lạt", content: "Mách bạn những góc chụp ít người biết tại Đà Lạt. Hãy đi sớm vào khoảng 6h sáng để bắt được những tia nắng đầu ngày qua kẽ lá.", img: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6" },
    { title: "Lạc lối ở Đại Nội Huế", content: "Huế mang một vẻ đẹp trầm mặc và sâu lắng. Đi bộ qua những hành lang của Tử Cấm Thành, cảm giác như thời gian đang ngừng lại.", img: "https://images.unsplash.com/photo-1599708138407-2a138378564f" },
    { title: "Ngắm hoàng hôn ở Bãi Sao", content: "Cát trắng, biển xanh và một ly cocktail. Còn gì tuyệt vời hơn để kết thúc một ngày dài khám phá đảo ngọc?", img: "https://images.unsplash.com/photo-1506929113670-843cc11b36bb" },
    { title: "Hành trình chinh phục Fansipan", content: "Mệt nhưng xứng đáng. Đứng trên đỉnh cao nhất của Đông Dương, nhìn mây trôi dưới chân, mọi mệt mỏi đều tan biến hết.", img: "https://images.unsplash.com/photo-1580541178496-ecf0573e04e9" },
    { title: "Chợ nổi Cái Răng - Nét đẹp miền Tây", content: "Dậy từ 5h sáng để kịp phiên chợ. Tiếng ghe máy, tiếng mời chào và vị hủ tiếu nóng hổi ngay trên sông thật đặc biệt.", img: "https://images.unsplash.com/photo-1528127269322-539801943592" },
  ];

  const createdPosts = [];
  for (let i = 0; i < postContents.length * 3; i++) {
    const content = postContents[i % postContents.length];
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const dest = destinations[Math.floor(Math.random() * destinations.length)];

    // Giả lập lưu cục bộ
    const localUrl = `/uploads/seed_post_${i % 5 + 1}.jpg`;

    const post = await prisma.post.create({
      data: {
        title: `${content.title} #${i + 1}`,
        content: content.content,
        thumbnailUrl: localUrl,
        userId: user.id,
        postLocations: {
          create: [{ destinationId: dest.id }]
        },
        mediaFiles: {
          create: [
            { fileUrl: localUrl, fileType: 'image' },
            { fileUrl: "/uploads/seed_extra.jpg", fileType: 'image' }
          ]
        }
      }
    });
    createdPosts.push(post);
  }

  // 4. Create Comments
  console.log("💬 Adding discussions...");
  const sampleComments = [
    "Ảnh đẹp quá bạn ơi!",
    "Cho mình xin tracklog chuyến này với.",
    "Bạn đi hết bao nhiêu tiền vậy?",
    "Thông tin rất hữu ích, cảm ơn bạn đã chia sẻ.",
    "Mình cũng vừa đi về, công nhận cảnh đẹp thật.",
    "Hội An mùa này có đông không bạn?",
    "Nhìn món ăn thèm quá đi mất!",
    "Đà Lạt lúc nào cũng mộng mơ nhỉ.",
    "Tuyệt vời quá, mình cũng định đi vào tháng sau.",
    "Thích phong cách chụp ảnh của bạn ghê."
  ];

  for (const post of createdPosts) {
    const numComments = Math.floor(Math.random() * 5);
    for (let j = 0; j < numComments; j++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      await prisma.comment.create({
        data: {
          postId: post.id,
          userId: user.id,
          content: sampleComments[Math.floor(Math.random() * sampleComments.length)]
        }
      });
    }
  }

  // 5. Create Likes
  console.log("❤️ Adding some love (likes)...");
  for (const post of createdPosts) {
    const numLikes = Math.floor(Math.random() * 10);
    for (let k = 0; k < numLikes; k++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      try {
        await prisma.postLike.create({
          data: {
            postId: post.id,
            userId: user.id
          }
        });
      } catch (e) {
        // Ignore unique constraint errors
      }
    }
  }

  // 6. Create Friendships
  console.log("🤝 Connecting people...");
  for (let i = 0; i < createdUsers.length; i++) {
    const requester = createdUsers[i];
    const numFriends = 3;
    for (let j = 0; j < numFriends; j++) {
      const addressee = createdUsers[(i + j + 1) % createdUsers.length];
      try {
        await prisma.friendship.create({
          data: {
            requesterId: requester.id,
            addresseeId: addressee.id,
            status: 'accepted'
          }
        });
      } catch (e) {
        // Ignore duplicates
      }
    }
  }

  console.log("✅ Community Data Seeding Finished!");
}

main()
  .catch((e) => {
    console.error("❌ Community Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
