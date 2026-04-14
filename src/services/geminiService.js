import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Service to handle interactions with Gemini AI
 */
const geminiService = {
  /**
   * Generates a travel itinerary based on user input and available destinations
   * @param {Object} params - { city, days, travelers, destinations, interests }
   */
  async generateItinerary({ city, days, travelers, destinations, interests = [] }) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY chưa được cấu hình trong .env");
      }

      console.log(`[GeminiService] Generating itinerary for: ${city}, ${days} days, ${travelers} travelers`);
      console.log(`[GeminiService] Using API key: ${process.env.GEMINI_API_KEY?.substring(0, 10)}...`);

      // Use gemini-flash-latest as it is currently supported and works with the provided API key
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `
        You are a professional Vietnamese travel assistant. 
        Generate a detailed travel itinerary for ${city} for ${days} days and ${travelers} travelers.
        Assume the user is already stay at a hotel in ${city}, so do NOT include long-distance transport between cities.
        User interests: ${interests.join(', ') || 'General tourism'}.
        
        Available locations in our database (prioritize these):
        ${destinations.map(d => `- ${d.name}: ${d.description} (Category: ${d.category})`).join('\n')}
        
        Requirements:
        1. Output in JSON format only. No markdown. No explanation.
        2. Divide each day into "Morning", "Afternoon", and "Evening" slots.
        3. Prioritize locations that match the user interests: ${interests.join(', ')}.
        4. Include a "costEstimation" object with fields: accommodation, food. (Do NOT include transport).
        5. Include a "reasoning" for each location choice explaining why it matches the selected interests.
        6. Language: Vietnamese for content, English for JSON keys.
        
        Format:
        {
          "title": "Hành trình khám phá...",
          "totalEstimatedCost": 3500000,
          "costBreakdown": { "accommodation": 2200000, "food": 1300000 },
          "days": [
            {
              "day": 1,
              "itinerary": [
                { "timeSlot": "Morning", "locationName": "...", "activity": "...", "reasoning": "...", "tags": ["#Popular", "#Nature"] },
                { "timeSlot": "Afternoon", "locationName": "...", "activity": "...", "reasoning": "...", "tags": ["#Food"] },
                { "timeSlot": "Evening", "locationName": "...", "activity": "...", "reasoning": "...", "tags": ["#Relax"] }
              ]
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      console.log(`[GeminiService] Raw response (first 200 chars): ${text.substring(0, 200)}`);
      
      // Clean up markdown code blocks if Gemini returns them
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      return JSON.parse(text);
    } catch (error) {
      // Log the ACTUAL Gemini error, not a generic message
      console.error("[GeminiService] FULL ERROR:", error);
      console.error("[GeminiService] Error message:", error.message);
      if (error.status) console.error("[GeminiService] HTTP Status:", error.status);
      throw new Error(`Gemini API lỗi: ${error.message}`);
    }
  }
};

export default geminiService;
