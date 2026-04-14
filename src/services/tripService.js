import prisma from "../config/prismaClient.js";
import geminiService from "./geminiService.js";

/**
 * Service to handle Trip (Itinerary) business logic
 */
const tripService = {
  /**
   * Generates an itinerary using AI and returns it for user review
   */
  async generateItinerary({ city, days, travelers, interests = [] }) {
    // 1. Lấy dữ liệu điểm đến tại thành phố đó để làm ngữ cảnh cho AI
    const destinations = await prisma.destination.findMany({
      where: {
        OR: [
          { city: { contains: city, mode: 'insensitive' } },
          { province: { contains: city, mode: 'insensitive' } }
        ],
        isDeleted: false
      },
      take: 15
    });

    // 2. Gọi Gemini để tạo lịch trình
    const itinerary = await geminiService.generateItinerary({
      city,
      days,
      travelers,
      destinations,
      interests
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
            foodCost: costBreakdown.food || 0,
            transportCost: costBreakdown.transport || 0,
            hotelCost: costBreakdown.accommodation || 0
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
          where: { name: { contains: slot.locationName, mode: 'insensitive' } }
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
