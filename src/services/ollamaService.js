import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

// ── Cấu hình dùng chung ──────────────────────────────────────────────────────
const getConfig = () => ({
  apiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate',
  model: process.env.OLLAMA_MODEL_NAME || 'qwen2.5:3b',
});

const ollamaService = {
  /**
   * Generates a travel itinerary using RAG pattern (tối ưu tốc độ < 60s)
   */
  async generateItinerary({ city, days, travelers, destinations, interests = [], budget = null }) {
    const { apiUrl, model } = getConfig();

    console.log(`[OllamaService] === RAG Itinerary Generation ===`);
    console.log(`[OllamaService] City: ${city} | Days: ${days} | Travelers: ${travelers} | Model: ${model}`);

    // ── Kiểm tra ngân sách tối thiểu ─────────────────────────────────────────
    const MIN_BUDGET_PER_DAY = 150000;
    if (budget && budget < (days * MIN_BUDGET_PER_DAY)) {
      return {
        title: `Ngân sách quá thấp cho chuyến đi ${days} ngày`,
        city, totalEstimatedCost: 0, days: [],
        warning: `Ngân sách không đủ. Tối thiểu ${(days * MIN_BUDGET_PER_DAY).toLocaleString('vi-VN')}đ cho ${days} ngày.`
      };
    }

    // ── Giới hạn số địa điểm gửi lên AI (tối đa 9 để giảm tải input cho Ollama) ──────
    const maxPlaces = Math.min(12, Math.max(5, days * 3));
    const topDestinations = destinations.slice(0, maxPlaces);

    if (topDestinations.length === 0) {
      throw new Error(`Không tìm thấy địa điểm nào tại ${city}.`);
    }

    // ── Danh sách địa điểm ngắn gọn ──────────────────────────────────────────
    const placeList = topDestinations.map(d => {
      const price = d.ticketPrice ? Number(d.ticketPrice) : 0;
      return `${d.id}|${d.name}|${price * travelers}VND|${d.address || d.province}`;
    }).join('\n');

    // ── Prompt rút gọn tối đa ─────────────────────────────────────────────────
    const budgetText = budget ? `Budget: ${Number(budget).toLocaleString('vi-VN')}VND total.` : '';
    const interestText = interests.length > 0 ? `Interests: ${interests.slice(0, 3).join(', ')}.` : '';

    const prompt = `You are a JSON travel API for HISTRA. Return ONLY valid JSON, no markdown.
Task: Create a ${days}-day detailed trip in ${city} for ${travelers} people.
${budgetText} ${interestText}

Available Places (id|name|totalCost|address): 
${placeList}

Rules:
1. Each location MUST appear ONLY ONCE in the whole trip. NO REPETITION.
2. Use ONLY places from the list above. Do NOT hallucinate new places.
3. Each day MUST have 2-3 activities (Morning, Afternoon, Evening).
4. estimatedCost = price from list.
5. totalEstimatedCost = sum of all estimatedCost.
6. Time slots should be logical (e.g., 08:00, 13:00, 18:00).
7. "reasoning" MUST be max 5 words in Vietnamese.

JSON structure example:
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
        {"timeSlot": "12:00", "locationId": 2, "locationName": "Place B", "locationAddress": "Address B", "activity": "Ăn trưa", "estimatedCost": 100000, "reasoning": "..."},
        {"timeSlot": "15:00", "locationId": 3, "locationName": "Place C", "locationAddress": "Address C", "activity": "Giải trí", "estimatedCost": 50000, "reasoning": "..."}
      ]
    }
  ]
}`;

    try {
      const response = await axios.post(apiUrl, {
        model,
        prompt,
        format: 'json',
        stream: false,
        options: {
          temperature: 0.1, // Giảm xuống để output ổn định hơn
          num_predict: 800, 
          num_ctx: 2048,   
          top_k: 20,
          top_p: 0.9,
        }
      }, { timeout: 150000 }); // Tăng timeout lên 2.5 phút vì prompt dài hơn và nhiều item hơn

      // ── Parse JSON ────────────────────────────────────────────────────────────
      let text = response.data.response;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || text.match(/{[\s\S]*}/);
      let jsonText = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : text;

      let result = JSON.parse(jsonText.trim());
      let daysArray = Array.isArray(result) ? result : result.days;

      if (!daysArray || !Array.isArray(daysArray)) {
        // Tìm key nào chứa mảng ngày
        for (const key in result) {
          if (Array.isArray(result[key]) && result[key][0]?.itinerary) {
            daysArray = result[key]; break;
          }
        }
      }

      if (!daysArray || !Array.isArray(daysArray)) {
        throw new Error('AI trả về JSON không hợp lệ — thiếu field "days"');
      }

      // ── Hậu xử lý: đồng bộ lại giá tiền chính xác từ DB ─────────────────────
      let actualTotalCost = 0;
      daysArray.forEach(day => {
        if (!Array.isArray(day.itinerary)) return;
        day.itinerary.forEach(item => {
          const dbPlace = topDestinations.find(d => d.id === item.locationId || d.name === item.locationName);
          if (dbPlace) {
            item.estimatedCost = (dbPlace.ticketPrice ? Number(dbPlace.ticketPrice) : 0) * travelers;
            item.locationName = dbPlace.name;
            item.locationAddress = dbPlace.address || `${dbPlace.name}, ${dbPlace.province}`;
          }
          actualTotalCost += (item.estimatedCost || 0);
        });
      });

      result.days = daysArray;
      result.totalEstimatedCost = actualTotalCost;
      return result;

    } catch (error) {
      console.error('[OllamaService] ❌ ERROR:', error.message);
      throw new Error(`Ollama API lỗi: ${error.message}`);
    }
  },

  /**
   * Chat with the travel bot using the saved itinerary as context
   */
  async chatWithBot({ itinerary, messages }) {
    const { apiUrl, model } = getConfig();

    // Tóm tắt lịch trình ngắn gọn
    const summary = (itinerary.days || []).map(d =>
      `Day ${d.day}: ` + (d.itinerary || []).map(i => i.locationName || i.title).join(', ')
    ).join(' | ');

    const lastMessage = messages[messages.length - 1]?.content || '';

    const prompt = `You are HISTRA Guide, a Vietnamese travel assistant. Answer in Vietnamese, max 3 sentences.
Trip: ${summary}
Question: "${lastMessage}"
Answer:`;

    try {
      const response = await axios.post(apiUrl, {
        model, prompt, stream: false,
        options: { temperature: 0.7, num_predict: 250, num_ctx: 1024 }
      }, { timeout: 60000 });

      return response.data.response.trim();
    } catch (error) {
      throw new Error(`Ollama Chat lỗi: ${error.message}`);
    }
  },

  /**
   * Generates a brief history snippet for a location
   */
  async generateHistory(locationName) {
    const { apiUrl, model } = getConfig();
    const prompt = `Viết 2 câu ngắn về lịch sử "${locationName}" bằng tiếng Việt.`;

    try {
      const response = await axios.post(apiUrl, {
        model, prompt, stream: false,
        options: { temperature: 0.3, num_predict: 120, num_ctx: 512 }
      }, { timeout: 30000 });

      return response.data.response.trim();
    } catch (error) {
      throw new Error(`Ollama History lỗi: ${error.message}`);
    }
  }
};

export default ollamaService;

