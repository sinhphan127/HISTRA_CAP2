
import ollamaService from './ollamaService.js';
import geminiService from './geminiService.js';
import dotenv from 'dotenv';

dotenv.config();

const provider = process.env.AI_PROVIDER || 'ollama';

const aiService = {
  /**
   * Generates itinerary using selected provider
   */
  async generateItinerary(params) {
    console.log(`[AIService] Provider: ${provider}`);
    if (provider === 'gemini') {
      return await geminiService.generateItinerary(params);
    }
    return await ollamaService.generateItinerary(params);
  },

  /**
   * Chat using selected provider
   */
  async chatWithBot(params) {
    console.log(`[AIService] Chat provider: ${provider}`);
    if (provider === 'gemini') {
      return await geminiService.chatWithBot(params);
    }
    return await ollamaService.chatWithBot(params);
  },

  /**
   * Generates a brief history for a location using selected provider
   */
  async generateHistory(locationName) {
    try {
      if (provider === 'gemini') {
        return await geminiService.generateHistory(locationName);
      }
      return await ollamaService.generateHistory(locationName);
    } catch (err) {
      console.error(`[AIService] Failed to generate history with ${provider}:`, err);
      return `Chưa có thông tin lịch sử chi tiết cho ${locationName}.`;
    }
  }
};

export default aiService;
