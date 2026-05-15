
import prisma from "../src/config/prismaClient.js";

async function cleanupDestinations() {
  console.log('--- Bắt đầu dọn dẹp và chuẩn hóa Database Destination ---');

  try {
    // 1. Tìm các bản ghi trùng tên trong cùng thành phố
    const allDestinations = await prisma.destination.findMany({
      where: { isDeleted: false }
    });

    const seen = new Map();
    const toDelete = [];

    for (const dest of allDestinations) {
      const key = `${dest.name?.trim().toLowerCase()}_${dest.city?.trim().toLowerCase()}`;
      if (seen.has(key)) {
        // Giữ lại bản ghi có ID nhỏ hơn (thường là bản ghi gốc)
        const existing = seen.get(key);
        toDelete.push(dest.id);
      } else {
        seen.set(key, dest);
      }
    }

    if (toDelete.length > 0) {
      console.log(`- Đang xóa ${toDelete.length} bản ghi trùng lặp...`);
      await prisma.destination.updateMany({
        where: { id: { in: toDelete } },
        data: { isDeleted: true }
      });
    }

    // 2. Chuẩn hóa Duration cho các địa điểm trọng điểm
    const corrections = [
      { name: 'Bà Nà Hills', duration: '6-8 giờ' },
      { name: 'Thánh địa Mỹ Sơn', duration: '3-4 giờ' },
      { name: 'Núi Thần Tài', duration: '4-5 giờ' },
      { name: 'Ngũ Hành Sơn', duration: '2-3 giờ' },
      { name: 'Bán đảo Sơn Trà', duration: '2-3 giờ' },
      { name: 'Đại Nội Huế', duration: '3-4 giờ' },
      { name: 'Phố cổ Hội An', duration: 'Cả ngày' },
      { name: 'Biển Mỹ Khê', duration: '2-3 giờ' },
      { name: 'Bãi biển Mỹ Khê', duration: '2-3 giờ' },
      { name: 'Cù Lao Chàm', duration: '5-6 giờ' }
    ];

    console.log('- Đang cập nhật thời gian tham quan chuẩn...');
    for (const item of corrections) {
      const result = await prisma.destination.updateMany({
        where: {
          name: { contains: item.name },
          isDeleted: false
        },
        data: { duration: item.duration }
      });
      if (result.count > 0) {
        console.log(`  + Cập nhật ${item.name}: ${item.duration}`);
      }
    }

    console.log('\n✅ Hoàn tất dọn dẹp Database!');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình dọn dẹp:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDestinations();
