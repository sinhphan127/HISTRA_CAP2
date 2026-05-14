import prisma from "../src/config/prismaClient.js";

async function check() {
  const data = await prisma.$queryRaw`SELECT * FROM destinations WHERE destination_id >= 400 LIMIT 20`;
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

check();
