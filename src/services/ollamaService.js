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
 *   Qwen 2.5:3b (inference only, không training khi chạy)
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
    const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
    const model = process.env.OLLAMA_MODEL_NAME || 'qwen2.5:3b';

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

    const prompt = `Bạn là một API lập lịch trình du lịch. CHỈ ĐƯỢC PHÉP trả về một JSON object hợp lệ. KHÔNG giải thích, KHÔNG markdown, KHÔNG text ngoài JSON.

NHIỆM VỤ: Lập lịch trình du lịch ${days} ngày tại ${city} cho ${travelers} người.
${budgetText}
${interestText}

DANH SÁCH ĐỊA ĐIỂM (CHỈ ĐƯỢC CHỌN TỪ ĐÂY, TUYỆT ĐỐI KHÔNG BỊA THÊM):
${placeList}

LUẬT LỆ (TUÂN THỦ NGHIÊM NGẶT):
1. CHỈ sử dụng tên địa điểm từ danh sách trên. KHÔNG TỰ CHẾ RA CÁC ĐỊA ĐIỂM HOẶC QUÁN ĂN (như "Lunch: ...") nếu nó không có trong danh sách.
2. Nếu danh sách có ít địa điểm, hãy sử dụng lại các địa điểm đó nhưng với hoạt động khác nhau.
3. Lập thời gian (timeSlot) nối tiếp nhau logic dựa vào thời lượng (duration) của từng địa điểm. Ví dụ: Nếu địa điểm A bắt đầu lúc 08:00 và kéo dài 2 giờ, địa điểm B nên bắt đầu lúc 10:30 (tính cả thời gian di chuyển). Mỗi ngày có thể đi 3-4 địa điểm.
4. estimatedCost phải khớp với giá vé ở trên.
5. totalEstimatedCost = tổng vé + ăn uống (~150000/người/ngày) + đi lại (~100000/ngày).
6. Viết "activity" và "reasoning" bằng Tiếng Việt.
7. Các thẻ (tags) bắt đầu bằng # (vd: #KhamPha #AmThuc).

ĐỊNH DẠNG ĐẦU RA (JSON chuẩn xác, không dư thừa):
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
          "timeSlot": "HH:MM",
          "locationName": "Tên địa điểm chính xác từ danh sách",
          "activity": "Mô tả hoạt động bằng Tiếng Việt",
          "estimatedCost": 0,
          "reasoning": "Tại sao chọn địa điểm này",
          "tags": ["#Tag1", "#Tag2"]
        }
      ]
    }
  ]
}

Tạo JSON ngay bây giờ cho toàn bộ ${days} ngày:`;
    // ───────────────────────────────────────────────────────────────────────

    try {
      const response = await axios.post(
        apiUrl,
        {
          model,
          prompt,
          stream: false,
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

      // Dọn markdown nếu model trả về dạng markdown block
      let jsonText = text;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        jsonText = jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
      }

      let result;
      try {
        result = JSON.parse(jsonText.trim());
      } catch (e) {
        console.error('[OllamaService] ❌ Lỗi parse JSON. Raw text:', text);
        throw new Error('Qwen không trả về định dạng JSON hợp lệ.');
      }

      // Tìm mảng chứa lịch trình (đề phòng model đổi tên key thành 'itinerary' hoặc khác)
      let daysArray = result.days;

      // Nếu model trả về mảng trực tiếp thay vì object có key days
      if (Array.isArray(result)) {
        daysArray = result;
      } else if (!daysArray || !Array.isArray(daysArray)) {
        // Tìm thử trong các key của result xem có mảng nào giống mảng days không
        for (const key in result) {
          if (Array.isArray(result[key]) && result[key].length > 0) {
            // Kiểm tra xem phần tử đầu tiên có chứa 'day' hoặc 'itinerary' không
            if (result[key][0].day || result[key][0].itinerary) {
              daysArray = result[key];
              break;
            }
          }
        }
      }

      // Validation cơ bản
      if (!daysArray || !Array.isArray(daysArray)) {
        console.error('[OllamaService] Parsed JSON:', result);
        throw new Error('Qwen trả về JSON không hợp lệ — thiếu field "days"');
      }

      // Chuẩn hóa lại object để luôn có days
      result.days = daysArray;

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
  },

  /**
   * Chat with AI about the itinerary
   * @param {Object} params
   * @param {Object} params.itinerary - Lịch trình hiện tại
   * @param {Array}  params.messages  - Lịch sử chat [{role, content}]
   */
  async chatWithBot({ itinerary, messages }) {
    const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
    const model = process.env.OLLAMA_MODEL_NAME || 'qwen2.5:3b';

    console.log(`[OllamaService] === AI Chat with Itinerary ===`);
    
    // Build context from itinerary
    let itinerarySummary = `Lịch trình tại ${itinerary.city || 'địa điểm đã chọn'}:\n`;
    
    if (itinerary.days && Array.isArray(itinerary.days)) {
      // Structure from AI Generator
      itinerary.days.forEach(d => {
        itinerarySummary += `Ngày ${d.day}:\n`;
        const items = d.itinerary || d.activities || [];
        items.forEach(item => {
          itinerarySummary += `- ${item.timeSlot || item.time}: ${item.locationName || item.title}\n`;
        });
      });
    } else if (itinerary.tripLocations && Array.isArray(itinerary.tripLocations)) {
      // Structure from Saved Trip (Database)
      const days = {};
      itinerary.tripLocations.forEach(loc => {
        if (!days[loc.dayNumber]) days[loc.dayNumber] = [];
        days[loc.dayNumber].push(loc);
      });
      
      Object.keys(days).sort().forEach(dayNum => {
        itinerarySummary += `Ngày ${dayNum}:\n`;
        days[dayNum].forEach(loc => {
          itinerarySummary += `- ${loc.destination?.name || 'Địa điểm'}\n`;
        });
      });
    }

    const conversationContext = messages.map(m => `${m.role === 'user' ? 'Khách' : 'Bot'}: ${m.content}`).join('\n');
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    const prompt = `Bạn là HISTRA Guide, một trợ lý du lịch thông minh của ứng dụng Histra.
Dưới đây là thông tin lịch trình:
${itinerarySummary}

Lịch sử trò chuyện:
${conversationContext}

NHIỆM VỤ: Hãy trả lời câu hỏi của người dùng về lịch trình này một cách ngắn gọn, hữu ích và thân thiện. Nếu người dùng muốn thay đổi, hãy tư vấn cho họ.

Câu hỏi mới nhất: "${lastUserMessage}"
Trả lời ngắn gọn (tối đa 3-4 câu):`;

    try {
      const response = await axios.post(
        apiUrl,
        {
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 300,
          }
        },
        { timeout: 600000 }
      );

      const reply = response.data.response.trim();
      console.log(`[OllamaService] Bot reply: ${reply}`);
      return reply;
    } catch (error) {
      console.error('[OllamaService] Chat Error:', error.message);
      throw new Error(`Ollama Chat API lỗi: ${error.message}`);
    }
  }
};

export default ollamaService;
