import prisma from "../src/config/prismaClient.js";

const data = [
  // --- THỪA THIÊN HUẾ (Bổ sung) ---
  { name: "Lăng Tự Đức", province: "Thừa Thiên Huế", category: "Lịch sử", latitude: "16.4344", longitude: "107.5650", ticketPrice: 150000, description: "Ngôi lăng thơ mộng nhất của triều Nguyễn." },
  { name: "Lăng Khải Định", province: "Thừa Thiên Huế", category: "Lịch sử", latitude: "16.3989", longitude: "107.5936", ticketPrice: 150000, description: "Kiến trúc giao thoa Đông - Tây tinh xảo." },
  { name: "Lăng Minh Mạng", province: "Thừa Thiên Huế", category: "Lịch sử", latitude: "16.3889", longitude: "107.5736", ticketPrice: 150000, description: "Vẻ đẹp uy nghiêm, hài hòa giữa kiến trúc và thiên nhiên." },
  { name: "Cung An Định", province: "Thừa Thiên Huế", category: "Kiến trúc", latitude: "16.4589", longitude: "107.5936", ticketPrice: 50000, description: "Viên ngọc kiến trúc Pháp - Việt của Nam Phương Hoàng hậu." },
  { name: "Làng hương Thủy Xuân", province: "Thừa Thiên Huế", category: "Văn hóa", latitude: "16.4450", longitude: "107.5650", ticketPrice: 0, description: "Làng nghề làm hương rực rỡ sắc màu." },
  { name: "Đồi Vọng Cảnh", province: "Thừa Thiên Huế", category: "Thiên nhiên", latitude: "16.4350", longitude: "107.5550", ticketPrice: 0, description: "Điểm ngắm nhìn toàn cảnh sông Hương từ trên cao." },
  { name: "Chợ Đông Ba", province: "Thừa Thiên Huế", category: "Mua sắm", latitude: "16.4689", longitude: "107.5936", ticketPrice: 0, description: "Chợ truyền thống sầm uất nhất Cố đô." },
  { name: "Phá Tam Giang", province: "Thừa Thiên Huế", category: "Thiên nhiên", latitude: "16.5589", longitude: "107.5136", ticketPrice: 0, description: "Hệ đầm phá lớn nhất Đông Nam Á." },
  { name: "Rừng ngập mặn Rú Chá", province: "Thừa Thiên Huế", category: "Thiên nhiên", latitude: "16.5289", longitude: "107.6136", ticketPrice: 0, description: "Khu rừng ngập mặn nguyên sinh duy nhất tại phá Tam Giang." },
  { name: "Vịnh Lăng Cô", province: "Thừa Thiên Huế", category: "Biển", latitude: "16.2289", longitude: "108.1136", ticketPrice: 0, description: "Một trong những vịnh biển đẹp nhất thế giới." },
  { name: "Huyền Không Sơn Thượng", province: "Thừa Thiên Huế", category: "Tâm linh", latitude: "16.4889", longitude: "107.5136", ticketPrice: 0, description: "Ngôi chùa ẩn mình trong rừng thông yên tĩnh." },
  { name: "Cầu Trường Tiền", province: "Thừa Thiên Huế", category: "Lịch sử", latitude: "16.4680", longitude: "107.5910", ticketPrice: 0, description: "Cây cầu biểu tượng nối đôi bờ sông Hương." },
  { name: "Highlands Đại Nội Huế", province: "Thừa Thiên Huế", category: "Cafe", latitude: "16.4678", longitude: "107.5788", ticketPrice: 50000, description: "Thưởng thức cafe trong không gian cung đình cổ kính." },
  { name: "Cà phê muối Huế (Trương Định)", province: "Thừa Thiên Huế", category: "Cafe", latitude: "16.4640", longitude: "107.5930", ticketPrice: 20000, description: "Địa chỉ gốc của món cà phê muối nổi tiếng đất Cố đô." },

  // --- QUẢNG NAM (HỘI AN) ---
  { name: "Chùa Cầu", province: "Quảng Nam", category: "Lịch sử", latitude: "15.8771", longitude: "108.3259", ticketPrice: 0, description: "Biểu tượng của phố cổ Hội An." },
  { name: "Hội quán Phúc Kiến", province: "Quảng Nam", category: "Kiến trúc", latitude: "15.8776", longitude: "108.3315", ticketPrice: 80000, description: "Hội quán quy mô nhất của người Hoa tại Hội An." },
  { name: "Nhà cổ Tấn Ký", province: "Quảng Nam", category: "Lịch sử", latitude: "15.8767", longitude: "108.3283", ticketPrice: 80000, description: "Ngôi nhà cổ hơn 200 năm tuổi với kiến trúc độc đáo." },
  { name: "Rừng dừa Bảy Mẫu", province: "Quảng Nam", category: "Thiên nhiên", latitude: "15.8658", longitude: "108.3636", ticketPrice: 30000, description: "Trải nghiệm đi thuyền thúng giữa rừng dừa ngập mặn." },
  { name: "VinWonders Nam Hội An", province: "Quảng Nam", category: "Giải trí", latitude: "15.7858", longitude: "108.4136", ticketPrice: 600000, description: "Tổ hợp giải trí và trải nghiệm văn hóa đa quốc gia." },
  { name: "Biển An Bàng", province: "Quảng Nam", category: "Biển", latitude: "15.9084", longitude: "108.3436", ticketPrice: 0, description: "Bãi biển yên bình từng lọt top đẹp nhất thế giới." },
  { name: "Làng gốm Thanh Hà", province: "Quảng Nam", category: "Làng nghề", latitude: "15.8784", longitude: "108.3036", ticketPrice: 35000, description: "Làng nghề gốm truyền thống bên dòng sông Thu Bồn." },
  { name: "Thánh địa Mỹ Sơn", province: "Quảng Nam", category: "Di sản", latitude: "15.7658", longitude: "108.1236", ticketPrice: 150000, description: "Di sản văn hóa thế giới của vương triều Chăm Pa." },
  { name: "Faifo Coffee", province: "Quảng Nam", category: "Cafe", latitude: "15.8775", longitude: "108.3285", ticketPrice: 50000, description: "Quán cafe rooftop ngắm phố cổ từ trên cao nổi tiếng." },
  { name: "Cù Lao Chàm", province: "Quảng Nam", category: "Biển", latitude: "15.9389", longitude: "108.5136", ticketPrice: 70000, description: "Khu dự trữ sinh quyển thế giới với biển xanh cát trắng." },
  { name: "Làng rau Trà Quế", province: "Quảng Nam", category: "Văn hóa", latitude: "15.9034", longitude: "108.3285", ticketPrice: 35000, description: "Trải nghiệm làm nông dân tại làng rau sạch lâu đời." },

  // --- LÂM ĐỒNG (ĐÀ LẠT) ---
  { name: "Ga Đà Lạt", province: "Lâm Đồng", category: "Kiến trúc", latitude: "11.9416", longitude: "108.4549", ticketPrice: 5000, description: "Nhà ga xe lửa cổ đẹp nhất Đông Dương." },
  { name: "Hồ Tuyền Lâm", province: "Lâm Đồng", category: "Thiên nhiên", latitude: "11.8906", longitude: "108.4347", ticketPrice: 0, description: "Hồ nước ngọt lớn nhất Đà Lạt với cảnh quan thơ mộng." },
  { name: "Thiền viện Trúc Lâm", province: "Lâm Đồng", category: "Tâm linh", latitude: "11.9034", longitude: "108.4350", ticketPrice: 0, description: "Ngôi thiền viện lớn nhất tỉnh Lâm Đồng." },
  { name: "Đồi chè Cầu Đất", province: "Lâm Đồng", category: "Thiên nhiên", latitude: "11.8558", longitude: "108.5736", ticketPrice: 0, description: "Không gian xanh ngắt của những đồi chè và điện gió." },
  { name: "Núi Langbiang", province: "Lâm Đồng", category: "Thiên nhiên", latitude: "12.0458", longitude: "108.4336", ticketPrice: 50000, description: "Nóc nhà của Đà Lạt với tầm nhìn hùng vĩ." },
  { name: "Chùa Linh Phước", province: "Lâm Đồng", category: "Tâm linh", latitude: "11.9442", longitude: "108.4981", ticketPrice: 0, description: "Chùa Ve Chai độc đáo với các công trình khảm sành sứ." },
  { name: "Thác Datanla", province: "Lâm Đồng", category: "Thiên nhiên", latitude: "11.9016", longitude: "108.4485", ticketPrice: 50000, description: "Nổi tiếng với trò chơi máng trượt xuyên rừng." },
  { name: "Đường hầm Đất Sét", province: "Lâm Đồng", category: "Kiến trúc", latitude: "11.8958", longitude: "108.4036", ticketPrice: 90000, description: "Công trình điêu khắc tái hiện lịch sử Đà Lạt bằng đất sét." },
  { name: "Tiệm cà phê Túi Mơ To", province: "Lâm Đồng", category: "Cafe", latitude: "11.9412", longitude: "108.4836", ticketPrice: 60000, description: "Quán cafe với vườn cúc họa mi và view thung lũng cực chill." },
  { name: "Mê Linh Coffee Garden", province: "Lâm Đồng", category: "Cafe", latitude: "11.9158", longitude: "108.3136", ticketPrice: 0, description: "Thưởng thức cafe chồn với view đồi núi 360 độ." },
  { name: "Puppy Farm", province: "Lâm Đồng", category: "Giải trí", latitude: "11.9658", longitude: "108.3936", ticketPrice: 100000, description: "Trang trại cún và vườn hoa, nông sản công nghệ cao." },
  { name: "Dinh Bảo Đại (Dinh III)", province: "Lâm Đồng", category: "Lịch sử", latitude: "11.9284", longitude: "108.4336", ticketPrice: 30000, description: "Nơi làm việc và sinh sống của vị vua cuối cùng triều Nguyễn." }
];

async function seed() {
  console.log("Starting seed Part 2 (Remaining provinces)...");
  
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

  console.log("Part 2 seed finished!");
  process.exit(0);
}

seed();
