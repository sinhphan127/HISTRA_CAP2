import prisma from "../src/config/prismaClient.js";

async function getFailedDestinations() {
    try {
        const failed = await prisma.destination.findMany({
            where: {
                isDeleted: false,
                latitude: 15.01 // Giả định đây là tọa độ mặc định bị lỗi
            },
            select: {
                id: true,
                name: true,
                city: true,
                province: true
            }
        });
        console.log(JSON.stringify(failed, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

getFailedDestinations();
