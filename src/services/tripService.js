import prisma from "../config/prismaClient.js";
import aiService from "./aiService.js";

/**
 * Service to handle Trip (Itinerary) business logic
 */
const tripService = {
  /**
   * Generates an itinerary using AI and returns it for user review
   */
  async generateItinerary({ city, days, travelers, interests = [], budget = null }) {
    console.log(`[TripService] RAG Step 1 — Filter DB: city="${city}", interests=[${interests}]`);

    // ── RAG Step 1: Search DB — KHÔNG gửi toàn bộ DB vào AI ─────────────
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

    console.log(`[TripService] RAG Step 2 — Sending ${finalDestinations.length} unique places to AI`);

    // ── RAG Step 2: Gửi Top Places vào AI để reasoning ──────────────────
    const itinerary = await aiService.generateItinerary({
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
        
        // Tìm destinationId nếu có trong DB (Khớp tên chính xác hơn)
        const destination = await prisma.destination.findFirst({
          where: { 
            city: { contains: city },
            name: { contains: slot.locationName || slot.location } 
          }
        });

        await prisma.tripLocation.create({
          data: {
            tripId: trip.id,
            destinationId: destination ? destination.id : null,
            dayNumber: day.day,
            visitOrder: i + 1,
            // Lưu nội dung AI đã sinh ra để hiển thị fallback khi không khớp CSDL
            startTime: slot.timeSlot || slot.time || "08:00",
            locationName: slot.locationName || slot.location || "Địa điểm mới",
            activity: slot.activity || "Tham quan",
            reasoning: slot.reasoning || ""
          }
        });
      }
    }

    // 3. Save AI Chat history if available
    if (tripData.chatMessages && Array.isArray(tripData.chatMessages) && tripData.chatMessages.length > 0) {
      await prisma.aiConversation.create({
        data: {
          userId,
          tripId: trip.id,
          title: `Thảo luận chuyến đi ${city}`,
          aiMessages: {
            create: tripData.chatMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          }
        }
      });
    }

    // 3. Trả về toàn bộ dữ liệu trip đã lưu kèm theo locations để frontend không bị mất dữ liệu
    const fullTrip = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: {
        tripLocations: {
          include: { destination: true },
          orderBy: [
            { dayNumber: 'asc' },
            { visitOrder: 'asc' }
          ]
        },
        costEstimations: true
      }
    });

    return fullTrip;
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
  },

  /**
   * Appends new chat messages to an existing conversation
   */
  async appendChatHistory(userId, tripId, userContent, botContent) {
    let conversation = await prisma.aiConversation.findFirst({
      where: { tripId }
    });

    if (!conversation) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      conversation = await prisma.aiConversation.create({
        data: {
          userId,
          tripId,
          title: `Thảo luận chuyến đi ${trip ? trip.city : 'mới'}`
        }
      });
    }

    await prisma.aiMessage.createMany({
      data: [
        { aiConversationId: conversation.id, role: 'user', content: userContent },
        { aiConversationId: conversation.id, role: 'assistant', content: botContent }
      ]
    });
  },

  /**
   * Gets the currently active (ONGOING) trip for a user
   */
  async getActiveTrip(userId) {
    return await prisma.trip.findFirst({
      where: {
        userId,
        status: 'ONGOING'
      },
      include: {
        tripLocations: {
          include: { destination: true },
          orderBy: [
            { dayNumber: 'asc' },
            { visitOrder: 'asc' }
          ]
        },
        costEstimations: true
      }
    });
  },

  /**
   * Sets a trip status to ONGOING
   */
  async startTrip(userId, tripId) {
    // Optional: Mark any other ONGOING trips as PLANNED/COMPLETED first
    await prisma.trip.updateMany({
      where: { userId, status: 'ONGOING' },
      data: { status: 'PLANNED' }
    });

    return await prisma.trip.update({
      where: { id: tripId },
      data: { status: 'ONGOING' }
    });
  },

  /**
   * Sets a trip status to COMPLETED
   */
  async completeTrip(tripId) {
    return await prisma.trip.update({
      where: { id: parseInt(tripId) },
      data: { status: 'COMPLETED' }
    });
  },

  /**
   * Marks a location in a trip as visited
   */
  async markLocationVisited(locationId, isVisited = true) {
    return await prisma.tripLocation.update({
      where: { id: parseInt(locationId) },
      data: {
        isVisited,
        visitedAt: isVisited ? new Date() : null
      }
    });
  }
};

export default tripService;
