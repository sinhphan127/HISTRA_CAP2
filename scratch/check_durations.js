
import prisma from "../src/config/prismaClient.js";

async function checkDurations() {
  try {
    const destinations = await prisma.destination.findMany({
      select: {
        id: true,
        name: true,
        duration: true,
        city: true,
        isDeleted: true
      },
      take: 40
    });

    console.log('--- Kiểm tra dữ liệu Duration (gồm isDeleted) ---');
    destinations.forEach(d => {
      const status = d.isDeleted ? '[DELETED]' : '[ACTIVE] ';
      console.log(`${status} ID: ${String(d.id).padEnd(4)} | [${d.city}] ${d.name.padEnd(25)} | Duration: ${d.duration}`);
    });

  } catch (error) {
    console.error('Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDurations();
