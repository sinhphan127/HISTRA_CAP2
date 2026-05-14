import ollamaService from './ollamaService.js';
import geminiService from './geminiService.js';
import dotenv from 'dotenv';

dotenv.config();

// Đổi 'ollama' ↔ 'gemini' tùy ý. Gemini hỏng → tự fallback Ollama
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

const aiService = {
  /**
   * Generates itinerary using the selected provider.
   * Tự động fallback sang Ollama nếu Gemini bị lỗi quota/rate limit.
   */
  async generateItinerary(params) {
    if (AI_PROVIDER === 'ollama') {
      console.log(`[AIService] Provider: ollama`);
      return await ollamaService.generateItinerary(params);
    }

    // Thử Gemini trước
    try {
      console.log(`[AIService] Provider: gemini`);
      return await geminiService.generateItinerary(params);
    } catch (err) {
      const isQuotaOrRate = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('rate');
      if (isQuotaOrRate) {
        console.warn(`[AIService] ⚠️  Gemini quota hết — tự động chuyển sang Ollama...`);
        return await ollamaService.generateItinerary(params);
      }
      throw err; // Lỗi khác thì báo lên
    }
  },

  /**
   * Chat using the selected provider. Fallback tương tự.
   */
  async chatWithBot(params) {
    if (AI_PROVIDER === 'ollama') {
      console.log(`[AIService] Chat provider: ollama`);
      return await ollamaService.chatWithBot(params);
    }

    try {
      console.log(`[AIService] Chat provider: gemini`);
      return await geminiService.chatWithBot(params);
    } catch (err) {
      const isQuotaOrRate = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('rate');
      if (isQuotaOrRate) {
        console.warn(`[AIService] ⚠️  Gemini quota hết — tự động chuyển sang Ollama (chat)...`);
        return await ollamaService.chatWithBot(params);
      }
      throw err;
    }
  },

  /**
   * Generates a brief history for a location
   */
  async generateHistory(locationName) {
    if (AI_PROVIDER === 'ollama') {
      try {
        return await ollamaService.generateHistory(locationName);
      } catch (err) {
        return `Chưa có thông tin lịch sử chi tiết cho ${locationName}.`;
      }
    }

    try {
      return await geminiService.generateHistory(locationName);
    } catch (err) {
      const isQuotaOrRate = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('rate');
      if (isQuotaOrRate) {
        console.warn(`[AIService] ⚠️ Gemini quota hết — tự động chuyển sang Ollama (history)...`);
        try {
          return await ollamaService.generateHistory(locationName);
        } catch (ollamaErr) {
          return `Chưa có thông tin lịch sử chi tiết cho ${locationName}.`;
        }
      }
      console.error('[AIService] Failed to generate history:', err);
      // Fallback response if AI fails
      return `Chưa có thông tin lịch sử chi tiết cho ${locationName}.`;
    }
  }
};

export default aiService;
