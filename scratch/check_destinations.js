import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDestinations() {
  const destinations = await prisma.destination.findMany({
    select: { id: true, name: true, city: true, latitude: true, longitude: true }
  });
  console.log(JSON.stringify(destinations, null, 2));
  await prisma.$disconnect();
}

checkDestinations().catch(err => {
  console.error(err);
  process.exit(1);
});
