import prisma from "../src/config/prismaClient.js";

const destinations = [
  // --- ĐÀ NẴNG ---
  { name: "Bà Nà Hills", province: "Đà Nẵng", category: "Khu du lịch", latitude: "15.9984", longitude: "107.9947", ticketPrice: 900000, description: "Khu du lịch trên đỉnh núi Chúa với Cầu Vàng nổi tiếng." },
  { name: "Cầu Rồng", province: "Đà Nẵng", category: "Kiến trúc", latitude: "16.0611", longitude: "108.2274", ticketPrice: 0, description: "Biểu tượng của thành phố Đà Nẵng, phun lửa và nước vào cuối tuần." },
  { name: "Bãi biển Mỹ Khê", province: "Đà Nẵng", category: "Biển", latitude: "16.0645", longitude: "108.2434", ticketPrice: 0, description: "Một trong những bãi biển quyến rũ nhất hành tinh." },
  { name: "Ngũ Hành Sơn", province: "Đà Nẵng", category: "Danh thắng", latitude: "16.0029", longitude: "108.2618", ticketPrice: 40000, description: "Quần thể 5 ngọn núi đá vôi với hệ thống hang động và chùa chiền." },
  { name: "Chùa Linh Ứng Sơn Trà", province: "Đà Nẵng", category: "Tâm linh", latitude: "16.1001", longitude: "108.2778", ticketPrice: 0, description: "Nơi có tượng Phật Bà Quan Âm cao nhất Việt Nam." },
  { name: "Bảo tàng Điêu khắc Chăm", province: "Đà Nẵng", category: "Bảo tàng", latitude: "16.0618", longitude: "108.2224", ticketPrice: 60000, description: "Nơi lưu giữ những hiện vật văn hóa Chăm Pa lớn nhất thế giới." },
  { name: "Bán đảo Sơn Trà", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "16.1158", longitude: "108.2736", ticketPrice: 0, description: "Lá phổi xanh của thành phố với hệ sinh thái đa dạng." },
  { name: "Cầu Tình Yêu", province: "Đà Nẵng", category: "Lãng mạn", latitude: "16.0664", longitude: "108.2284", ticketPrice: 0, description: "Nơi các cặp đôi treo ổ khóa tình yêu bên sông Hàn." },
  { name: "Chợ Hàn", province: "Đà Nẵng", category: "Mua sắm", latitude: "16.0684", longitude: "108.2241", ticketPrice: 0, description: "Chợ truyền thống sầm uất với nhiều đặc sản địa phương." },
  { name: "Công viên Châu Á (Asia Park)", province: "Đà Nẵng", category: "Giải trí", latitude: "16.0394", longitude: "108.2276", ticketPrice: 200000, description: "Công viên giải trí với vòng quay Mặt Trời Sun Wheel." },

  // --- HÀ NỘI ---
  { name: "Hồ Hoàn Kiếm", province: "Hà Nội", category: "Danh thắng", latitude: "21.0285", longitude: "105.8521", ticketPrice: 0, description: "Trái tim của thủ đô với Tháp Rùa và cầu Thê Húc." },
  { name: "Văn Miếu Quốc Tử Giám", province: "Hà Nội", category: "Lịch sử", latitude: "21.0294", longitude: "105.8361", ticketPrice: 30000, description: "Trường đại học đầu tiên của Việt Nam." },
  { name: "Lăng Chủ tịch Hồ Chí Minh", province: "Hà Nội", category: "Lịch sử", latitude: "21.0368", longitude: "105.8346", ticketPrice: 0, description: "Nơi an nghỉ của vị lãnh tụ kính yêu của dân tộc." },
  { name: "Nhà hát Lớn Hà Nội", province: "Hà Nội", category: "Kiến trúc", latitude: "21.0243", longitude: "105.8575", ticketPrice: 300000, description: "Kiến trúc Pháp cổ kính và sang trọng." },
  { name: "Hoàng thành Thăng Long", province: "Hà Nội", category: "Di sản", latitude: "21.0345", longitude: "105.8398", ticketPrice: 30000, description: "Di sản văn hóa thế giới với hàng ngàn năm lịch sử." },
  { name: "Chùa Một Cột", province: "Hà Nội", category: "Tâm linh", latitude: "21.0358", longitude: "105.8333", ticketPrice: 0, description: "Ngôi chùa có kiến trúc độc đáo hình bông sen." },
  { name: "Chợ Đồng Xuân", province: "Hà Nội", category: "Mua sắm", latitude: "21.0383", longitude: "105.8494", ticketPrice: 0, description: "Chợ đầu mối lớn nhất khu vực phố cổ." },

  // --- TP. HỒ CHÍ MINH ---
  { name: "Dinh Độc Lập", province: "Hồ Chí Minh", category: "Lịch sử", latitude: "10.7770", longitude: "106.6953", ticketPrice: 40000, description: "Di tích lịch sử quốc gia đặc biệt." },
  { name: "Nhà thờ Đức Bà", province: "Hồ Chí Minh", category: "Kiến trúc", latitude: "10.7797", longitude: "106.6990", ticketPrice: 0, description: "Biểu tượng kiến trúc Công giáo tại Sài Gòn." },
  { name: "Bưu điện Trung tâm Sài Gòn", province: "Hồ Chí Minh", category: "Kiến trúc", latitude: "10.7799", longitude: "106.6999", ticketPrice: 0, description: "Công trình kiến trúc Pháp tuyệt đẹp cạnh Nhà thờ Đức Bà." },
  { name: "Bảo tàng Chứng tích Chiến tranh", province: "Hồ Chí Minh", category: "Bảo tàng", latitude: "10.7794", longitude: "106.6921", ticketPrice: 40000, description: "Nơi lưu giữ những hình ảnh về cuộc chiến tranh Việt Nam." },
  { name: "Phố đi bộ Nguyễn Huệ", province: "Hồ Chí Minh", category: "Giải trí", latitude: "10.7745", longitude: "106.7031", ticketPrice: 0, description: "Không gian đi bộ và sự kiện sôi động giữa trung tâm." },
  { name: "Chợ Bến Thành", province: "Hồ Chí Minh", category: "Mua sắm", latitude: "10.7725", longitude: "106.6980", ticketPrice: 0, description: "Biểu tượng giao thương lâu đời của Sài Gòn." },

  // --- HỘI AN & HUẾ ---
  { name: "Phố cổ Hội An", province: "Quảng Nam", category: "Di sản", latitude: "15.8801", longitude: "108.3271", ticketPrice: 80000, description: "Vẻ đẹp vượt thời gian của thương cảng cổ xưa." },
  { name: "Đại Nội Huế", province: "Thừa Thiên Huế", category: "Lịch sử", latitude: "16.4678", longitude: "107.5788", ticketPrice: 200000, description: "Cung điện của vương triều nhà Nguyễn." },
  { name: "Chùa Thiên Mụ", province: "Thừa Thiên Huế", category: "Tâm linh", latitude: "16.4534", longitude: "107.5450", ticketPrice: 0, description: "Ngôi chùa cổ kính bên dòng sông Hương." },

  // --- ĐÀ LẠT ---
  { name: "Hồ Xuân Hương", province: "Lâm Đồng", category: "Thiên nhiên", latitude: "11.9405", longitude: "108.4447", ticketPrice: 0, description: "Viên ngọc xanh giữa lòng Đà Lạt." },
  { name: "Thung lũng Tình Yêu", province: "Lâm Đồng", category: "Khu du lịch", latitude: "11.9772", longitude: "108.4490", ticketPrice: 250000, description: "Thắng cảnh thơ mộng và lãng mạn." },
  { name: "Quảng trường Lâm Viên", province: "Lâm Đồng", category: "Giải trí", latitude: "11.9392", longitude: "108.4442", ticketPrice: 0, description: "Nơi có nụ hoa Atiso và hoa Dã Quỳ khổng lồ." }
];

async function seed() {
  console.log("Starting seed destinations...");
  
  for (const item of destinations) {
    try {
      const existing = await prisma.destination.findFirst({
        where: { name: item.name }
      });

      if (existing) {
        await prisma.destination.update({
          where: { id: existing.id },
          data: {
            province: item.province,
            category: item.category,
            latitude: item.latitude,
            longitude: item.longitude,
            ticketPrice: item.ticketPrice,
            description: item.description,
            isDeleted: false
          }
        });
        console.log(`- Updated: ${item.name}`);
      } else {
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

  console.log("Seed finished!");
  process.exit(0);
}

seed();
