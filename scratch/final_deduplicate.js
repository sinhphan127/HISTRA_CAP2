import prisma from "../src/config/prismaClient.js";

async function finalDeduplicate() {
    console.log("🛠️  Bắt đầu dọn dẹp triệt để các địa điểm trùng tên...");

    try {
        // 1. Lấy tất cả địa điểm không bị xóa
        const allDestinations = await prisma.destination.findMany({
            where: { isDeleted: false },
            orderBy: { id: 'asc' }
        });

        const seen = new Set();
        const toDelete = [];

        for (const dest of allDestinations) {
            // Tạo khóa kết hợp giữa Tên và Tỉnh/Thành phố
            const province = dest.province || dest.city;
            const key = `${dest.name.trim().toLowerCase()}-${province.trim().toLowerCase()}`;

            if (seen.has(key)) {
                // Nếu đã thấy cặp Tên-Tỉnh này rồi, đánh dấu xóa bản ghi hiện tại
                console.log(`❌ Phát hiện trùng: [${dest.name}] tại [${province}] (ID: ${dest.id})`);
                toDelete.push(dest.id);
            } else {
                seen.add(key);
            }
        }

        if (toDelete.length > 0) {
            console.log(`\n🧹 Đang xóa ${toDelete.length} bản ghi trùng lặp...`);
            
            // Thực hiện xóa (dùng updateMany để đánh dấu isDeleted cho an toàn)
            await prisma.destination.updateMany({
                where: { id: { in: toDelete } },
                data: { isDeleted: true }
            });
            
            console.log("✅ Đã dọn dẹp sạch sẽ!");
        } else {
            console.log("✨ Không tìm thấy địa điểm nào bị trùng tên.");
        }

    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        await prisma.$disconnect();
    }
}

finalDeduplicate();
