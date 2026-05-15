import prisma from "../src/config/prismaClient.js";

async function cleanupAndDiversify() {
    console.log("🧹 Bắt đầu dọn dẹp và đa dạng hóa dữ liệu...");

    const secondOptions = {
        "Cà Mau": "Hòn Đá Bạc",
        "Sóc Trăng": "Chùa Chén Kiểu",
        "Bạc Liêu": "Nhà Công tử Bạc Liêu",
        "Cần Thơ": "Chợ nổi Cái Răng",
        "An Giang": "Miếu Bà Chúa Xứ Núi Sam",
        "Kiên Giang": "Hòn Phụ Tử",
        "Đồng Tháp": "Làng hoa Sa Đéc",
        "Lâm Đồng": "Hồ Tuyền Lâm",
        "Đà Nẵng": "Bán đảo Sơn Trà",
        "Quảng Nam": "Thánh địa Mỹ Sơn",
        "Thừa Thiên Huế": "Chùa Thiên Mụ",
        "Lào Cai": "Bản Cát Cát",
        "Hà Giang": "Đèo Mã Pí Lèng",
        "Ninh Bình": "Cố đô Hoa Lư",
        "Quảng Ninh": "Đảo Tuần Châu",
        "Bình Thuận": "Đảo Phú Quý",
        "Khánh Hòa": "Tháp Bà Ponagar",
        "Vũng Tàu": "Bãi Sau Vũng Tàu"
    };

    try {
        // 1. Lấy tất cả địa điểm để kiểm tra trùng lặp
        const allDestinations = await prisma.destination.findMany({
            where: { isDeleted: false },
            orderBy: { id: 'asc' }
        });

        const seen = new Set();
        const toDelete = [];
        const toUpdate = [];

        for (const dest of allDestinations) {
            const key = `${dest.name}-${dest.province || dest.city}`;
            
            if (seen.has(key)) {
                // Nếu thấy trùng tên trong cùng tỉnh
                const province = dest.province || dest.city;
                const secondPlace = secondOptions[province];

                if (secondPlace && !allDestinations.find(d => d.name === secondPlace && (d.province === province || d.city === province))) {
                    // Nếu có lựa chọn thứ 2 và nó chưa tồn tại, hãy đổi tên thay vì xóa
                    console.log(`✨ Đa dạng hóa: [${dest.name}] -> [${secondPlace}] tại ${province}`);
                    toUpdate.push({ id: dest.id, newName: secondPlace });
                    seen.add(`${secondPlace}-${province}`);
                } else {
                    // Nếu không có lựa chọn khác hoặc đã tồn tại, hãy xóa (đánh dấu isDeleted)
                    console.log(`🗑️  Xóa trùng lặp: ${dest.name} (${province})`);
                    toDelete.push(dest.id);
                }
            } else {
                seen.add(key);
            }
        }

        // Thực hiện cập nhật
        for (const item of toUpdate) {
            await prisma.destination.update({
                where: { id: item.id },
                data: { name: item.newName, description: `Địa danh khám phá thú vị tại ${item.newName}.` }
            });
        }

        // Thực hiện xóa
        if (toDelete.length > 0) {
            await prisma.destination.updateMany({
                where: { id: { in: toDelete } },
                data: { isDeleted: true }
            });
        }

        console.log(`🏁 Xong! Đã đa dạng hóa ${toUpdate.length} điểm và xóa ${toDelete.length} điểm trùng.`);
        console.log("💡 Bây giờ bạn có thể chạy lại script upgrade_destinations.js để lấy GPS cho các điểm mới này.");

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupAndDiversify();
