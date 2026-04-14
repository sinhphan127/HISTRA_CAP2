import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Full Data Sync from locations.json...');

  // Path tới file locations.json (nằm ở thư viện myApp/data)
  // Lưu ý: Đường dẫn này phụ thuộc vào cấu trúc thư mục của bạn
  // Path tới file locations.json
  const jsonPath = 'c:\\Users\\vansi\\myApp\\data\\locations.json';
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ File not found at ${jsonPath}`);
    return;
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const locations = JSON.parse(rawData);

  console.log(`📦 Found ${locations.length} locations. Upserting into database...`);

  for (const loc of locations) {
    try {
      await prisma.destination.upsert({
        where: { id: loc.id },
        update: {
          name: loc.name,
          province: loc.province,
          city: loc.city,
          description: loc.description,
          ticketPrice: loc.ticket_price,
          openingHours: loc.opening_hours,
          rating: loc.rating,
          reviewsCount: loc.reviews_count,
          duration: loc.duration,
          latitude: loc.coordinates.latitude,
          longitude: loc.coordinates.longitude,
          imageUrl: loc.image,
          category: loc.category,
        },
        create: {
          id: loc.id,
          name: loc.name,
          province: loc.province,
          city: loc.city,
          description: loc.description,
          ticketPrice: loc.ticket_price,
          openingHours: loc.opening_hours,
          rating: loc.rating,
          reviewsCount: loc.reviews_count,
          duration: loc.duration,
          latitude: loc.coordinates.latitude,
          longitude: loc.coordinates.longitude,
          imageUrl: loc.image,
          category: loc.category,
        },
      });
      console.log(`✅ Synced: ${loc.name}`);
    } catch (err) {
      console.error(`❌ Error syncing ${loc.name}:`, err.message);
    }
  }

  console.log('✨ Data Sync Completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
