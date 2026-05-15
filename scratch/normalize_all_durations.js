
import prisma from "../src/config/prismaClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function normalizeAllDurations() {
  console.log('--- Bắt đầu chuẩn hóa toàn bộ Duration cho 304 địa điểm ---');

  try {
    const destinations = await prisma.destination.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, category: true, city: true }
    });

    const batchSize = 50;
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    for (let i = 0; i < destinations.length; i += batchSize) {
      const batch = destinations.slice(i, i + batchSize);
      console.log(`- Đang xử lý batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(destinations.length/batchSize)}...`);

      const prompt = `Dựa vào tên và danh mục địa điểm du lịch sau đây tại Việt Nam, hãy gợi ý thời gian tham quan (duration) hợp lý nhất (ví dụ: "1-2 giờ", "3-4 giờ", "Cả ngày").
      Trả về dưới dạng mảng JSON các object: {"id": number, "duration": string}.
      
      Danh sách:
      ${batch.map(d => `${d.id}: ${d.name} (${d.category}, ${d.city})`).join('\n')}
      
      Chỉ trả về JSON, không giải thích gì thêm.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        for (const sug of suggestions) {
          await prisma.destination.update({
            where: { id: sug.id },
            data: { duration: sug.duration }
          });
        }
      }
    }

    console.log('\n✅ Đã chuẩn hóa toàn bộ 304 địa điểm thành công!');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

normalizeAllDurations();
