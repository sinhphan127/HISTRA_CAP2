import prisma from "../src/config/prismaClient.js";

const vietnamData = [
  // --- MIỀN BẮC ---
  { name: "Đỉnh Fansipan", province: "Lào Cai", category: "Thiên nhiên", latitude: "22.3033", longitude: "103.7750", ticketPrice: 800000, description: "Nóc nhà Đông Dương với khung cảnh mây ngàn hùng vĩ." },
  { name: "Bản Cát Cát", province: "Lào Cai", category: "Văn hóa", latitude: "22.3300", longitude: "103.8300", ticketPrice: 150000, description: "Ngôi làng cổ kính của người Mông đen tại Sapa." },
  { name: "Mù Cang Chải", province: "Yên Bái", category: "Thiên nhiên", latitude: "21.8500", longitude: "104.1300", ticketPrice: 0, description: "Nổi tiếng với những thửa ruộng bậc thang đẹp nhất thế giới." },
  { name: "Mã Pí Lèng", province: "Hà Giang", category: "Thiên nhiên", latitude: "23.2400", longitude: "105.4100", ticketPrice: 0, description: "Một trong tứ đại đỉnh đèo của Việt Nam." },
  { name: "Cột cờ Lũng Cú", province: "Hà Giang", category: "Lịch sử", latitude: "23.3800", longitude: "105.3100", ticketPrice: 25000, description: "Điểm cực Bắc thiêng liêng của Tổ quốc." },
  { name: "Thác Bản Giốc", province: "Cao Bằng", category: "Thiên nhiên", latitude: "22.8500", longitude: "106.7200", ticketPrice: 45000, description: "Thác nước tự nhiên lớn nhất Đông Nam Á." },
  { name: "Vịnh Hạ Long", province: "Quảng Ninh", category: "Thiên nhiên", latitude: "20.9100", longitude: "107.1800", ticketPrice: 290000, description: "Di sản thiên nhiên thế giới với hàng ngàn đảo đá vôi." },
  { name: "Chùa Yên Tử", province: "Quảng Ninh", category: "Tâm linh", latitude: "21.1500", longitude: "106.7300", ticketPrice: 40000, description: "Kinh đô Phật giáo của Việt Nam." },
  { name: "Tràng An", province: "Ninh Bình", category: "Thiên nhiên", latitude: "20.2500", longitude: "105.9000", ticketPrice: 250000, description: "Quần thể di sản văn hóa và thiên nhiên thế giới." },
  { name: "Chùa Bái Đính", province: "Ninh Bình", category: "Tâm linh", latitude: "20.2700", longitude: "105.8200", ticketPrice: 0, description: "Ngôi chùa có quy mô lớn nhất Việt Nam." },
  { name: "Tam Chúc", province: "Hà Nam", category: "Tâm linh", latitude: "20.6200", longitude: "105.8400", ticketPrice: 200000, description: "Ngôi chùa lớn nhất thế giới nằm bên hồ nước thơ mộng." },

  // --- MIỀN TRUNG & TÂY NGUYÊN ---
  { name: "Động Phong Nha", province: "Quảng Bình", category: "Thiên nhiên", latitude: "17.4800", longitude: "106.2800", ticketPrice: 150000, description: "Đệ nhất động với hệ thống thạch nhũ tráng lệ." },
  { name: "Thành cổ Quảng Trị", province: "Quảng Trị", category: "Lịch sử", latitude: "16.7400", longitude: "107.1900", ticketPrice: 0, description: "Di tích lịch sử đặc biệt quan trọng của dân tộc." },
  { name: "Bãi biển Thiên Cầm", province: "Hà Tĩnh", category: "Biển", latitude: "18.1700", longitude: "106.1100", ticketPrice: 0, description: "Bãi biển hoang sơ với làn nước trong xanh." },
  { name: "Quê Bác (Kim Liên)", province: "Nghệ An", category: "Lịch sử", latitude: "18.6600", longitude: "105.5700", ticketPrice: 0, description: "Nơi sinh của Chủ tịch Hồ Chí Minh vĩ đại." },
  { name: "Sầm Sơn", province: "Thanh Hóa", category: "Biển", latitude: "19.7400", longitude: "105.9100", ticketPrice: 0, description: "Bãi biển sầm uất bậc nhất miền Bắc Trung Bộ." },
  { name: "VinWonders Nha Trang", province: "Khánh Hòa", category: "Giải trí", latitude: "12.2200", longitude: "109.2400", ticketPrice: 880000, description: "Thiên đường giải trí đẳng cấp thế giới." },
  { name: "Tháp Bà Ponagar", province: "Khánh Hòa", category: "Văn hóa", latitude: "12.2600", longitude: "109.1900", ticketPrice: 30000, description: "Quần thể kiến trúc Chăm Pa cổ xưa." },
  { name: "Mũi Né", province: "Bình Thuận", category: "Biển", latitude: "10.9300", longitude: "108.2800", ticketPrice: 0, description: "Nổi tiếng với những đồi cát trắng trải dài." },
  { name: "Tháp Nhạn", province: "Phú Yên", category: "Văn hóa", latitude: "13.0900", longitude: "109.3000", ticketPrice: 0, description: "Biểu tượng kiến trúc Chăm của đất Phú Yên." },
  { name: "Eo Gió", province: "Bình Định", category: "Thiên nhiên", latitude: "13.7500", longitude: "109.3300", ticketPrice: 25000, description: "Nơi ngắm bình minh đẹp nhất Việt Nam." },
  { name: "Biển Hồ (T'Nưng)", province: "Gia Lai", category: "Thiên nhiên", latitude: "14.0500", longitude: "108.0000", ticketPrice: 10000, description: "Đôi mắt Pleiku rực rỡ giữa núi rừng Tây Nguyên." },
  { name: "Thác Dray Nur", province: "Đắk Lắk", category: "Thiên nhiên", latitude: "12.5300", longitude: "107.8900", ticketPrice: 30000, description: "Ngọn thác hùng vĩ bậc nhất Tây Nguyên." },

  // --- MIỀN NAM ---
  { name: "Bến Ninh Kiều", province: "Cần Thơ", category: "Văn hóa", latitude: "10.0300", longitude: "105.7800", ticketPrice: 0, description: "Biểu tượng thơ mộng của thủ phủ miền Tây." },
  { name: "Chợ nổi Cái Răng", province: "Cần Thơ", category: "Văn hóa", latitude: "10.0000", longitude: "105.7400", ticketPrice: 0, description: "Nét văn hóa sông nước độc đáo của ĐBSCL." },
  { name: "Rừng tràm Trà Sư", province: "An Giang", category: "Thiên nhiên", latitude: "10.5500", longitude: "105.0200", ticketPrice: 100000, description: "Hệ sinh thái rừng ngập mặn tuyệt đẹp." },
  { name: "Miếu Bà Chúa Xứ", province: "An Giang", category: "Tâm linh", latitude: "10.6900", longitude: "105.0700", ticketPrice: 0, description: "Trung tâm tâm linh lớn nhất miền Tây." },
  { name: "Mũi Cà Mau", province: "Cà Mau", category: "Địa lý", latitude: "8.6100", longitude: "104.7200", ticketPrice: 30000, description: "Điểm cực Nam của Tổ quốc Việt Nam." },
  { name: "Phú Quốc (Bãi Sao)", province: "Kiên Giang", category: "Biển", latitude: "10.0500", longitude: "103.9900", ticketPrice: 0, description: "Bãi biển cát trắng mịn màng như kem." },
  { name: "Côn Đảo (Nhà tù Côn Đảo)", province: "Bà Rịa - Vũng Tàu", category: "Lịch sử", latitude: "8.6800", longitude: "106.6000", ticketPrice: 40000, description: "Địa ngục trần gian trong lịch sử kháng chiến." },
  { name: "Tòa thánh Tây Ninh", province: "Tây Ninh", category: "Tâm linh", latitude: "11.3300", longitude: "106.1400", ticketPrice: 0, description: "Công trình vĩ đại của đạo Cao Đài." },
  { name: "Núi Bà Đen", province: "Tây Ninh", category: "Tâm linh", latitude: "11.3700", longitude: "106.1700", ticketPrice: 250000, description: "Đệ nhất thiên sơn của miền Đông Nam Bộ." },
  { name: "Bãi sau Vũng Tàu", province: "Bà Rịa - Vũng Tàu", category: "Biển", latitude: "10.3300", longitude: "107.0900", ticketPrice: 0, description: "Bãi biển sầm uất nhất miền Nam." }
];

async function seed() {
  console.log("Starting Nationwide Coverage Seed...");
  
  for (const item of vietnamData) {
    try {
      const existing = await prisma.destination.findFirst({
        where: { name: item.name }
      });

      if (!existing) {
        await prisma.destination.create({ data: item });
        console.log(`- Created: ${item.name} (${item.province})`);
      } else {
        console.log(`- Skipped (Duplicate): ${item.name}`);
      }
    } catch (err) {
      console.error(`- Failed: ${item.name}`, err.message);
    }
  }

  // Bổ sung thêm các tỉnh còn trống để đảm bảo tỉnh nào cũng có ít nhất 2-3 điểm
  const allProvinces = [
    "Bắc Kạn", "Lạng Sơn", "Tuyên Quang", "Thái Nguyên", "Phú Thọ", "Bắc Giang", "Điện Biên", "Lai Châu", "Sơn La", "Hòa Bình",
    "Thái Bình", "Nam Định", "Ninh Bình", "Vĩnh Phúc", "Bắc Ninh", "Hải Dương", "Hưng Yên", "Hải Phòng",
    "Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị", "Thừa Thiên Huế",
    "Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Khánh Hòa", "Ninh Thuận", "Bình Thuận",
    "Kon Tum", "Gia Lai", "Đắk Lắk", "Đắk Nông", "Lâm Đồng",
    "Bình Phước", "Tây Ninh", "Bình Dương", "Đồng Nai", "Bà Rịa - Vũng Tàu", "Hồ Chí Minh",
    "Long An", "Tiền Giang", "Bến Tre", "Trà Vinh", "Vĩnh Long", "Đồng Tháp", "An Giang", "Kiên Giang", "Cần Thơ", "Hậu Giang", "Sóc Trăng", "Bạc Liêu", "Cà Mau"
  ];

  for (const prov of allProvinces) {
    const count = await prisma.destination.count({ where: { province: prov, isDeleted: false } });
    if (count < 3) {
      // Nạp điểm placeholder thực tế cho tỉnh thiếu
      await prisma.destination.create({
        data: {
          name: `Trung tâm văn hóa ${prov}`,
          province: prov,
          category: "Văn hóa",
          latitude: "15.0000", // Sẽ được AI điều chỉnh khi gen trip nếu cần
          longitude: "105.0000",
          ticketPrice: 0,
          description: `Địa điểm tham quan tiêu biểu tại tỉnh ${prov}.`
        }
      });
      await prisma.destination.create({
        data: {
          name: `Chợ trung tâm ${prov}`,
          province: prov,
          category: "Mua sắm",
          latitude: "15.0100",
          longitude: "105.0100",
          ticketPrice: 0,
          description: `Nơi trải nghiệm đời sống địa phương tại ${prov}.`
        }
      });
      console.log(`- Added basic coverage for ${prov}`);
    }
  }

  console.log("Nationwide coverage seed finished!");
  process.exit(0);
}

seed();
