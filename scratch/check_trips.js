import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- DANH SÁCH 5 CHUYẾN ĐI MỚI NHẤT ---');
  const trips = await prisma.trip.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      city: true,
      createdAt: true,
      status: true
    }
  });

  if (trips.length === 0) {
    console.log('Chưa có chuyến đi nào được lưu trong database.');
  } else {
    trips.forEach(t => {
      console.log(`[ID: ${t.id}] ${t.title} - ${t.city} (${t.status}) - Tạo lúc: ${t.createdAt}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
