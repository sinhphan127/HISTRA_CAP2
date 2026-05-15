
import aiService from '../src/services/aiService.js';

async function testGeminiRich() {
  const sampleData = {
    city: 'Đà Nẵng',
    days: 3,
    travelers: 2,
    interests: ['Biển', 'Văn hóa', 'Ẩm thực', 'Giải trí'],
    budget: 10000000,
    destinations: [
      { id: 1, name: 'Bà Nà Hills', ticketPrice: 900000, address: 'Hòa Vang, Đà Nẵng' },
      { id: 2, name: 'Bán đảo Sơn Trà', ticketPrice: 0, address: 'Sơn Trà, Đà Nẵng' },
      { id: 3, name: 'Ngũ Hành Sơn', ticketPrice: 40000, address: 'Ngũ Hành Sơn, Đà Nẵng' },
      { id: 4, name: 'Cầu Rồng', ticketPrice: 0, address: 'Hải Châu, Đà Nẵng' },
      { id: 5, name: 'Bảo tàng Chăm', ticketPrice: 60000, address: 'Hải Châu, Đà Nẵng' },
      { id: 6, name: 'Chợ Hàn', ticketPrice: 0, address: 'Hải Châu, Đà Nẵng' },
      { id: 7, name: 'Chợ Cồn', ticketPrice: 0, address: 'Hải Châu, Đà Nẵng' },
      { id: 8, name: 'Asia Park', ticketPrice: 200000, address: 'Hải Châu, Đà Nẵng' },
      { id: 9, name: 'Núi Thần Tài', ticketPrice: 400000, address: 'Hòa Vang, Đà Nẵng' },
      { id: 10, name: 'Biển Mỹ Khê', ticketPrice: 0, address: 'Sơn Trà, Đà Nẵng' },
      { id: 11, name: 'Chùa Linh Ứng', ticketPrice: 0, address: 'Bán đảo Sơn Trà, Đà Nẵng' },
      { id: 12, name: 'Cầu Tình Yêu', ticketPrice: 0, address: 'Sơn Trà, Đà Nẵng' },
      { id: 13, name: 'Bãi Bụt', ticketPrice: 0, address: 'Bán đảo Sơn Trà, Đà Nẵng' },
      { id: 14, name: 'Nhà thờ Con Gà', ticketPrice: 0, address: 'Hải Châu, Đà Nẵng' }
    ]
  };

  console.log(`--- Đang kiểm tra tạo lịch trình RICH 3 ngày với Gemini ---`);
  const startTime = Date.now();

  try {
    const result = await aiService.generateItinerary(sampleData);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`\n✅ Thành công! Thời gian phản hồi: ${duration} giây.`);
    console.log('\n--- Kết quả lịch trình ---');
    console.log(`Tiêu đề: ${result.title}`);
    console.log(`Tổng chi phí dự kiến: ${result.totalEstimatedCost.toLocaleString('vi-VN')} VND`);
    
    result.days.forEach(day => {
      console.log(`\nNgày ${day.day}:`);
      day.itinerary.forEach(item => {
        console.log(`  - ${item.timeSlot}: ${item.locationName} (${item.activity})`);
        console.log(`    Lý do: ${item.reasoning}`);
      });
    });

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
  }
}

testGeminiRich();
