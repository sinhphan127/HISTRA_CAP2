import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// gemini-2.0-flash: nhanh, mạnh, hỗ trợ JSON tốt
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generationConfig = {
  temperature: 0.4,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};

const geminiService = {
  /**
   * Generates a travel itinerary using RAG pattern via Gemini
   */
  async generateItinerary({ city, days, travelers, destinations, interests = [], budget = null }) {
    console.log(`[GeminiService] === RAG Itinerary Generation ===`);
    
    // Giới hạn số địa điểm linh hoạt theo số ngày
    const maxPlaces = Math.min(40, Math.max(15, days * 5));
    const topDestinations = destinations.slice(0, maxPlaces);
    const placeList = topDestinations
      .map(d => {
        const price = d.ticketPrice
          ? `${Number(d.ticketPrice).toLocaleString('vi-VN')}d ve`
          : 'Mien phi';
        const dur = d.duration || '1-2 gio';
        return `- ${d.name} | ${d.category} | ${price} | ${dur}`;
      })
      .join('\n');

    const budgetText = budget
      ? `Ngân sách tổng: ${Number(budget).toLocaleString('vi-VN')} VNĐ cho ${travelers} người.`
      : `Ngân sách: Linh hoạt.`;

    const interestText = interests.length > 0
      ? `Sở thích: ${interests.join(', ')}.`
      : `Sở thích: Tổng hợp (tham quan, ẩm thực, nghỉ ngơi).`;

    const prompt = `Bạn là một chuyên gia du lịch của Histra. Nhiệm vụ của bạn là lập lịch trình du lịch ${days} ngày tại ${city} cho ${travelers} người.
${budgetText}
${interestText}

DANH SÁCH ĐỊA ĐIỂM CHỈ ĐƯỢC CHỌN TỪ ĐÂY:
${placeList}

LUẬT LỆ:
1. CHỈ sử dụng địa điểm từ danh sách trên.
2. Trả về JSON object hợp lệ.
3. activity và reasoning viết bằng Tiếng Việt.
4. totalEstimatedCost = tổng vé + ăn uống (~150.000/người/ngày) + đi lại (~100.000/ngày).
5. QUAN TRỌNG: TUYỆT ĐỐI KHÔNG COPY nội dung của ngày trước sang ngày sau. Mỗi ngày phải chọn các địa điểm tham quan KHÁC NHAU hoàn toàn.

ĐỊNH DẠNG JSON:
{
  "title": "Hành trình tại ${city}",
  "city": "${city}",
  "totalEstimatedCost": 0,
  "costBreakdown": {"transport": 0, "food": 0, "accommodation": 0},
  "days": [
    {
      "day": 1,
      "itinerary": [
        {
          "timeSlot": "HH:MM",
          "locationName": "Tên địa điểm chính xác",
          "activity": "Mô tả",
          "estimatedCost": 0,
          "reasoning": "Lý do",
          "tags": ["#Tag"]
        }
      ]
    }
  ]
}`;

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      const response = await result.response;
      let text = response.text();
      
      // Dọn sạch markdown nếu Gemini trả về dạng block ```json
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```([\s\S]*?)```/) || 
                        text.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        text = jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
      }

      return JSON.parse(text.trim());
    } catch (error) {
      console.error('[GeminiService] Error:', error);
      throw new Error(`Gemini API lỗi: ${error.message}`);
    }
  },

  /**
   * Chat with AI about the itinerary
   */
  async chatWithBot({ itinerary, messages }) {
    console.log(`[GeminiService] === AI Chat ===`);
    
    const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Build summary
    let summary = `Lịch trình tại ${itinerary.city}:\n`;
    (itinerary.days || []).forEach(d => {
      summary += `Ngày ${d.day}:\n`;
      (d.itinerary || []).forEach(item => {
        summary += `- ${item.timeSlot}: ${item.locationName}\n`;
      });
    });

    const lastMessage = messages[messages.length - 1]?.content || '';
    
    const systemPrompt = `Bạn là HISTRA Guide, một trợ lý du lịch thân thiện. 
Dưới đây là lịch trình của người dùng:
${summary}

Hãy trả lời câu hỏi của họ một cách ngắn gọn (tối đa 3 câu).`;

    try {
      const chat = chatModel.startChat({
        history: messages.slice(0, -1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
        generationConfig: { ...generationConfig },
      });

      const result = await chat.sendMessage(`${systemPrompt}\n\nNgười dùng hỏi: ${lastMessage}`);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('[GeminiService] Chat Error:', error);
      throw new Error(`Gemini Chat lỗi: ${error.message}`);
    }
  },

  /**
   * Generates a brief history for a location
   */
  async generateHistory(locationName) {
    const prompt = `Viết một đoạn văn cực kỳ ngắn gọn (khoảng 2 câu, tối đa 50 từ) kể về lịch sử hoặc nguồn gốc của địa danh: ${locationName}. Viết bằng Tiếng Việt.`;
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { ...generationConfig, maxOutputTokens: 200 },
      });
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('[GeminiService] Error:', error);
      throw new Error(`Gemini API lỗi: ${error.message}`);
    }
  }
};

export default geminiService;
