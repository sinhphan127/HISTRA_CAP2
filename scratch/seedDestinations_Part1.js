import prisma from "../src/config/prismaClient.js";

const data = [
  // --- ĐÀ NẴNG (Bổ sung thêm) ---
  { name: "Đỉnh Bàn Cờ", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "16.1215", longitude: "108.2831", ticketPrice: 0, description: "Điểm cao nhất bán đảo Sơn Trà, nơi có tượng Tiên ông đánh cờ." },
  { name: "Hải đăng Tiên Sa", province: "Đà Nẵng", category: "Kiến trúc", latitude: "16.1258", longitude: "108.2636", ticketPrice: 20000, description: "Ngọn hải đăng cổ kính với tầm nhìn ra biển Tiên Sa tuyệt đẹp." },
  { name: "Sơn Trà Tịnh Viên", province: "Đà Nẵng", category: "Tâm linh", latitude: "16.1058", longitude: "108.2636", ticketPrice: 0, description: "Khu bảo tồn tre trúc lớn nhất miền Trung." },
  { name: "Bãi biển Tiên Sa", province: "Đà Nẵng", category: "Biển", latitude: "16.1182", longitude: "108.2436", ticketPrice: 10000, description: "Bãi biển yên tĩnh, nước trong xanh bên chân núi Sơn Trà." },
  { name: "Ghềnh Bàng", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "16.1358", longitude: "108.3136", ticketPrice: 0, description: "Địa điểm check-in hoang sơ với những khối đá kỳ thú." },
  { name: "Bãi biển Non Nước", province: "Đà Nẵng", category: "Biển", latitude: "15.9864", longitude: "108.2736", ticketPrice: 0, description: "Bãi biển nằm cạnh danh thắng Ngũ Hành Sơn." },
  { name: "Bãi biển Nam Ô", province: "Đà Nẵng", category: "Biển", latitude: "16.1084", longitude: "108.1536", ticketPrice: 0, description: "Nổi tiếng với rạn san hô và món gỏi cá Nam Ô đặc sản." },
  { name: "Bãi biển Phạm Văn Đồng", province: "Đà Nẵng", category: "Biển", latitude: "16.0758", longitude: "108.2436", ticketPrice: 0, description: "Bãi biển công cộng hiện đại và sầm uất." },
  { name: "Chùa Quan Âm", province: "Đà Nẵng", category: "Tâm linh", latitude: "16.0025", longitude: "108.2650", ticketPrice: 0, description: "Ngôi chùa linh thiêng nằm trong lòng núi Ngũ Hành Sơn." },
  { name: "Làng đá mỹ nghệ Non Nước", province: "Đà Nẵng", category: "Làng nghề", latitude: "16.0029", longitude: "108.2618", ticketPrice: 0, description: "Làng nghề điêu khắc đá truyền thống hàng trăm năm tuổi." },
  { name: "Đèo Hải Vân", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "16.1836", longitude: "108.1250", ticketPrice: 0, description: "Thiên hạ đệ nhất hùng quan với cung đường uốn lượn mạo hiểm." },
  { name: "Công viên suối khoáng nóng Núi Thần Tài", province: "Đà Nẵng", category: "Giải trí", latitude: "15.9758", longitude: "107.9736", ticketPrice: 400000, description: "Tổ hợp nghỉ dưỡng và tắm khoáng nóng giữa thiên nhiên." },
  { name: "Khu du lịch Hòa Phú Thành", province: "Đà Nẵng", category: "Mạo hiểm", latitude: "15.9558", longitude: "107.9736", ticketPrice: 100000, description: "Nổi tiếng với trò chơi trượt thác mạo hiểm." },
  { name: "Giếng Trời", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "15.9958", longitude: "107.9536", ticketPrice: 0, description: "Địa điểm trekking và cắm trại hoang sơ giữa rừng." },
  { name: "Hồ Đồng Xanh – Đồng Nghệ", province: "Đà Nẵng", category: "Thiên nhiên", latitude: "15.9658", longitude: "108.0536", ticketPrice: 0, description: "Bức tranh sơn thủy hữu tình, thích hợp chèo kayak." },
  { name: "Chợ Cồn", province: "Đà Nẵng", category: "Mua sắm", latitude: "16.0684", longitude: "108.2161", ticketPrice: 0, description: "Thiên đường ẩm thực đường phố của Đà Nẵng." },
  { name: "Chợ đêm Sơn Trà", province: "Đà Nẵng", category: "Giải trí", latitude: "16.0614", longitude: "108.2284", ticketPrice: 0, description: "Chợ đêm sầm uất ngay gần chân Cầu Rồng." },

  // --- HÀ NỘI (Bổ sung thêm) ---
  { name: "Nhà tù Hỏa Lò", province: "Hà Nội", category: "Lịch sử", latitude: "21.0253", longitude: "105.8465", ticketPrice: 30000, description: "Di tích lịch sử minh chứng cho tinh thần bất khuất của dân tộc." },
  { name: "Nhà thờ Lớn Hà Nội", province: "Hà Nội", category: "Kiến trúc", latitude: "21.0288", longitude: "105.8490", ticketPrice: 0, description: "Công trình kiến trúc Gothic tiêu biểu giữa lòng phố cổ." },
  { name: "Chùa Trấn Quốc", province: "Hà Nội", category: "Tâm linh", latitude: "21.0478", longitude: "105.8367", ticketPrice: 0, description: "Ngôi chùa cổ nhất Hà Nội nằm bên Hồ Tây thơ mộng." },
  { name: "Cột cờ Hà Nội", province: "Hà Nội", category: "Lịch sử", latitude: "21.0333", longitude: "105.8394", ticketPrice: 20000, description: "Biểu tượng kiêu hãnh của thủ đô Hà Nội." },
  { name: "Bảo tàng Dân tộc học Việt Nam", province: "Hà Nội", category: "Bảo tàng", latitude: "21.0406", longitude: "105.7984", ticketPrice: 40000, description: "Nơi trưng bày văn hóa của 54 dân tộc Việt Nam." },
  { name: "Hồ Tây", province: "Hà Nội", category: "Thiên nhiên", latitude: "21.0583", longitude: "105.8236", ticketPrice: 0, description: "Lá phổi xanh và là nơi ngắm hoàng hôn đẹp nhất Hà Nội." },
  { name: "Phố Tạ Hiện", province: "Hà Nội", category: "Giải trí", latitude: "21.0343", longitude: "105.8528", ticketPrice: 0, description: "Phố bia sầm uất, náo nhiệt nhất về đêm tại Hà Nội." },
  { name: "Cầu Long Biên", province: "Hà Nội", category: "Lịch sử", latitude: "21.0435", longitude: "105.8569", ticketPrice: 0, description: "Chứng nhân lịch sử bắc ngang dòng sông Hồng." },
  { name: "Làng gốm Bát Tràng", province: "Hà Nội", category: "Làng nghề", latitude: "20.9758", longitude: "105.9125", ticketPrice: 0, description: "Làng nghề gốm sứ truyền thống nổi tiếng thế giới." },
  { name: "Làng cổ Đường Lâm", province: "Hà Nội", category: "Lịch sử", latitude: "21.0758", longitude: "105.4736", ticketPrice: 20000, description: "Bảo tàng sống của kiến trúc làng quê Việt xưa." },
  { name: "Làng lụa Vạn Phúc", province: "Hà Nội", category: "Làng nghề", latitude: "20.9758", longitude: "105.7736", ticketPrice: 0, description: "Nổi tiếng với những sản phẩm lụa tơ tằm tinh xảo." },
  { name: "Chùa Hương", province: "Hà Nội", category: "Tâm linh", latitude: "20.6158", longitude: "105.7436", ticketPrice: 80000, description: "Quần thể văn hóa - tôn giáo tiêu biểu của miền Bắc." },
  { name: "Thủy cung Lotte World Aquarium", province: "Hà Nội", category: "Giải trí", latitude: "21.0558", longitude: "105.8136", ticketPrice: 280000, description: "Thủy cung hiện đại bậc nhất Hà Nội tại Lotte Mall Tây Hồ." },

  // --- TP. HỒ CHÍ MINH (Bổ sung thêm) ---
  { name: "Landmark 81", province: "Hồ Chí Minh", category: "Giải trí", latitude: "10.7946", longitude: "106.7224", ticketPrice: 500000, description: "Tòa nhà cao nhất Việt Nam với đài quan sát SkyView." },
  { name: "Bitexco Financial Tower", province: "Hồ Chí Minh", category: "Giải trí", latitude: "10.7712", longitude: "106.7033", ticketPrice: 200000, description: "Biểu tượng hiện đại với hình dáng búp sen." },
  { name: "Phố Tây Bùi Viện", province: "Hồ Chí Minh", category: "Giải trí", latitude: "10.7675", longitude: "106.6918", ticketPrice: 0, description: "Khu phố không ngủ sầm uất của khách du lịch." },
  { name: "Đường sách Nguyễn Văn Bình", province: "Hồ Chí Minh", category: "Văn hóa", latitude: "10.7806", longitude: "106.6995", ticketPrice: 0, description: "Không gian đọc sách yên bình giữa lòng thành phố." },
  { name: "Cầu Ánh Sao", province: "Hồ Chí Minh", category: "Lãng mạn", latitude: "10.7259", longitude: "106.7161", ticketPrice: 0, description: "Điểm hẹn hò lý tưởng với hệ thống đèn led lung linh." },
  { name: "Nhà thờ Tân Định", province: "Hồ Chí Minh", category: "Kiến trúc", latitude: "10.7864", longitude: "106.6874", ticketPrice: 0, description: "Ngôi nhà thờ màu hồng nổi tiếng thu hút du khách." },
  { name: "Thảo Cầm Viên Sài Gòn", province: "Hồ Chí Minh", category: "Giải trí", latitude: "10.7866", longitude: "106.7058", ticketPrice: 60000, description: "Vườn thú lâu đời nhất Việt Nam." },
  { name: "Công viên nước Đầm Sen", province: "Hồ Chí Minh", category: "Giải trí", latitude: "10.7674", longitude: "106.6433", ticketPrice: 200000, description: "Công viên nước giải trí nổi tiếng của thành phố." },
  { name: "Địa đạo Củ Chi", province: "Hồ Chí Minh", category: "Lịch sử", latitude: "11.1444", longitude: "106.4715", ticketPrice: 35000, description: "Hệ thống phòng thủ trong lòng đất kỳ vĩ." },
  { name: "Cần Giờ (Đảo Khỉ)", province: "Hồ Chí Minh", category: "Thiên nhiên", latitude: "10.4286", longitude: "106.8622", ticketPrice: 35000, description: "Lá phổi xanh của Sài Gòn với hệ sinh thái rừng ngập mặn." },
  { name: "Chùa Ngọc Hoàng", province: "Hồ Chí Minh", category: "Tâm linh", latitude: "10.7867", longitude: "106.6946", ticketPrice: 0, description: "Ngôi chùa cổ kính nơi Tổng thống Obama từng ghé thăm." },
  { name: "Chùa Bà Thiên Hậu", province: "Hồ Chí Minh", category: "Tâm linh", latitude: "10.7533", longitude: "106.6617", ticketPrice: 0, description: "Ngôi chùa lâu đời của người Hoa tại Chợ Lớn." },
  { name: "Chợ Bình Tây", province: "Hồ Chí Minh", category: "Mua sắm", latitude: "10.7516", longitude: "106.6534", ticketPrice: 0, description: "Chợ đầu mối lớn nhất khu vực Chợ Lớn." }
];

async function seed() {
  console.log("Starting seed Part 1 (150+ destinations)...");
  
  for (const item of data) {
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

  console.log("Part 1 seed finished!");
  process.exit(0);
}

seed();
