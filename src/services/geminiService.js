
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiService = {
  /**
   * Generates a travel itinerary using Gemini AI
   */
  async generateItinerary({ city, days, travelers, destinations, interests = [], budget = null }) {
    console.log(`[GeminiService] === Generation ===`);
    console.log(`[GeminiService] City: ${city} | Days: ${days} | Travelers: ${travelers}`);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-lite-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const placeList = destinations.map(d => {
      const price = d.ticketPrice ? Number(d.ticketPrice) : 0;
      return `${d.id}|${d.name}|${price * travelers}VND|${d.address || d.province}`;
    }).join('\n');

    const budgetText = budget ? `Budget: ${Number(budget).toLocaleString('vi-VN')}VND total.` : '';
    const interestText = interests.length > 0 ? `Interests: ${interests.join(', ')}.` : '';

    const prompt = `You are a professional travel planner API for HISTRA. 
Return ONLY valid JSON.
Task: Create a ${days}-day detailed trip in ${city} for ${travelers} people.
${budgetText} ${interestText}

Available Places (id|name|totalCost|address): 
${placeList}

Rules:
1. Each day SHOULD have 3-4 activities (Morning, Afternoon, Late Afternoon, Evening).
2. Each location from the list MUST appear ONLY ONCE in the whole trip. NO REPETITION.
3. Use ONLY places from the list above. Do NOT hallucinate new places.
4. estimatedCost = totalCost from list (already includes travelers).
5. totalEstimatedCost = sum of all estimatedCost in the entire trip.
6. Time slots should be logical and realistic (e.g., 08:30, 11:30, 15:00, 19:30).
7. "reasoning" MUST be a compelling, professional reason in Vietnamese (approx 15-20 words) explaining why this place fits the time slot or interests.
8. If interests are provided, prioritize places that match them.
9. Group nearby locations together in the same day to minimize travel time.

JSON structure:
{
  "title": "Chuyến đi ${city} ${days} ngày",
  "city": "${city}",
  "totalEstimatedCost": 0,
  "currency": "VND",
  "days": [
    {
      "day": 1,
      "itinerary": [
        {"timeSlot": "08:00", "locationId": 1, "locationName": "Place A", "locationAddress": "Address A", "activity": "Tham quan", "estimatedCost": 50000, "reasoning": "..."},
        ...
      ]
    }
  ]
}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || text.match(/{[\s\S]*}/);
      let jsonText = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : text;

      let resultJson = JSON.parse(jsonText.trim());
      
      // Post-process to sync with DB data
      let actualTotalCost = 0;
      resultJson.days.forEach(day => {
        day.itinerary.forEach(item => {
          const dbPlace = destinations.find(d => d.id === item.locationId || d.name === item.locationName);
          if (dbPlace) {
            item.estimatedCost = (dbPlace.ticketPrice ? Number(dbPlace.ticketPrice) : 0) * travelers;
            item.locationName = dbPlace.name;
            item.locationAddress = dbPlace.address || `${dbPlace.name}, ${dbPlace.province}`;
          }
          actualTotalCost += (item.estimatedCost || 0);
        });
      });
      resultJson.totalEstimatedCost = actualTotalCost;

      return resultJson;
    } catch (error) {
      console.error('[GeminiService] ERROR:', error.message);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  },

  /**
   * Chat with the travel bot using Gemini
   */
  async chatWithBot({ itinerary, messages }) {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
    
    const summary = (itinerary.days || []).map(d =>
      `Day ${d.day}: ` + (d.itinerary || []).map(i => i.locationName).join(', ')
    ).join(' | ');

    const lastMessage = messages[messages.length - 1]?.content || '';

    const prompt = `You are HISTRA Guide, a Vietnamese travel assistant. 
Trip context: ${summary}
User question: "${lastMessage}"
Answer in Vietnamese, be helpful and polite, max 3 sentences.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      throw new Error(`Gemini Chat error: ${error.message}`);
    }
  },

  /**
   * Generates history snippet using Gemini
   */
  async generateHistory(locationName) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Viết 2-3 câu ngắn về lịch sử và đặc điểm của "${locationName}" tại Việt Nam. Trả lời bằng tiếng Việt.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return `Chưa có thông tin chi tiết cho ${locationName}.`;
    }
  }
};

export default geminiService;
