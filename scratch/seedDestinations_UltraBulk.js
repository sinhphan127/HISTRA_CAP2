import prisma from "../src/config/prismaClient.js";

const generateBatch = (province, count, startId) => {
  const categories = ["Cafe", "Nhà hàng", "Công viên", "Điểm check-in", "Văn hóa"];
  const batch = [];
  for (let i = 1; i <= count; i++) {
    // Logic sinh tọa độ an toàn: Cố định 4 chữ số thập phân
    const latBase = 16.0;
    const lngBase = 108.2;
    const offset = (i * 0.001);
    
    batch.push({
      name: `${province} Attraction ${startId + i}`,
      province: province,
      category: categories[i % categories.length],
      latitude: (latBase + offset).toFixed(4),
      longitude: (lngBase + offset).toFixed(4),
      ticketPrice: i % 3 === 0 ? 50000 : 0,
      description: `Một điểm tham quan thú vị tại ${province} mà bạn không nên bỏ lỡ.`
    });
  }
  return batch;
};

const ultraData = [
  // --- ĐÀ NẴNG ---
  { name: "Tiệm Cà Phê Gió Nam", province: "Đà Nẵng", category: "Cafe", latitude: "16.0821", longitude: "108.2541", ticketPrice: 0, description: "View biển Sơn Trà cực đẹp." },
  { name: "Cơm Niêu Nhà Đỏ", province: "Đà Nẵng", category: "Nhà hàng", latitude: "16.0621", longitude: "108.2141", ticketPrice: 0, description: "Đặc sản cơm niêu truyền thống." },
  { name: "Bánh tráng thịt heo Trần", province: "Đà Nẵng", category: "Nhà hàng", latitude: "16.0721", longitude: "108.2241", ticketPrice: 0, description: "Thương hiệu bánh tráng nổi tiếng nhất Đà Nẵng." },
  { name: "Danang Souvenirs & Cafe", province: "Đà Nẵng", category: "Cafe", latitude: "16.0821", longitude: "108.2241", ticketPrice: 0, description: "Không gian quà lưu niệm kết hợp cafe." },
  { name: "Golem Coffee", province: "Đà Nẵng", category: "Cafe", latitude: "16.0621", longitude: "108.2241", ticketPrice: 0, description: "Quán cafe phong cách bụi bặm, độc đáo." },
  { name: "Hải sản Năm Đảnh", province: "Đà Nẵng", category: "Nhà hàng", latitude: "16.1021", longitude: "108.2641", ticketPrice: 0, description: "Hải sản ngon bổ rẻ nổi tiếng giới trẻ." },
  { name: "Chè Liên Đà Nẵng", province: "Đà Nẵng", category: "Nhà hàng", latitude: "16.0621", longitude: "108.2041", ticketPrice: 0, description: "Chè sầu riêng nức tiếng gần xa." },
  { name: "Bãi Đá Đen", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "16.1221", longitude: "108.2841", ticketPrice: 0, description: "Điểm cắm trại lý tưởng tại Sơn Trà." },
  { name: "Cây Đa Ngàn Năm", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "16.1321", longitude: "108.3041", ticketPrice: 0, description: "Cây di sản trên bán đảo Sơn Trà." },
  { name: "Mũi Nghê", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "16.1121", longitude: "108.3241", ticketPrice: 0, description: "Điểm đón bình minh sớm nhất Đà Nẵng." },
  { name: "Rừng Hà Gia", province: "Đà Nẵng", category: "Khu du lịch", latitude: "15.9321", longitude: "108.2541", ticketPrice: 100000, description: "Khu sinh thái và trò chơi dân gian." },
  { name: "Đồng Xanh Đồng Nghệ", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "15.9621", longitude: "108.0541", ticketPrice: 0, description: "Hồ nước thơ mộng cho dã ngoại." },

  // --- HÀ NỘI ---
  { name: "Phở Gia Truyền Bát Đàn", province: "Hà Nội", category: "Nhà hàng", latitude: "21.0321", longitude: "105.8441", ticketPrice: 0, description: "Hương vị phở bò Hà Nội truyền thống." },
  { name: "Bún chả Tuyết 34", province: "Hà Nội", category: "Nhà hàng", latitude: "21.0321", longitude: "105.8541", ticketPrice: 0, description: "Bún chả ngon nổi tiếng tại phố cổ." },
  { name: "Cà phê Nhĩ", province: "Hà Nội", category: "Cafe", latitude: "21.0321", longitude: "105.8541", ticketPrice: 0, description: "Một trong 'tứ trụ' cafe Hà Nội xưa." },
  { name: "Cà phê Lâm", province: "Hà Nội", category: "Cafe", latitude: "21.0321", longitude: "105.8541", ticketPrice: 0, description: "Quán cafe của những danh họa." },
  { name: "Kem Tràng Tiền", province: "Hà Nội", category: "Nhà hàng", latitude: "21.0221", longitude: "105.8541", ticketPrice: 0, description: "Hương vị kem biểu tượng của thủ đô." },
  { name: "Vườn Bách Thảo Hà Nội", province: "Hà Nội", category: "Công viên", latitude: "21.0421", longitude: "105.8341", ticketPrice: 0, description: "Không gian xanh yên bình bên Lăng Bác." },
  { name: "Phố sách Hà Nội", province: "Hà Nội", category: "Văn hóa", latitude: "21.0221", longitude: "105.8441", ticketPrice: 0, description: "Phố đi bộ dành riêng cho người yêu sách." },
  { name: "Tòa soạn báo Hà Nội Mới", province: "Hà Nội", category: "Check-in", latitude: "21.0321", longitude: "105.8541", ticketPrice: 0, description: "Góc tường vàng huyền thoại giữa phố cổ." },
  { name: "Chùa Hàm Long", province: "Hà Nội", category: "Tâm linh", latitude: "21.0221", longitude: "105.8541", ticketPrice: 0, description: "Ngôi chùa linh thiêng và thanh tịnh." },

  // --- TP. HỒ CHÍ MINH ---
  { name: "The Cafe Apartments 42 Nguyễn Huệ", province: "Hồ Chí Minh", category: "Cafe", latitude: "10.7721", longitude: "106.7041", ticketPrice: 0, description: "Tòa chung cư cafe độc đáo nhất Sài Gòn." },
  { name: "Cà phê Vợt Phan Đình Phùng", province: "Hồ Chí Minh", category: "Cafe", latitude: "10.8021", longitude: "106.6841", ticketPrice: 0, description: "Cafe vợt mở cửa 24/7 suốt 60 năm qua." },
  { name: "Cơm tấm Ba Ghiền", province: "Hồ Chí Minh", category: "Nhà hàng", latitude: "10.7921", longitude: "106.6741", ticketPrice: 0, description: "Cơm tấm sườn khổng lồ đạt chuẩn Michelin." },
  { name: "Bánh mì Huỳnh Hoa", province: "Hồ Chí Minh", category: "Nhà hàng", latitude: "10.7721", longitude: "106.6941", ticketPrice: 0, description: "Ổ bánh mì đắt nhất nhưng cũng ngon nhất Sài Gòn." },
  { name: "Ốc Đào", province: "Hồ Chí Minh", category: "Nhà hàng", latitude: "10.7621", longitude: "106.6841", ticketPrice: 0, description: "Thiên đường các món ốc đa dạng." },
  { name: "Snow Town Sài Gòn", province: "Hồ Chí Minh", category: "Giải trí", latitude: "10.7621", longitude: "106.7441", ticketPrice: 150000, description: "Trải nghiệm tuyết rơi giữa lòng thành phố nhiệt đới." },
  { name: "Saigon Outcast", province: "Hồ Chí Minh", category: "Văn hóa", latitude: "10.8021", longitude: "106.7441", ticketPrice: 0, description: "Không gian nghệ thuật và thể thao ngoài trời tại Thảo Điền." },
  { name: "Công viên Gia Định", province: "Hồ Chí Minh", category: "Công viên", latitude: "10.8121", longitude: "106.6741", ticketPrice: 0, description: "Công viên có nhiều cây cổ thụ xanh mát nhất thành phố." },

  // --- LÂM ĐỒNG (ĐÀ LẠT) ---
  { name: "Tiệm Cà Phê Bình Minh Ơi", province: "Lâm Đồng", category: "Cafe", latitude: "11.9321", longitude: "108.4541", ticketPrice: 50000, description: "View săn mây cực chất." },
  { name: "Still Café Đà Lạt", province: "Lâm Đồng", category: "Cafe", latitude: "11.9421", longitude: "108.4541", ticketPrice: 0, description: "Phong cách Nhật Bản giữa lòng Đà Lạt." },
  { name: "Tiệm cà phê Cô Bông", province: "Lâm Đồng", category: "Cafe", latitude: "11.9421", longitude: "108.4541", ticketPrice: 0, description: "Không gian bao cấp, hoài niệm tuổi thơ." },
  { name: "Cafe Tùng Đà Lạt", province: "Lâm Đồng", category: "Cafe", latitude: "11.9421", longitude: "108.4441", ticketPrice: 0, description: "Quán cafe của các nghệ sĩ gạo cội như Trịnh Công Sơn." },
  { name: "Lưng Chừng Cà Phê", province: "Lâm Đồng", category: "Cafe", latitude: "11.9321", longitude: "108.4441", ticketPrice: 0, description: "Quán cafe gỗ ẩn mình bên sườn đồi." },
  { name: "An Sơn Hồ Đà Lạt", province: "Lâm Đồng", category: "Nhà hàng", latitude: "11.9121", longitude: "108.4241", ticketPrice: 0, description: "Phượng Hoàng Cổ Trấn thu nhỏ của Đà Lạt." },
  { name: "Tiệm gà Túi Mơ To", province: "Lâm Đồng", category: "Nhà hàng", latitude: "11.9421", longitude: "108.4841", ticketPrice: 0, description: "Ăn lẩu gà lá é trong không gian thơ mộng." },
  { name: "Biệt thự Hằng Nga (Crazy House)", province: "Lâm Đồng", category: "Kiến trúc", latitude: "11.9321", longitude: "108.4341", ticketPrice: 60000, description: "Công trình kiến trúc kỳ quái lọt top thế giới." },

  // --- QUẢNG NAM (HỘI AN) ---
  { name: "Nhà cổ Đức An", province: "Quảng Nam", category: "Lịch sử", latitude: "15.8721", longitude: "108.3241", ticketPrice: 80000, description: "Ngôi nhà cổ mang đậm nét triết học Á Đông." },
  { name: "Hội quán Triều Châu", province: "Quảng Nam", category: "Kiến trúc", latitude: "15.8821", longitude: "108.3341", ticketPrice: 80000, description: "Nổi tiếng với những nét chạm trổ gỗ tinh xảo." },
  { name: "Hội quán Hải Nam", province: "Quảng Nam", category: "Kiến trúc", latitude: "15.8721", longitude: "108.3341", ticketPrice: 0, description: "Nơi thờ các thương nhân thiệt mạng trên biển." },
  { name: "Xưởng thủ công mỹ nghệ Hội An", province: "Quảng Nam", category: "Văn hóa", latitude: "15.8721", longitude: "108.3241", ticketPrice: 0, description: "Nơi biểu diễn các nghề thủ công truyền thống." },
  { name: "92 Station Cafe", province: "Quảng Nam", category: "Cafe", latitude: "15.8721", longitude: "108.3241", ticketPrice: 0, description: "View rooftop ngắm phố cổ siêu đẹp." },
  { name: "Hoi An Roastery (Lê Lợi)", province: "Quảng Nam", category: "Cafe", latitude: "15.8721", longitude: "108.3341", ticketPrice: 0, description: "Chuỗi cafe rang xay nổi tiếng nhất Hội An." },
  { name: "The Espresso Station", province: "Quảng Nam", category: "Cafe", latitude: "15.8821", longitude: "108.3241", ticketPrice: 0, description: "Ẩn mình trong hẻm nhưng cafe cực ngon." },
  { name: "Lò gạch cũ Hội An", province: "Quảng Nam", category: "Check-in", latitude: "15.8521", longitude: "108.3041", ticketPrice: 0, description: "Nấc thang lên thiên đường giữa đồng lúa." },

  // --- THỪA THIÊN HUẾ ---
  { name: "Lăng Gia Long", province: "Thừa Thiên Huế", category: "Lịch sử", latitude: "16.3421", longitude: "107.5941", ticketPrice: 50000, description: "Ngôi lăng uy nghiêm của vị vua đầu triều Nguyễn." },
  { name: "Lăng Đồng Khánh", province: "Thừa Thiên Huế", category: "Lịch sử", latitude: "16.4321", longitude: "107.5741", ticketPrice: 50000, description: "Kiến trúc kết hợp giữa truyền thống và tân thời." },
  { name: "Hổ Quyền", province: "Thừa Thiên Huế", category: "Lịch sử", latitude: "16.4521", longitude: "107.5541", ticketPrice: 0, description: "Đấu trường voi và hổ duy nhất còn lại của Việt Nam." },
  { name: "Điện Hòn Chén", province: "Thừa Thiên Huế", category: "Tâm linh", latitude: "16.4321", longitude: "107.5341", ticketPrice: 50000, description: "Nơi thờ Thánh Mẫu Thiên Y A Na linh thiêng." },
  { name: "Suối Khoáng Nóng Alba Thanh Tân", province: "Thừa Thiên Huế", category: "Giải trí", latitude: "16.4821", longitude: "107.4541", ticketPrice: 180000, description: "Nghỉ dưỡng khoáng nóng và trò chơi Zipline." },
  { name: "Hue Roastery Cafe", province: "Thừa Thiên Huế", category: "Cafe", latitude: "16.4721", longitude: "107.5941", ticketPrice: 0, description: "View ngắm phố cổ Huế bình dị bên sông." }
];

async function seed() {
  console.log("Starting Fixed Ultra Bulk Seed...");
  
  for (const item of ultraData) {
    try {
      const existing = await prisma.destination.findFirst({
        where: { name: item.name }
      });

      if (!existing) {
        await prisma.destination.create({ data: item });
        console.log(`- Created (Real): ${item.name}`);
      }
    } catch (err) {
      console.error(`- Failed: ${item.name}`, err.message);
    }
  }

  const targetProvinces = ["Đà Nẵng", "Hà Nội", "Hồ Chí Minh", "Thừa Thiên Huế", "Quảng Nam", "Lâm Đồng"];
  
  for (const province of targetProvinces) {
    const currentCount = await prisma.destination.count({ where: { province, isDeleted: false } });
    if (currentCount < 55) {
      const needed = 55 - currentCount;
      console.log(`Filling ${needed} more for ${province}...`);
      const extraBatch = generateBatch(province, needed, currentCount);
      for (const item of extraBatch) {
        try {
           await prisma.destination.create({ data: item });
        } catch (e) {
           console.error(`- Error generating for ${province}:`, e.message);
        }
      }
    }
  }

  console.log("Ultra Bulk seed finished!");
  process.exit(0);
}

seed();
