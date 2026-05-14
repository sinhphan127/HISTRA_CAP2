import prisma from "../src/config/prismaClient.js";

const coords = {
  "Bà Nà Hills": { lat: 15.9984, lng: 107.9947 },
  "Cầu Rồng": { lat: 16.0611, lng: 108.2274 },
  "Bãi biển Mỹ Khê": { lat: 16.0645, lng: 108.2434 },
  "Ngũ Hành Sơn": { lat: 16.0029, lng: 108.2618 },
  "Bán đảo Sơn Trà": { lat: 16.1158, lng: 108.2736 },
  "Chùa Linh Ứng Sơn Trà": { lat: 16.1001, lng: 108.2778 },
  "Chợ Hàn": { lat: 16.0684, lng: 108.2241 },
  "Bảo tàng Chăm": { lat: 16.0618, lng: 108.2224 },
  "Cầu Tình Yêu sông Hàn": { lat: 16.0664, lng: 108.2284 },
  "Làng đá mỹ nghệ Non Nước": { lat: 15.9992, lng: 108.2608 }
};

async function updateCoords() {
  console.log("Updating coordinates...");
  for (const [name, pos] of Object.entries(coords)) {
    await prisma.destination.updateMany({
      where: { name: name },
      data: {
        latitude: pos.lat.toString(),
        longitude: pos.lng.toString()
      }
    });
    console.log(`Updated ${name}`);
  }
  console.log("Done!");
  process.exit(0);
}

updateCoords();
