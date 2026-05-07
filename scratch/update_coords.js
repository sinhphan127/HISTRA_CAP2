import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const coords = {
  "Bà Nà Hills": [15.9989, 107.9960],
  "Cầu Rồng": [16.0611, 108.2268],
  "Bãi biển Mỹ Khê": [16.0652, 108.2467],
  "Ngũ Hành Sơn": [15.9997, 108.2635],
  "Bán đảo Sơn Trà": [16.1213, 108.2778],
  "Chùa Linh Ứng Sơn Trà": [16.1001, 108.2775],
  "Chợ Hàn": [16.0682, 108.2245],
  "Bảo tàng Chăm": [16.0610, 108.2215],
  "Cầu Tình Yêu sông Hàn": [16.0615, 108.2248],
  "Làng đá mỹ nghệ Non Nước": [15.9990, 108.2630],
  "Phố cổ Hội An": [15.8771, 108.3260],
  "Chùa Cầu Hội An": [15.8771, 108.3256],
  "Làng rau Trà Quế": [15.9015, 108.3375],
  "Bãi biển An Bàng": [15.9124, 108.3422],
  "Rừng dừa Bảy Mẫu": [15.8645, 108.3692],
  "Đại Nội Huế": [16.4674, 107.5779],
  "Lăng Tự Đức": [16.4328, 107.5658],
  "Chùa Thiên Mụ": [16.4526, 107.5450],
  "Sông Hương": [16.4611, 107.5939],
  "Chợ Đông Ba": [16.4682, 107.5939],
  "Hồ Hoàn Kiếm": [21.0285, 105.8521],
  "Văn Miếu - Quốc Tử Giám": [21.0285, 105.8355],
  "Lăng Chủ Tịch Hồ Chí Minh": [21.0367, 105.8347],
  "Phố cổ Hà Nội": [21.0333, 105.8500],
  "Chợ Bến Thành": [10.7719, 106.6983],
  "Phố đi bộ Nguyễn Huệ": [10.7741, 106.7031],
  "Bảo tàng Chứng tích Chiến tranh": [10.7795, 106.6921],
  "Địa đạo Củ Chi": [11.0601, 106.5249]
};

async function updateCoords() {
  const destinations = await prisma.destination.findMany();
  let updatedCount = 0;

  for (const dest of destinations) {
    if (coords[dest.name]) {
      await prisma.destination.update({
        where: { id: dest.id },
        data: {
          latitude: coords[dest.name][0],
          longitude: coords[dest.name][1]
        }
      });
      updatedCount++;
      console.log(`Updated: ${dest.name}`);
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} destinations!`);
  await prisma.$disconnect();
}

updateCoords().catch(console.error);
