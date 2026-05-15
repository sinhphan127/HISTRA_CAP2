import prisma from "../src/config/prismaClient.js";

async function showStats() {
    console.log("📊 Thống kê số lượng địa điểm du lịch theo tỉnh thành:");
    
    try {
        const stats = await prisma.destination.groupBy({
            by: ['province'],
            where: { isDeleted: false },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        });

        console.log("-----------------------------------------");
        console.log("| Tỉnh thành            | Số địa điểm |");
        console.log("-----------------------------------------");
        stats.forEach(s => {
            const name = (s.province || "Không xác định").padEnd(21);
            console.log(`| ${name} | ${s._count.id.toString().padEnd(11)} |`);
        });
        console.log("-----------------------------------------");
        
        const total = stats.reduce((sum, s) => sum + s._count.id, 0);
        console.log(`🚀 TỔNG CỘNG: ${total} địa điểm du lịch độc nhất.`);

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

showStats();
