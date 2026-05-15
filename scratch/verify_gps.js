import prisma from "../src/config/prismaClient.js";

async function verifyBigCitiesGPS() {
    const bigCities = ["Thừa Thiên Huế", "Hồ Chí Minh", "Lâm Đồng", "Hà Nội", "Đà Nẵng", "Quảng Nam"];
    
    console.log("🔍 Đang kiểm tra chất lượng GPS tại các thành phố lớn...");

    try {
        const issues = await prisma.destination.findMany({
            where: {
                isDeleted: false,
                OR: [
                    { province: { in: bigCities } },
                    { city: { in: bigCities } }
                ],
                latitude: 15.01 
            },
            select: {
                id: true,
                name: true,
                province: true,
                city: true
            }
        });

        if (issues.length > 0) {
            console.log(`⚠️  Phát hiện ${issues.length} địa điểm tại các thành phố lớn chưa có tọa độ chuẩn.`);
            issues.forEach(i => console.log(`- ${i.name} (${i.province || i.city})`));
        } else {
            console.log("✅ Tuyệt vời! Tất cả địa điểm tại các thành phố lớn đã có tọa độ khác 15.01.");
        }

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyBigCitiesGPS();
