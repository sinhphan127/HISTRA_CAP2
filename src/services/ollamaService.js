import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

/**
 * RAG-based AI Service — Qwen via Ollama
 *
 * Nguyên tắc: Qwen không biết database của bạn.
 * → Hệ thống filter DB trước → lấy Top Places → gửi vào prompt
 * → Qwen chỉ "suy luận" (inference) trên dữ liệu được cung cấp
 *
 * Flow:
 *   User Input
 *     ↓
 *   Filter DB (tripService) — SQL search theo city + interests
 *     ↓
 *   Send Top 15–20 Places → Prompt Builder (đây)
 *     ↓
 *   Qwen 3 (inference only, không training khi chạy)
 *     ↓
 *   Output JSON Itinerary
 */
const ollamaService = {
  /**
   * Generates a travel itinerary using RAG pattern
   * @param {Object} params
   * @param {string}   params.city         - Thành phố du lịch
   * @param {number}   params.days         - Số ngày
   * @param {number}   params.travelers    - Số người
   * @param {Array}    params.destinations - Danh sách địa điểm từ DB (đã filter)
   * @param {Array}    params.interests    - Sở thích người dùng
   * @param {number}   params.budget       - Ngân sách (VNĐ)
   */
  async generateItinerary({ city, days, travelers, destinations, interests = [], budget = null }) {
    const apiUrl   = process.env.OLLAMA_API_URL    || 'http://localhost:11434/api/generate';
    const model    = process.env.OLLAMA_MODEL_NAME || 'qwen3:1.7b';

    console.log(`[OllamaService] === RAG Itinerary Generation ===`);
    console.log(`[OllamaService] City: ${city} | Days: ${days} | Travelers: ${travelers}`);
    console.log(`[OllamaService] Budget: ${budget ? budget.toLocaleString('vi-VN') + ' VNĐ' : 'Linh hoạt'}`);
    console.log(`[OllamaService] Interests: ${interests.join(', ') || 'Tổng hợp'}`);
    console.log(`[OllamaService] Places retrieved from DB: ${destinations.length}`);
    console.log(`[OllamaService] Model: ${model} | Endpoint: ${apiUrl}`);

    // ── Prompt Builder ──────────────────────────────────────────────────────
    // Nguyên tắc: Chất lượng = Prompt + Data + Điều khiển model
    // Qwen không biết DB → ta phải đưa đúng data vào đây
    // Giới hạn 10 địa điểm — đủ cho Qwen lên lịch, ít token hơn → nhanh hơn
    const topDestinations = destinations.slice(0, 10);

    const placeList = topDestinations
      .map(d => {
        const price = d.ticketPrice
          ? `${Number(d.ticketPrice).toLocaleString('vi-VN')}d ve`
          : 'Mien phi';
        const dur   = d.duration || '1-2 gio';
        return `- ${d.name} | ${d.category} | ${price} | ${dur}`;
      })
      .join('\n');

    const budgetText = budget
      ? `Ngân sách tổng: ${Number(budget).toLocaleString('vi-VN')} VNĐ cho ${travelers} người.`
      : `Ngân sách: Linh hoạt.`;

    const interestText = interests.length > 0
      ? `Sở thích: ${interests.join(', ')}.`
      : `Sở thích: Tổng hợp (tham quan, ẩm thực, nghỉ ngơi).`;

    const prompt = `You are a JSON-only API for a Vietnamese travel app. Output ONLY a valid JSON object. No explanation, no markdown, no text outside the JSON.

TASK: Generate a ${days}-day travel itinerary in ${city} for ${travelers} traveler(s).
${budgetText}
${interestText}

AVAILABLE PLACES (use ONLY these, do not invent):
${placeList}

RULES (STRICTLY FOLLOW):
1. ONLY use place names from the AVAILABLE PLACES list above. NEVER invent or add any place not in the list.
2. If the list has fewer places than needed, reuse places from the list with different activities or time slots.
3. Each day should have 2-3 time slots: Morning, Afternoon, Evening.
4. estimatedCost per location should match the ticket price shown.
5. totalEstimatedCost = ticket costs + food (~150000/person/day) + transport (~100000/day).
6. Write "activity" and "reasoning" in Vietnamese.
7. Tags start with # (e.g. #Bien #VanHoa #AmThuc).

OUTPUT FORMAT (strict JSON, no extra keys):
{
  "title": "Hành trình ${days} ngày tại ${city}",
  "city": "${city}",
  "totalEstimatedCost": 0,
  "costBreakdown": {
    "transport": 0,
    "food": 0,
    "accommodation": 0
  },
  "days": [
    {
      "day": 1,
      "itinerary": [
        {
          "timeSlot": "Morning",
          "locationName": "Tên địa điểm từ danh sách trên",
          "activity": "Mô tả hoạt động bằng tiếng Việt",
          "estimatedCost": 0,
          "reasoning": "Tại sao chọn địa điểm này",
          "tags": ["#Tag1", "#Tag2"]
        }
      ]
    }
  ]
}

Generate the JSON now for all ${days} days:`;
    // ───────────────────────────────────────────────────────────────────────

    try {
      const response = await axios.post(
        apiUrl,
        {
          model,
          prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.3,   // thấp → ổn định, ít hallucination
            num_predict: 1500,  // 1500 tokens đủ cho 3–5 ngày — giảm từ 4096 để nhanh hơn
            num_ctx: 2048,      // context window nhỏ hơn → load model nhanh hơn
          }
        },
        { timeout: 600000 }     // 10 phút — model 1.7b CPU có thể chậm
      );

      let text = response.data.response;
      console.log(`[OllamaService] Raw response (first 300 chars): ${text.substring(0, 300)}`);

      // Dọn markdown nếu model không tuân thủ format:json
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const result = JSON.parse(text);

      // Validation cơ bản
      if (!result.days || !Array.isArray(result.days)) {
        throw new Error('Qwen trả về JSON không hợp lệ — thiếu field "days"');
      }

      console.log(`[OllamaService] ✅ Generated ${result.days.length} days successfully`);
      return result;

    } catch (error) {
      console.error('[OllamaService] ❌ ERROR:', error.message);
      if (error.response) {
        console.error('[OllamaService] HTTP Status:', error.response.status);
        console.error('[OllamaService] HTTP Body:', JSON.stringify(error.response.data).substring(0, 500));
      }
      throw new Error(`Ollama API lỗi: ${error.message}`);
    }
  }
};

export default ollamaService;
