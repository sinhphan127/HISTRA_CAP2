import tripService from "../services/tripService.js";
import aiService from "../services/aiService.js";
import * as googleTTS from 'google-tts-api';
import prisma from "../config/prismaClient.js";

/**
 * Controller to handle Trip related requests
 */
export const generateTrip = async (req, res, next) => {
  try {
    const { city, days, travelers, interests, budget } = req.body;

    console.log('[TripController] Generate trip request:', { city, days, travelers, interests, budget });

    if (!city || !days || !travelers) {
      console.warn('[TripController] Missing required fields. Received:', req.body);
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin: địa điểm, số ngày và số người."
      });
    }

    const itinerary = await tripService.generateItinerary({ city, days, travelers, interests, budget });

    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error('[TripController] Error generating trip:', error.message);
    res.status(500).json({ success: false, message: 'Không thể tạo lịch trình lúc này. Vui lòng thử lại sau.' });
  }
};

export const saveTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tripData = req.body;

    const trip = await tripService.saveTrip(userId, tripData);

    res.status(201).json({
      success: true,
      message: "Lịch trình đã được lưu thành công!",
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTrips = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        tripLocations: {
          include: { destination: true },
          orderBy: [
            { dayNumber: 'asc' },
            { visitOrder: 'asc' }
          ]
        },
        costEstimations: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: trips
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(tripId) },
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

    if (!trip) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chuyến đi." });
    }

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

export const chatItinerary = async (req, res, next) => {
  try {
    const { itinerary, messages } = req.body;

    if (!itinerary || !messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp lịch trình và danh sách tin nhắn hợp lệ."
      });
    }

    const reply = await aiService.chatWithBot({ itinerary, messages });

    // Lưu vào DB nếu chuyến đi đã được lưu (có itinerary.id)
    if (itinerary.id) {
      const userId = req.user.id;
      const latestUserMsg = messages[messages.length - 1];
      if (latestUserMsg && latestUserMsg.role === 'user') {
        await tripService.appendChatHistory(userId, itinerary.id, latestUserMsg.content, reply);
      }
    }

    res.status(200).json({
      success: true,
      data: reply
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trip = await tripService.getActiveTrip(userId);

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

export const startTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const trip = await tripService.startTrip(userId, parseInt(tripId));

    res.status(200).json({
      success: true,
      message: "Bắt đầu chuyến đi thành công!",
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

export const markLocationVisited = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const { isVisited } = req.body;

    const updated = await tripService.markLocationVisited(locationId, isVisited);

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const completeTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await tripService.completeTrip(tripId);

    res.status(200).json({
      success: true,
      message: "Chúc mừng! Bạn đã hoàn thành chuyến đi.",
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

export const getLocationHistoryAudio = async (req, res, next) => {
  try {
    const { locationName } = req.query;
    if (!locationName) {
      return res.status(400).json({ success: false, message: "Missing locationName" });
    }

    // 1. Dùng AI sinh đoạn lịch sử ngắn gọn
    let historyText = await aiService.generateHistory(locationName);

    // google-tts-api giới hạn 200 ký tự mỗi request, ta cắt bớt nếu AI sinh quá dài
    if (historyText.length > 200) {
      historyText = historyText.substring(0, 197) + "...";
    }

    // 2. Lấy link Audio chất lượng cao qua google-tts-api
    const url = googleTTS.getAudioUrl(historyText, {
      lang: 'vi',
      slow: false,
      host: 'https://translate.google.com',
    });

    res.status(200).json({
      success: true,
      data: {
        text: historyText,
        audioUrl: url
      }
    });
  } catch (error) {
    console.error('[TripController] TTS Error:', error);
    res.status(500).json({ success: false, message: "Không thể tạo Audio." });
  }
};
