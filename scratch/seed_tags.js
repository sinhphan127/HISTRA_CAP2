import prisma from "../src/config/prismaClient.js";

const DEFAULT_TAGS = [
  "Khám phá", "Mạo hiểm", "Nghỉ dưỡng", "Ẩm thực", "Sống ảo", 
  "Lịch sử", "Văn hóa", "Tâm linh", "Chill", "Gia đình", 
  "Mua sắm", "Thiên nhiên", "Biển đảo", "Núi rừng", "Kiến trúc"
];

async function seedTags() {
  console.log("🚀 Bắt đầu nạp dữ liệu Tag mẫu...");
  
  try {
    for (const tagName of DEFAULT_TAGS) {
      const existing = await prisma.activityTag.findFirst({
        where: { name: tagName }
      });

      if (!existing) {
        await prisma.activityTag.create({
          data: { name: tagName }
        });
        console.log(`✅ Đã thêm Tag: ${tagName}`);
      } else {
        console.log(`ℹ️ Tag đã tồn tại: ${tagName}`);
      }
    }
    
    console.log("✨ Hoàn tất nạp dữ liệu Tag!");
  } catch (error) {
    console.error("❌ Lỗi khi nạp Tag:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTags();
