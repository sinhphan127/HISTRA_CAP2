import tripService from "../services/tripService.js";

/**
 * Controller to handle Trip related requests
 */
export const generateTrip = async (req, res, next) => {
  try {
    const { city, days, travelers, interests } = req.body;

    console.log('[TripController] Generate trip request:', { city, days, travelers, interests });

    if (!city || !days || !travelers) {
      console.warn('[TripController] Missing required fields. Received:', req.body);
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin: địa điểm, số ngày và số người."
      });
    }

    const itinerary = await tripService.generateItinerary({ city, days, travelers, interests });

    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error('[TripController] Error generating trip:', error.message);
    // Pass a structured error so front-end gets a meaningful message
    res.status(500).json({ success: false, message: error.message || 'Không thể tạo lịch trình.' });
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
    const trips = await tripService.getUserTrips(userId);

    res.status(200).json({
      success: true,
      data: trips
    });
  } catch (error) {
    next(error);
  }
};
