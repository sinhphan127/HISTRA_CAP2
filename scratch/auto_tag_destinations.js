import prisma from "../src/config/prismaClient.js";

async function autoTagDestinations() {
  console.log("🚀 Bắt đầu phân loại tự động địa điểm...");
  
  try {
    const destinations = await prisma.destination.findMany({
      where: { isDeleted: false }
    });

    for (const dest of destinations) {
      let category = "Khám phá"; // Mặc định
      const name = dest.name.toLowerCase();

      if (name.includes("biển") || name.includes("vịnh") || name.includes("đảo") || name.includes("bãi")) {
        category = "Biển đảo";
      } else if (name.includes("chùa") || name.includes("nhà thờ") || name.includes("đền") || name.includes("miếu")) {
        category = "Tâm linh";
      } else if (name.includes("bảo tàng") || name.includes("di tích") || name.includes("cố đô") || name.includes("thành")) {
        category = "Lịch sử";
      } else if (name.includes("núi") || name.includes("đỉnh") || name.includes("rừng") || name.includes("vườn quốc gia")) {
        category = "Thiên nhiên";
      } else if (name.includes("chợ") || name.includes("ẩm thực") || name.includes("nhà hàng")) {
        category = "Ẩm thực";
      } else if (name.includes("resort") || name.includes("khách sạn") || name.includes("villa")) {
        category = "Nghỉ dưỡng";
      } else if (name.includes("trung tâm văn hóa") || name.includes("nhà hát")) {
        category = "Văn hóa";
      }

      await prisma.destination.update({
        where: { id: dest.id },
        data: { category }
      });
    }
    
    console.log("✨ Đã cập nhật category (Tag chính) cho toàn bộ địa điểm!");
  } catch (error) {
    console.error("❌ Lỗi khi phân loại:", error);
  } finally {
    await prisma.$disconnect();
  }
}

autoTagDestinations();
