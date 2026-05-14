import prisma from "../src/config/prismaClient.js";

async function count() {
  const counts = await prisma.destination.groupBy({
    by: ['province'],
    _count: {
      id: true
    },
    where: { isDeleted: false }
  });

  console.log("--- DESTINATION COUNTS PER PROVINCE ---");
  counts.forEach(c => {
    console.log(`${c.province}: ${c._count.id} locations`);
  });
  
  process.exit(0);
}

count();
