import prisma from "../src/config/prismaClient.js";

async function finalize() {
  console.log("Ultimate Name Cleaning (Removing all suffixes)...");

  const destinations = await prisma.destination.findMany();

  let totalUpdated = 0;
  for (const dest of destinations) {
    // Tìm và xóa các phần (số) hoặc (Attraction...) ở cuối tên
    // Ví dụ: "Chùa Cầu Hội An (31)" -> "Chùa Cầu Hội An"
    const cleanedName = dest.name.replace(/\s*\(\d+\)\s*$/, "").replace(/\s*\(Attraction\d+\)\s*$/, "").trim();

    if (cleanedName !== dest.name) {
      await prisma.destination.update({
        where: { id: dest.id },
        data: { name: cleanedName }
      });
      totalUpdated++;
    }
  }

  console.log(`Successfully polished ${totalUpdated} destination names.`);
  process.exit(0);
}

finalize();
