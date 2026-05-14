import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

const ollamaService = {
  /**
   * Generates a travel itinerary using RAG pattern
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

    // ── Pre-validation ──────────────────────────────────────────────────────
    const MIN_BUDGET_PER_DAY = 150000;
    if (budget && budget < (days * MIN_BUDGET_PER_DAY)) {
      return {
        title: `Ngân sách quá thấp cho chuyến đi ${days} ngày`,
        city,
        totalEstimatedCost: 0,
        days: [],
        warning: "Ngân sách không đủ để thực hiện chuyến đi. Vui lòng tăng ngân sách (tối thiểu 150.000đ/người/ngày)."
      };
    }

    const maxPlaces = Math.min(30, Math.max(10, days * 4));
    const topDestinations = destinations.slice(0, maxPlaces);
    
    if (topDestinations.length === 0) {
       throw new Error(`Không tìm thấy địa điểm nào tại ${city} trong hệ thống.`);
    }

    const placeList = topDestinations
      .map(d => {
        const price = d.ticketPrice
          ? Number(d.ticketPrice)
          : 0;
        const priceText = price > 0 ? `${price.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí';
        const address = d.address || `${d.name}, ${d.province}`; 
        return `- ID:${d.id} | ${d.name} | Địa chỉ: ${address} | Giá vé gốc: ${priceText} (LƯU Ý: Nếu là Miễn phí thì giá trị số là 0) | Thời gian: ${d.duration || '1-2 giờ'}`;
      })
      .join('\n');

    const budgetText = budget
      ? `Ngân sách tối đa: ${Number(budget).toLocaleString('vi-VN')} VNĐ cho ${travelers} người.`
      : `Ngân sách: Linh hoạt.`;

    const interestText = interests.length > 0
      ? `Sở thích: ${interests.join(', ')}.`
      : `Sở thích: Tổng hợp.`;

    const prompt = `Bạn là một API lập lịch trình du lịch CHUYÊN NGHIỆP. CHỈ ĐƯỢC PHÉP trả về JSON.
    
NHIỆM VỤ: Lập lịch trình ${days} ngày tại ${city} cho ${travelers} người.
${budgetText}
${interestText}

DANH SÁCH ĐỊA ĐIỂM THẬT (CHỈ ĐƯỢC CHỌN TỪ ĐÂY):
${placeList}

LUẬT LỆ TỐI THƯỢNG:
1. KHÔNG ĐƯỢC PHÉP tự bịa ra địa điểm mới. 
2. PHẢI TRẢ VỀ trường "locationAddress" chính xác như trong danh sách trên.
3. PHẢI TRẢ VỀ trường "estimatedCost" là số nguyên (VNĐ), dựa trên giá vé đã cho (nhân với số người: ${travelers}).
4. "totalEstimatedCost" là TỔNG của tất cả "estimatedCost" trong toàn bộ chuyến đi.
5. "totalEstimatedCost" KHÔNG ĐƯỢC VƯỢT QUÁ NGÂN SÁCH (${budget || 'vô hạn'}).

ĐỊNH DẠNG JSON:
{
  "title": "Hành trình khám phá ${city}",
  "city": "${city}",
  "totalEstimatedCost": 0,
  "currency": "VNĐ",
  "warning": "",
  "days": [
    {
      "day": 1,
      "itinerary": [
        {
          "timeSlot": "08:00",
          "locationId": 0,
          "locationName": "Tên địa điểm",
          "locationAddress": "Địa chỉ đầy đủ",
          "activity": "Mô tả hoạt động",
          "estimatedCost": 0,
          "reasoning": "Lý do",
          "tags": ["#VanHoa"]
        }
      ]
    }
  ]
}`;

    try {
      const response = await axios.post(
        apiUrl,
        {
          model,
          prompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 2500,
            num_ctx: 3072,
          }
        },
        { timeout: 600000 }
      );

      let text = response.data.response;
      let jsonText = text;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        jsonText = jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
      }

      let result = JSON.parse(jsonText.trim());
      let daysArray = result.days;

      if (Array.isArray(result)) {
        daysArray = result;
      } else if (!daysArray || !Array.isArray(daysArray)) {
        for (const key in result) {
          if (Array.isArray(result[key]) && result[key].length > 0) {
            if (result[key][0].day || result[key][0].itinerary) {
              daysArray = result[key];
              break;
            }
          }
        }
      }

      if (!daysArray || !Array.isArray(daysArray)) {
        throw new Error('Qwen trả về JSON không hợp lệ — thiếu field "days"');
      }

      // ── Hậu xử lý để đảm bảo chính xác 100% giá từ DB ────────────────────────
      let actualTotalCost = 0;
      result.days.forEach(day => {
        if (day.itinerary && Array.isArray(day.itinerary)) {
          day.itinerary.forEach(item => {
            // Tìm điểm trong DB bằng ID (ưu tiên) hoặc tên
            const dbPlace = topDestinations.find(d => d.id === item.locationId || d.name === item.locationName);
            if (dbPlace) {
              const realPrice = dbPlace.ticketPrice ? Number(dbPlace.ticketPrice) : 0;
              item.estimatedCost = realPrice * travelers;
              actualTotalCost += item.estimatedCost;
              
              // Đồng bộ luôn cả tên và địa chỉ cho chuẩn
              item.locationName = dbPlace.name;
              item.locationAddress = dbPlace.address || `${dbPlace.name}, ${dbPlace.province}`;
            } else {
              actualTotalCost += (item.estimatedCost || 0);
            }
          });
        }
      });
      result.totalEstimatedCost = actualTotalCost;

      result.days = daysArray;
      return result;

    } catch (error) {
      console.error('[OllamaService] ❌ ERROR:', error.message);
      throw new Error(`Ollama API lỗi: ${error.message}`);
    }
  },

  async chatWithBot({ itinerary, messages }) {
    const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
    const model = process.env.OLLAMA_MODEL_NAME || 'qwen2.5:3b';

    let itinerarySummary = `Lịch trình tại ${itinerary.city || 'địa điểm đã chọn'}:\n`;
    if (itinerary.days && Array.isArray(itinerary.days)) {
      itinerary.days.forEach(d => {
        itinerarySummary += `Ngày ${d.day}:\n`;
        const items = d.itinerary || d.activities || [];
        items.forEach(item => {
          itinerarySummary += `- ${item.timeSlot || item.time}: ${item.locationName || item.title}\n`;
        });
      });
    }

    const conversationContext = messages.map(m => `${m.role === 'user' ? 'Khách' : 'Bot'}: ${m.content}`).join('\n');
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    const prompt = `Bạn là HISTRA Guide, một trợ lý du lịch.
${itinerarySummary}
Lịch sử: ${conversationContext}
Câu hỏi: "${lastUserMessage}"
Trả lời ngắn gọn (3 câu):`;

    try {
      const response = await axios.post(apiUrl, {
        model,
        prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 300 }
      }, { timeout: 600000 });
      return response.data.response.trim();
    } catch (error) {
      throw new Error(`Ollama Chat lỗi: ${error.message}`);
    }
  },

  async generateHistory(locationName) {
    const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
    const model = process.env.OLLAMA_MODEL_NAME || 'qwen2.5:3b';
    const prompt = `Viết 2 câu cực ngắn về lịch sử: ${locationName}. Tiếng Việt.`;

    try {
      const response = await axios.post(apiUrl, {
        model,
        prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 150 }
      }, { timeout: 600000 });
      return response.data.response.trim();
    } catch (error) {
      throw new Error(`Ollama History lỗi: ${error.message}`);
    }
  }
};

export default ollamaService;
