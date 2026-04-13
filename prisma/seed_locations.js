import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting location data import...");

  // Path to the enriched locations JSON
  const jsonPath = 'c:/Users/vansi/myApp/data/locations.json';
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File not found at ${jsonPath}`);
    return;
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const locations = JSON.parse(rawData);

  console.log(`Found ${locations.length} locations to process.`);

  for (const loc of locations) {
    const { name, city, province, country, description, ticket_price, opening_hours, rating, reviews_count, duration, coordinates, image, category } = loc;

    // Use name and city/province to find existing record
    const existing = await prisma.destination.findFirst({
      where: {
        name: name,
        OR: [
          { city: city },
          { province: province }
        ]
      }
    });

    const data = {
      name,
      province,
      city: city || province,
      country: country || 'Việt Nam',
      description,
      ticketPrice: ticket_price,
      openingHours: opening_hours,
      rating: rating,
      reviewsCount: reviews_count,
      duration: duration,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      imageUrl: image,
      category
    };

    if (existing) {
      console.log(`Updating existing location: ${name}`);
      await prisma.destination.update({
        where: { id: existing.id },
        data
      });
    } else {
      console.log(`Creating new location: ${name}`);
      await prisma.destination.create({
        data
      });
    }
  }

  console.log("Location seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
