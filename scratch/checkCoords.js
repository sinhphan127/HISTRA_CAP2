import prisma from "../src/config/prismaClient.js";

async function checkCoords() {
  const danangDestinations = await prisma.destination.findMany({
    where: {
      province: { contains: 'Đà Nẵng' }
    },
    select: {
      name: true,
      latitude: true,
      longitude: true
    }
  });

  console.log("Đà Nẵng Destinations:");
  danangDestinations.forEach(d => {
    console.log(`- ${d.name}: lat=${d.latitude}, lng=${d.longitude}`);
  });
  
  process.exit(0);
}

checkCoords();
