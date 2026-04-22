import prisma from "../config/prismaClient.js";
import ollamaService from "./ollamaService.js";

/**
 * Service to handle Trip (Itinerary) business logic
 */
const tripService = {
  /**
   * Generates an itinerary using AI and returns it for user review
   */
  async generateItinerary({ city, days, travelers, interests = [], budget = null }) {
    console.log(`[TripService] RAG Step 1 — Filter DB: city="${city}", interests=[${interests}]`);

    // ── RAG Step 1: Search DB — KHÔNG gửi toàn bộ DB vào Qwen ─────────────
    // Chỉ lấy địa điểm liên quan đến city + interests → Top 20
    const destinations = await prisma.destination.findMany({
      where: {
        AND: [
          {
            OR: [
              { city:     { contains: city } },
              { province: { contains: city } }
            ]
          },
          { isDeleted: false },
          // Filter theo interests nếu user cung cấp
          ...(interests?.length > 0
            ? [{ category: { in: interests } }]
            : []
          )
        ]
      },
      orderBy: { rating: 'desc' },
      take: 20
    });

    console.log(`[TripService] RAG Step 1 — Found ${destinations.length} places from DB`);

    // Nếu filter interests quá chặt → fallback không filter category
    const rawDestinations = destinations.length >= 3
      ? destinations
      : await prisma.destination.findMany({
          where: {
            OR: [
              { city:     { contains: city } },
              { province: { contains: city } }
            ],
            isDeleted: false
          },
          orderBy: { rating: 'desc' },
          take: 20
        });

    // Loại bỏ địa điểm trùng tên (seed data bị duplicate)
    const seen = new Set();
    const finalDestinations = rawDestinations.filter(d => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });

    console.log(`[TripService] RAG Step 2 — Sending ${finalDestinations.length} unique places to Qwen`);

    // ── RAG Step 2: Gửi Top Places vào Qwen để reasoning ──────────────────
    const itinerary = await ollamaService.generateItinerary({
      city,
      days,
      travelers,
      destinations: finalDestinations,
      interests,
      budget
    });

    return itinerary;
  },


  /**
   * Saves a generated trip to the database
   */
  async saveTrip(userId, tripData) {
    const { title, city, costBreakdown, totalEstimatedCost, days } = tripData;

    // 1. Tạo Trip record
    const trip = await prisma.trip.create({
      data: {
        userId,
        title,
        city,
        budget: totalEstimatedCost,
        status: 'PLANNED',
        // Cost breakdown records
        costEstimations: {
          create: {
            foodCost: costBreakdown?.food || 0,
            ticketCost: costBreakdown?.transport || 0,   // schema dùng ticketCost, không phải transportCost
            hotelCost: costBreakdown?.accommodation || 0,
            totalCost: totalEstimatedCost || 0
          }
        }
      }
    });

    // 2. Tạo TripLocations cho mỗi ngày
    for (const day of days) {
      for (let i = 0; i < day.itinerary.length; i++) {
        const slot = day.itinerary[i];
        
        // Tìm destinationId nếu có trong DB
        const destination = await prisma.destination.findFirst({
          where: { name: { contains: slot.locationName } }
        });

        await prisma.tripLocation.create({
          data: {
            tripId: trip.id,
            destinationId: destination ? destination.id : null,
            dayNumber: day.day,
            visitOrder: i + 1,
            // Ở đây có thể lưu thêm activity/reasoning vào một bảng meta hoặc description
          }
        });
      }
    }

    return trip;
  },

  async getUserTrips(userId) {
    return await prisma.trip.findMany({
      where: { userId },
      include: {
        tripLocations: {
          include: { destination: true }
        },
        costEstimations: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};

export default tripService;
