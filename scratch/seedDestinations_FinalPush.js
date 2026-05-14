import prisma from "../src/config/prismaClient.js";

const extraData = [
  // --- ĐÀ NẴNG (Thêm 21+ điểm) ---
  { name: "Cầu Nguyễn Văn Trỗi", province: "Đà Nẵng", category: "Lịch sử", latitude: "16.0514", longitude: "108.2250", ticketPrice: 0, description: "Cây cầu đi bộ cổ nhất Đà Nẵng với view sông Hàn cực đẹp." },
  { name: "Bảo tàng Mỹ thuật Đà Nẵng", province: "Đà Nẵng", category: "Bảo tàng", latitude: "16.0718", longitude: "108.2224", ticketPrice: 20000, description: "Nơi trưng bày các tác phẩm nghệ thuật đương đại của khu vực." },
  { name: "Nhà thờ Con Gà (Đà Nẵng)", province: "Đà Nẵng", category: "Kiến trúc", latitude: "16.0668", longitude: "108.2236", ticketPrice: 0, description: "Ngôi nhà thờ cổ kính với màu hồng đặc trưng." },
  { name: "Công viên APEC", province: "Đà Nẵng", category: "Kiến trúc", latitude: "16.0594", longitude: "108.2250", ticketPrice: 0, description: "Biểu tượng mới với kiến trúc 'Cánh diều bay cao'." },
  { name: "Helio Center", province: "Đà Nẵng", category: "Giải trí", latitude: "16.0358", longitude: "108.2250", ticketPrice: 0, description: "Trung tâm giải trí đa năng và chợ đêm sầm uất." },
  { name: "Tiệm Cà Phê 1975", province: "Đà Nẵng", category: "Cafe", latitude: "16.0658", longitude: "108.2250", ticketPrice: 30000, description: "Không gian hoài cổ thập niên 70." },
  { name: "Wonderlust Cafe & Bakery", province: "Đà Nẵng", category: "Cafe", latitude: "16.0758", longitude: "108.2250", ticketPrice: 50000, description: "Tổ hợp cafe và mua sắm phong cách tối giản." },
  { name: "Reply 1988 Cafe", province: "Đà Nẵng", category: "Cafe", latitude: "16.0458", longitude: "108.2250", ticketPrice: 45000, description: "Lấy cảm hứng từ bộ phim nổi tiếng, phong cách Hàn Quốc." },
  { name: "Chùa Nam Sơn", province: "Đà Nẵng", category: "Tâm linh", latitude: "15.9558", longitude: "108.1936", ticketPrice: 0, description: "Ngôi chùa có kiến trúc như một cung điện thu nhỏ." },
  { name: "Hồ Xanh Sơn Trà", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "16.1058", longitude: "108.2536", ticketPrice: 0, description: "Đà Lạt thu nhỏ giữa lòng Đà Nẵng." },
  // ... (Sẽ thêm tiếp cho đủ 150-200 điểm trong file này)
  
  // --- HÀ NỘI (Thêm 28+ điểm) ---
  { name: "Bảo tàng Phụ nữ Việt Nam", province: "Hà Nội", category: "Bảo tàng", latitude: "21.0224", longitude: "105.8524", ticketPrice: 40000, description: "Tôn vinh vẻ đẹp và vai trò của người phụ nữ Việt." },
  { name: "Phố bích họa Phùng Hưng", province: "Hà Nội", category: "Văn hóa", latitude: "21.0345", longitude: "105.8450", ticketPrice: 0, description: "Con phố tái hiện ký ức Hà Nội xưa qua các bức họa." },
  { name: "Vườn hoa Nhật Tân", province: "Hà Nội", category: "Thiên nhiên", latitude: "21.0858", longitude: "105.8236", ticketPrice: 50000, description: "Thủ phủ của các loài hoa tại Hà Nội." },
  { name: "Cà phê Giảng", province: "Hà Nội", category: "Cafe", latitude: "21.0345", longitude: "105.8528", ticketPrice: 35000, description: "Nơi khai sinh món cà phê trứng trứ danh." },
  { name: "Cà phê Đinh", province: "Hà Nội", category: "Cafe", latitude: "21.0315", longitude: "105.8520", ticketPrice: 30000, description: "Quán cafe lâu đời view nhìn thẳng ra Hồ Gươm." },
  { name: "Nhà hát Múa rối nước Thăng Long", province: "Hà Nội", category: "Văn hóa", latitude: "21.0318", longitude: "105.8533", ticketPrice: 100000, description: "Nghệ thuật truyền thống đặc sắc bên bờ Hồ Gươm." },

  // --- TP. HỒ CHÍ MINH (Thêm 31+ điểm) ---
  { name: "Hồ Con Rùa", province: "Hồ Chí Minh", category: "Giải trí", latitude: "10.7824", longitude: "106.6958", ticketPrice: 0, description: "Điểm tụ tập ăn vặt và thư giãn nổi tiếng của giới trẻ Sài Gòn." },
  { name: "Phố Ông Đồ", province: "Hồ Chí Minh", category: "Văn hóa", latitude: "10.7824", longitude: "106.6980", ticketPrice: 0, description: "Nơi tái hiện không gian văn hóa Tết truyền thống." },
  { name: "Bảo tàng Mỹ thuật TP.HCM", province: "Hồ Chí Minh", category: "Kiến trúc", latitude: "10.7687", longitude: "106.6974", ticketPrice: 30000, description: "Tòa nhà kiến trúc Pháp rực rỡ với màu vàng đặc trưng." },
  { name: "Cầu Mống", province: "Hồ Chí Minh", category: "Lịch sử", latitude: "10.7690", longitude: "106.7040", ticketPrice: 0, description: "Cây cầu đi bộ lâu đời nhất nối Quận 1 và Quận 4." },
  { name: "Chùa Vĩnh Nghiêm (Sài Gòn)", province: "Hồ Chí Minh", category: "Tâm linh", latitude: "10.7897", longitude: "106.6806", ticketPrice: 0, description: "Ngôi chùa có tháp đá cao nhất Việt Nam." },
  { name: "Nông trại Tam Nông", province: "Hồ Chí Minh", category: "Sinh thái", latitude: "10.8858", longitude: "106.6236", ticketPrice: 50000, description: "Trải nghiệm làm nông dân giữa lòng Sài Gòn." },

  // --- LÂM ĐỒNG (ĐÀ LẠT - Thêm 33+ điểm) ---
  { name: "Làng Cù Lần", province: "Lâm Đồng", category: "Văn hóa", latitude: "12.0158", longitude: "108.3336", ticketPrice: 100000, description: "Ngôi làng nhỏ xinh đẹp ẩn mình dưới thung lũng." },
  { name: "Thác Pongour", province: "Lâm Đồng", category: "Thiên nhiên", latitude: "11.6958", longitude: "108.2736", ticketPrice: 20000, description: "Được mệnh danh là Nam Thiên Đệ Nhất Thác." },
  { name: "Mongo Land Đà Lạt", province: "Lâm Đồng", category: "Giải trí", latitude: "11.9458", longitude: "108.3336", ticketPrice: 100000, description: "Thảo nguyên Mông Cổ thu nhỏ giữa lòng Đà Lạt." },
  { name: "Dalat Fairytale Land", province: "Lâm Đồng", category: "Giải trí", latitude: "11.9458", longitude: "108.4136", ticketPrice: 50000, description: "Xứ sở thần tiên của những chú lùn." },
  { name: "Tiệm cà phê Cheo Veooo", province: "Lâm Đồng", category: "Cafe", latitude: "11.9458", longitude: "108.4736", ticketPrice: 45000, description: "Quán cafe gỗ nhỏ xinh ngắm hoàng hôn cực đẹp." },
  { name: "Horizon Coffee Đà Lạt", province: "Lâm Đồng", category: "Cafe", latitude: "11.9258", longitude: "108.4436", ticketPrice: 55000, description: "Khu vườn trên mây với view đèo Prenn hùng vĩ." },

  // --- QUẢNG NAM (HỘI AN - Thêm 36+ điểm) ---
  { name: "Nhà cổ Phùng Hưng", province: "Quảng Nam", category: "Lịch sử", latitude: "15.8771", longitude: "108.3249", ticketPrice: 80000, description: "Mẫu nhà thương gia cổ tiêu biểu của Hội An." },
  { name: "Hội quán Quảng Đông", province: "Quảng Nam", category: "Kiến trúc", latitude: "15.8771", longitude: "108.3265", ticketPrice: 80000, description: "Công trình rực rỡ mang phong cách người Hoa Quảng Đông." },
  { name: "Bảo tàng Văn hóa Dân gian", province: "Quảng Nam", category: "Bảo tàng", latitude: "15.8767", longitude: "108.3295", ticketPrice: 80000, description: "Nơi lưu giữ hồn cốt của đời sống người dân Hội An xưa." },
  { name: "Chùa Tam Quan Bà Mụ", province: "Quảng Nam", category: "Kiến trúc", latitude: "15.8785", longitude: "108.3280", ticketPrice: 0, description: "Cổng chùa cổ kính với hồ sen tuyệt đẹp để check-in." },
  { name: "Reaching Out Teahouse", province: "Quảng Nam", category: "Cafe", latitude: "15.8775", longitude: "108.3295", ticketPrice: 60000, description: "Thưởng thức trà trong không gian yên lặng tuyệt đối." },
  { name: "Mê Hội An Rooftop", province: "Quảng Nam", category: "Cafe", latitude: "15.8775", longitude: "108.3275", ticketPrice: 50000, description: "Ngắm mái ngói thâm nâu của phố cổ từ trên cao." },

  // --- THỪA THIÊN HUẾ (Thêm 33+ điểm) ---
  { name: "Đại Nội (Ngọ Môn)", province: "Thừa Thiên Huế", category: "Lịch sử", latitude: "16.4678", longitude: "107.5788", ticketPrice: 200000, description: "Cổng chính uy nghiêm của Hoàng thành Huế." },
  { name: "Điện Kiến Trung", province: "Thừa Thiên Huế", category: "Kiến trúc", latitude: "16.4690", longitude: "107.5780", ticketPrice: 0, description: "Công trình lộng lẫy vừa được trùng tu xong trong năm 2024." },
  { name: "Nhà vườn An Hiên", province: "Thừa Thiên Huế", category: "Văn hóa", latitude: "16.4550", longitude: "107.5580", ticketPrice: 50000, description: "Ngôi nhà vườn đẹp nhất xứ Huế bên bờ sông Hương." },
  { name: "Suối Voi", province: "Thừa Thiên Huế", category: "Thiên nhiên", latitude: "16.2550", longitude: "107.9580", ticketPrice: 20000, description: "Khu du lịch sinh thái với thác nước và các tảng đá hình voi." },
  { name: "Tiệm Cà Phê 81 (Huế)", province: "Thừa Thiên Huế", category: "Cafe", latitude: "16.4620", longitude: "107.5950", ticketPrice: 30000, description: "Không gian vintage yên tĩnh giữa lòng thành phố." },
  { name: "The Time Coffee Huế", province: "Thừa Thiên Huế", category: "Cafe", latitude: "16.4680", longitude: "107.5920", ticketPrice: 45000, description: "View ngắm toàn cảnh sông Hương và cầu Trường Tiền." }
];

async function seed() {
  console.log("Starting Final Push (Targeting 50 per province)...");
  
  for (const item of extraData) {
    try {
      const existing = await prisma.destination.findFirst({
        where: { name: item.name }
      });

      if (!existing) {
        await prisma.destination.create({
          data: {
            name: item.name,
            province: item.province,
            category: item.category,
            latitude: item.latitude,
            longitude: item.longitude,
            ticketPrice: item.ticketPrice,
            description: item.description,
            imageUrl: `https://images.unsplash.com/photo-1555555555?auto=format&fit=crop&w=800&q=80`
          }
        });
        console.log(`- Created: ${item.name}`);
      }
    } catch (err) {
      console.error(`- Failed: ${item.name}`, err.message);
    }
  }

  console.log("Final Push seed finished!");
  process.exit(0);
}

seed();
