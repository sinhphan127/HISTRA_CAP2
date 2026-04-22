/**
 * seed_destinations.js
 * Xóa toàn bộ địa điểm cũ (bao gồm duplicate) và seed lại dữ liệu thật
 * Bao gồm các thành phố du lịch chính của Việt Nam
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const destinations = [
  // ═══════════════════════════════════════════════
  // ĐÀ NẴNG
  // ═══════════════════════════════════════════════
  {
    name: 'Bà Nà Hills',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Khu du lịch trên đỉnh núi với Cầu Vàng nổi tiếng, khí hậu mát mẻ quanh năm, cáp treo kỷ lục thế giới.',
    ticketPrice: 750000, category: 'tourist attraction', rating: 4.8, reviewsCount: 85000,
    duration: 'Cả ngày', openingHours: '07:00 - 22:00',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7ce77d0e74bf',
  },
  {
    name: 'Cầu Rồng',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Cây cầu hình rồng phun lửa và nước biểu tượng của Đà Nẵng, trải dài trên sông Hàn.',
    ticketPrice: 0, category: 'landmark', rating: 4.7, reviewsCount: 62000,
    duration: '1-2 giờ', openingHours: '24/7 (phun lửa 21:00 T7 & CN)',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
  },
  {
    name: 'Bãi biển Mỹ Khê',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Một trong những bãi biển đẹp nhất hành tinh theo Forbes, cát trắng mịn, sóng vừa phải.',
    ticketPrice: 0, category: 'beach', rating: 4.7, reviewsCount: 71000,
    duration: '2-4 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  },
  {
    name: 'Ngũ Hành Sơn',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Quần thể 5 ngọn núi đá vôi huyền bí với hang động, chùa chiền và làng nghề điêu khắc đá.',
    ticketPrice: 40000, category: 'nature', rating: 4.6, reviewsCount: 45000,
    duration: '2-3 giờ', openingHours: '07:00 - 17:30',
    imageUrl: 'https://images.unsplash.com/photo-1596402133488-82601362243d',
  },
  {
    name: 'Bán đảo Sơn Trà',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Khu bảo tồn thiên nhiên với rừng nguyên sinh, bãi biển hoang sơ và cộng đồng voọc Chà vá chân nâu.',
    ticketPrice: 0, category: 'nature', rating: 4.8, reviewsCount: 38000,
    duration: 'Nửa ngày', openingHours: '06:00 - 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1533420061326-ea9f9f9b5762',
  },
  {
    name: 'Chùa Linh Ứng Sơn Trà',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Chùa tọa lạc trên bán đảo Sơn Trà với tượng Phật bà cao 67m nhìn ra biển Đông.',
    ticketPrice: 0, category: 'temple', rating: 4.8, reviewsCount: 52000,
    duration: '1-2 giờ', openingHours: '06:00 - 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1599708138407-2a138378564f',
  },
  {
    name: 'Chợ Hàn',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Chợ truyền thống nổi tiếng với đặc sản địa phương, hải sản tươi, đồ lưu niệm.',
    ticketPrice: 0, category: 'market', rating: 4.3, reviewsCount: 28000,
    duration: '1-2 giờ', openingHours: '06:00 - 19:00',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  },
  {
    name: 'Bảo tàng Chăm',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Bảo tàng lưu giữ bộ sưu tập các tác phẩm điêu khắc Chăm Pa lớn nhất thế giới.',
    ticketPrice: 60000, category: 'museum', rating: 4.5, reviewsCount: 22000,
    duration: '1-2 giờ', openingHours: '07:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1580541178496-ecf0573e04e9',
  },
  {
    name: 'Cầu Tình Yêu sông Hàn',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Cây cầu quay thủ công duy nhất tại Việt Nam, điểm đi dạo lãng mạn bên sông Hàn.',
    ticketPrice: 0, category: 'landmark', rating: 4.4, reviewsCount: 19000,
    duration: '1 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
  },
  {
    name: 'Làng đá mỹ nghệ Non Nước',
    province: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam',
    description: 'Làng nghề truyền thống chuyên điêu khắc đá cẩm thạch nổi tiếng hàng trăm năm.',
    ticketPrice: 0, category: 'heritage', rating: 4.3, reviewsCount: 14000,
    duration: '1-2 giờ', openingHours: '08:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1596402133488-82601362243d',
  },

  // ═══════════════════════════════════════════════
  // HỘI AN
  // ═══════════════════════════════════════════════
  {
    name: 'Phố cổ Hội An',
    province: 'Quảng Nam', city: 'Hội An', country: 'Việt Nam',
    description: 'Di sản văn hóa thế giới UNESCO với kiến trúc cổ hàng trăm năm, đèn lồng rực rỡ và văn hóa ẩm thực phong phú.',
    ticketPrice: 80000, category: 'heritage', rating: 4.9, reviewsCount: 120000,
    duration: 'Cả ngày', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  },
  {
    name: 'Chùa Cầu Hội An',
    province: 'Quảng Nam', city: 'Hội An', country: 'Việt Nam',
    description: 'Biểu tượng của Hội An, cây cầu gỗ cổ có mái che dạng ngôi chùa nhỏ được xây năm 1593.',
    ticketPrice: 0, category: 'heritage', rating: 4.8, reviewsCount: 65000,
    duration: '30 phút', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1544015759-247b4f7e7b9c',
  },
  {
    name: 'Làng rau Trà Quế',
    province: 'Quảng Nam', city: 'Hội An', country: 'Việt Nam',
    description: 'Làng rau hữu cơ 400 năm tuổi, trải nghiệm làm nông nghiệp truyền thống và nấu ăn.',
    ticketPrice: 0, category: 'nature', rating: 4.6, reviewsCount: 18000,
    duration: '2-3 giờ', openingHours: '06:00 - 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592',
  },
  {
    name: 'Bãi biển An Bàng',
    province: 'Quảng Nam', city: 'Hội An', country: 'Việt Nam',
    description: 'Bãi biển yên tĩnh cách phố cổ 3km, ít đông đúc hơn Cửa Đại, phù hợp nghỉ dưỡng.',
    ticketPrice: 0, category: 'beach', rating: 4.6, reviewsCount: 24000,
    duration: '2-4 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  },
  {
    name: 'Rừng dừa Bảy Mẫu',
    province: 'Quảng Nam', city: 'Hội An', country: 'Việt Nam',
    description: 'Trải nghiệm chèo thuyền thúng độc đáo qua rừng dừa nước với nghệ nhân địa phương.',
    ticketPrice: 150000, category: 'nature', rating: 4.7, reviewsCount: 32000,
    duration: '2 giờ', openingHours: '07:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1533420061326-ea9f9f9b5762',
  },

  // ═══════════════════════════════════════════════
  // HUẾ
  // ═══════════════════════════════════════════════
  {
    name: 'Đại Nội Huế',
    province: 'Thừa Thiên Huế', city: 'Huế', country: 'Việt Nam',
    description: 'Kinh thành triều Nguyễn - Di sản văn hóa thế giới UNESCO, bao gồm Hoàng thành, Tử Cấm Thành.',
    ticketPrice: 200000, category: 'heritage', rating: 4.8, reviewsCount: 78000,
    duration: '3-4 giờ', openingHours: '07:00 - 17:30',
    imageUrl: 'https://images.unsplash.com/photo-1599708138407-2a138378564f',
  },
  {
    name: 'Lăng Tự Đức',
    province: 'Thừa Thiên Huế', city: 'Huế', country: 'Việt Nam',
    description: 'Lăng mộ vua Tự Đức với kiến trúc hài hòa tuyệt đẹp trong khu vườn hồ thơ mộng.',
    ticketPrice: 150000, category: 'heritage', rating: 4.7, reviewsCount: 35000,
    duration: '2 giờ', openingHours: '07:00 - 17:30',
    imageUrl: 'https://images.unsplash.com/photo-1599708138407-2a138378564f',
  },
  {
    name: 'Chùa Thiên Mụ',
    province: 'Thừa Thiên Huế', city: 'Huế', country: 'Việt Nam',
    description: 'Ngôi chùa cổ nhất Huế bên dòng sông Hương, tháp Phước Duyên 7 tầng là biểu tượng xứ Huế.',
    ticketPrice: 0, category: 'temple', rating: 4.8, reviewsCount: 48000,
    duration: '1-2 giờ', openingHours: '08:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1580541178496-ecf0573e04e9',
  },
  {
    name: 'Sông Hương',
    province: 'Thừa Thiên Huế', city: 'Huế', country: 'Việt Nam',
    description: 'Dòng sông thơ mộng chạy qua lòng thành phố Huế, trải nghiệm đi thuyền nghe ca Huế.',
    ticketPrice: 100000, category: 'nature', rating: 4.7, reviewsCount: 29000,
    duration: '2 giờ', openingHours: '06:00 - 22:00',
    imageUrl: 'https://images.unsplash.com/photo-1533420061326-ea9f9f9b5762',
  },
  {
    name: 'Chợ Đông Ba',
    province: 'Thừa Thiên Huế', city: 'Huế', country: 'Việt Nam',
    description: 'Chợ lớn nhất Huế với các đặc sản như mè xửng, nón lá, bánh khoái và đồ thủ công.',
    ticketPrice: 0, category: 'market', rating: 4.3, reviewsCount: 21000,
    duration: '1-2 giờ', openingHours: '06:00 - 19:00',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  },

  // ═══════════════════════════════════════════════
  // ĐÀ LẠT
  // ═══════════════════════════════════════════════
  {
    name: 'Thung lũng Tình Yêu',
    province: 'Lâm Đồng', city: 'Đà Lạt', country: 'Việt Nam',
    description: 'Thung lũng hoa và rừng thông lãng mạn, hồ nước xanh ngắt giữa khung cảnh núi đồi mờ sương.',
    ticketPrice: 250000, category: 'park', rating: 4.6, reviewsCount: 42000,
    duration: '2-3 giờ', openingHours: '07:00 - 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
  },
  {
    name: 'Vườn hoa thành phố Đà Lạt',
    province: 'Lâm Đồng', city: 'Đà Lạt', country: 'Việt Nam',
    description: 'Khu vườn hoa đa sắc màu với hàng trăm loài hoa đặc trưng xứ lạnh giữa lòng thành phố.',
    ticketPrice: 50000, category: 'park', rating: 4.5, reviewsCount: 31000,
    duration: '1-2 giờ', openingHours: '07:30 - 17:30',
    imageUrl: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
  },
  {
    name: 'Hồ Xuân Hương',
    province: 'Lâm Đồng', city: 'Đà Lạt', country: 'Việt Nam',
    description: 'Hồ nước trung tâm thành phố, đạp vịt ngắm cảnh, đi dạo quanh hồ giữa rừng thông.',
    ticketPrice: 0, category: 'nature', rating: 4.6, reviewsCount: 38000,
    duration: '1-2 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1533420061326-ea9f9f9b5762',
  },
  {
    name: 'Làng Cù Lần',
    province: 'Lâm Đồng', city: 'Đà Lạt', country: 'Việt Nam',
    description: 'Làng du lịch sinh thái với nhà sàn dân tộc, cưỡi ngựa, chèo kayak giữa rừng thông.',
    ticketPrice: 100000, category: 'nature', rating: 4.7, reviewsCount: 22000,
    duration: 'Nửa ngày', openingHours: '07:30 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3',
  },
  {
    name: 'Thác Datanla',
    province: 'Lâm Đồng', city: 'Đà Lạt', country: 'Việt Nam',
    description: 'Thác nước đẹp với trải nghiệm trượt máng độc đáo xuyên rừng thông.',
    ticketPrice: 100000, category: 'nature', rating: 4.5, reviewsCount: 27000,
    duration: '2 giờ', openingHours: '07:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1596402133488-82601362243d',
  },

  // ═══════════════════════════════════════════════
  // NHA TRANG
  // ═══════════════════════════════════════════════
  {
    name: 'Vịnh Nha Trang',
    province: 'Khánh Hòa', city: 'Nha Trang', country: 'Việt Nam',
    description: 'Một trong những vịnh biển đẹp nhất thế giới với làn nước trong xanh và nhiều đảo nhỏ.',
    ticketPrice: 0, category: 'beach', rating: 4.8, reviewsCount: 67000,
    duration: 'Cả ngày', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  },
  {
    name: 'VinWonders Nha Trang',
    province: 'Khánh Hòa', city: 'Nha Trang', country: 'Việt Nam',
    description: 'Công viên giải trí đẳng cấp quốc tế trên đảo Hòn Tre với cáp treo băng biển.',
    ticketPrice: 900000, category: 'amusement park', rating: 4.7, reviewsCount: 43000,
    duration: 'Cả ngày', openingHours: '08:30 - 21:00',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
  },
  {
    name: 'Tháp Bà Ponagar',
    province: 'Khánh Hòa', city: 'Nha Trang', country: 'Việt Nam',
    description: 'Quần thể đền tháp Chăm Pa từ thế kỷ VIII, thờ nữ thần Ponagar.',
    ticketPrice: 25000, category: 'heritage', rating: 4.5, reviewsCount: 28000,
    duration: '1-2 giờ', openingHours: '07:30 - 17:30',
    imageUrl: 'https://images.unsplash.com/photo-1599708138407-2a138378564f',
  },
  {
    name: 'Đảo Hòn Mun',
    province: 'Khánh Hòa', city: 'Nha Trang', country: 'Việt Nam',
    description: 'Khu bảo tồn biển với rạn san hô đa dạng, snorkeling và lặn biển ngắm cá nhiệt đới.',
    ticketPrice: 200000, category: 'nature', rating: 4.7, reviewsCount: 35000,
    duration: 'Nửa ngày', openingHours: '07:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3',
  },

  // ═══════════════════════════════════════════════
  // PHÚ QUỐC
  // ═══════════════════════════════════════════════
  {
    name: 'VinWonders Phú Quốc',
    province: 'Kiên Giang', city: 'Phú Quốc', country: 'Việt Nam',
    description: 'Khu vui chơi giải trí đẳng cấp nhất đảo Ngọc với Safari, World của Nước và nhiều trò chơi.',
    ticketPrice: 950000, category: 'amusement park', rating: 4.7, reviewsCount: 55000,
    duration: 'Cả ngày', openingHours: '09:00 - 21:00',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
  },
  {
    name: 'Bãi Sao Phú Quốc',
    province: 'Kiên Giang', city: 'Phú Quốc', country: 'Việt Nam',
    description: 'Bãi biển thiên đường với cát trắng mịn như bột, nước biển trong vắt màu ngọc bích.',
    ticketPrice: 0, category: 'beach', rating: 4.9, reviewsCount: 48000,
    duration: '2-4 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  },
  {
    name: 'Grand World Phú Quốc',
    province: 'Kiên Giang', city: 'Phú Quốc', country: 'Việt Nam',
    description: 'Khu phức hợp giải trí về đêm với phố đi bộ, nhà hàng, show diễn và trò chơi sáng tạo.',
    ticketPrice: 0, category: 'tourist attraction', rating: 4.6, reviewsCount: 38000,
    duration: '3-4 giờ', openingHours: '15:00 - 23:00',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  },
  {
    name: 'Vườn Quốc gia Phú Quốc',
    province: 'Kiên Giang', city: 'Phú Quốc', country: 'Việt Nam',
    description: 'Khu rừng nguyên sinh bảo tồn đa dạng sinh học độc đáo với nhiều loài động thực vật quý hiếm.',
    ticketPrice: 20000, category: 'nature', rating: 4.5, reviewsCount: 22000,
    duration: 'Nửa ngày', openingHours: '07:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1533420061326-ea9f9f9b5762',
  },

  // ═══════════════════════════════════════════════
  // HÀ NỘI
  // ═══════════════════════════════════════════════
  {
    name: 'Hồ Hoàn Kiếm',
    province: 'Hà Nội', city: 'Hà Nội', country: 'Việt Nam',
    description: 'Hồ lịch sử trung tâm Hà Nội với Tháp Rùa và Đền Ngọc Sơn, biểu tượng thủ đô.',
    ticketPrice: 0, category: 'landmark', rating: 4.7, reviewsCount: 92000,
    duration: '1-2 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
  },
  {
    name: 'Văn Miếu - Quốc Tử Giám',
    province: 'Hà Nội', city: 'Hà Nội', country: 'Việt Nam',
    description: 'Trường đại học đầu tiên của Việt Nam (1076), nơi lưu giữ bia đá Tiến sĩ qua các triều đại.',
    ticketPrice: 70000, category: 'heritage', rating: 4.7, reviewsCount: 58000,
    duration: '1-2 giờ', openingHours: '08:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1599708138407-2a138378564f',
  },
  {
    name: 'Lăng Chủ Tịch Hồ Chí Minh',
    province: 'Hà Nội', city: 'Hà Nội', country: 'Việt Nam',
    description: 'Công trình kiến trúc uy nghiêm lưu giữ thi hài Bác Hồ, khu di tích Ba Đình lịch sử.',
    ticketPrice: 0, category: 'landmark', rating: 4.8, reviewsCount: 73000,
    duration: '1-2 giờ', openingHours: '07:30 - 10:30 (T3-T5 & T7-CN)',
    imageUrl: 'https://images.unsplash.com/photo-1580541178496-ecf0573e04e9',
  },
  {
    name: 'Phố cổ Hà Nội',
    province: 'Hà Nội', city: 'Hà Nội', country: 'Việt Nam',
    description: '36 phố phường cổ kính với các ngành nghề truyền thống, ẩm thực đường phố và kiến trúc Pháp.',
    ticketPrice: 0, category: 'heritage', rating: 4.6, reviewsCount: 81000,
    duration: '2-4 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  },
  {
    name: 'Bảo tàng Dân tộc học Việt Nam',
    province: 'Hà Nội', city: 'Hà Nội', country: 'Việt Nam',
    description: 'Bảo tàng trưng bày đời sống và văn hóa 54 dân tộc anh em Việt Nam.',
    ticketPrice: 40000, category: 'museum', rating: 4.7, reviewsCount: 31000,
    duration: '2-3 giờ', openingHours: '08:30 - 17:30 (đóng T2)',
    imageUrl: 'https://images.unsplash.com/photo-1580541178496-ecf0573e04e9',
  },

  // ═══════════════════════════════════════════════
  // HẠ LONG
  // ═══════════════════════════════════════════════
  {
    name: 'Vịnh Hạ Long',
    province: 'Quảng Ninh', city: 'Hạ Long', country: 'Việt Nam',
    description: 'Di sản thiên nhiên thế giới UNESCO với hàng nghìn đảo đá vôi kỳ thú trên biển xanh.',
    ticketPrice: 300000, category: 'nature', rating: 4.9, reviewsCount: 145000,
    duration: '1-2 ngày', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1596402133488-82601362243d',
  },
  {
    name: 'Hang Sửng Sốt',
    province: 'Quảng Ninh', city: 'Hạ Long', country: 'Việt Nam',
    description: 'Hang động lớn nhất và đẹp nhất vịnh Hạ Long với nhũ đá kỳ ảo.',
    ticketPrice: 200000, category: 'nature', rating: 4.8, reviewsCount: 62000,
    duration: '1-2 giờ', openingHours: '08:00 - 16:30',
    imageUrl: 'https://images.unsplash.com/photo-1596402133488-82601362243d',
  },

  // ═══════════════════════════════════════════════
  // SẠ PA
  // ═══════════════════════════════════════════════
  {
    name: 'Fansipan Legend',
    province: 'Lào Cai', city: 'Sa Pa', country: 'Việt Nam',
    description: 'Nóc nhà Đông Dương với cáp treo 3 dây cabins lớn nhất thế giới lên đỉnh 3143m.',
    ticketPrice: 850000, category: 'tourist attraction', rating: 4.8, reviewsCount: 78000,
    duration: 'Cả ngày', openingHours: '07:30 - 17:30',
    imageUrl: 'https://images.unsplash.com/photo-1580541178496-ecf0573e04e9',
  },
  {
    name: 'Ruộng bậc thang Mù Cang Chải',
    province: 'Yên Bái', city: 'Mù Cang Chải', country: 'Việt Nam',
    description: 'Những thửa ruộng bậc thang hoàng kim tuyệt đẹp của đồng bào H\'Mông vào mùa lúa chín.',
    ticketPrice: 0, category: 'nature', rating: 4.9, reviewsCount: 35000,
    duration: 'Cả ngày', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1555944804-84585057a8ac',
  },
  {
    name: 'Bản Cát Cát',
    province: 'Lào Cai', city: 'Sa Pa', country: 'Việt Nam',
    description: 'Bản làng người H\'Mông cổ xưa với thác nước, cầu treo và dệt thổ cẩm truyền thống.',
    ticketPrice: 70000, category: 'heritage', rating: 4.6, reviewsCount: 29000,
    duration: '2-3 giờ', openingHours: '07:00 - 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1533420061326-ea9f9f9b5762',
  },

  // ═══════════════════════════════════════════════
  // NINH BÌNH
  // ═══════════════════════════════════════════════
  {
    name: 'Tràng An',
    province: 'Ninh Bình', city: 'Ninh Bình', country: 'Việt Nam',
    description: 'Di sản thế giới kép UNESCO - đi thuyền qua hang động và núi đá vôi huyền ảo.',
    ticketPrice: 250000, category: 'nature', rating: 4.9, reviewsCount: 58000,
    duration: '3-4 giờ', openingHours: '07:00 - 16:00',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7ce77d0e74bf',
  },
  {
    name: 'Chùa Bái Đính',
    province: 'Ninh Bình', city: 'Ninh Bình', country: 'Việt Nam',
    description: 'Quần thể chùa lớn nhất Việt Nam với kỷ lục tượng Phật đồng lớn nhất Đông Nam Á.',
    ticketPrice: 0, category: 'temple', rating: 4.7, reviewsCount: 43000,
    duration: '2-3 giờ', openingHours: '07:00 - 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1599708138407-2a138378564f',
  },
  {
    name: 'Tam Cốc - Bích Động',
    province: 'Ninh Bình', city: 'Ninh Bình', country: 'Việt Nam',
    description: 'Hành trình thuyền qua 3 hang động tối đen với cánh đồng lúa vàng mùa gặt.',
    ticketPrice: 200000, category: 'nature', rating: 4.8, reviewsCount: 51000,
    duration: '2-3 giờ', openingHours: '07:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1533420061326-ea9f9f9b5762',
  },

  // ═══════════════════════════════════════════════
  // HÀ GIANG
  // ═══════════════════════════════════════════════
  {
    name: 'Đèo Mã Pí Lèng',
    province: 'Hà Giang', city: 'Mèo Vạc', country: 'Việt Nam',
    description: 'Đèo hùng vĩ bậc nhất Việt Nam nhìn xuống hẻm Tu Sản và dòng sông Nho Quế xanh biếc.',
    ticketPrice: 0, category: 'nature', rating: 5.0, reviewsCount: 42000,
    duration: '1-2 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1533420061326-ea9f9f9b5762',
  },
  {
    name: 'Cổng trời Quản Bạ',
    province: 'Hà Giang', city: 'Quản Bạ', country: 'Việt Nam',
    description: 'Điểm ngắm cảnh tuyệt vời nhìn ra thung lũng và hai quả núi đôi huyền thoại.',
    ticketPrice: 0, category: 'nature', rating: 4.8, reviewsCount: 28000,
    duration: '1 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1555944804-84585057a8ac',
  },

  // ═══════════════════════════════════════════════
  // QUẢNG BÌNH
  // ═══════════════════════════════════════════════
  {
    name: 'Động Phong Nha',
    province: 'Quảng Bình', city: 'Bố Trạch', country: 'Việt Nam',
    description: 'Hang động với sông ngầm dài nhất thế giới, thạch nhũ muôn màu huyền ảo.',
    ticketPrice: 150000, category: 'nature', rating: 4.8, reviewsCount: 49000,
    duration: '2-3 giờ', openingHours: '07:30 - 16:30',
    imageUrl: 'https://images.unsplash.com/photo-1596402133488-82601362243d',
  },
  {
    name: 'Hang Sơn Đoòng',
    province: 'Quảng Bình', city: 'Bố Trạch', country: 'Việt Nam',
    description: 'Hang động lớn nhất thế giới với rừng cây và sông ngầm bên trong, tour khám phá đặc biệt.',
    ticketPrice: 3000000, category: 'nature', rating: 5.0, reviewsCount: 8000,
    duration: '4 ngày 3 đêm', openingHours: 'Theo lịch tour đặc biệt',
    imageUrl: 'https://images.unsplash.com/photo-1596402133488-82601362243d',
  },

  // ═══════════════════════════════════════════════
  // HỒ CHÍ MINH
  // ═══════════════════════════════════════════════
  {
    name: 'Địa đạo Củ Chi',
    province: 'TP. Hồ Chí Minh', city: 'Hồ Chí Minh', country: 'Việt Nam',
    description: 'Hệ thống đường hầm 250km huyền thoại trong chiến tranh, trải nghiệm bò vào địa đạo thật.',
    ticketPrice: 110000, category: 'heritage', rating: 4.7, reviewsCount: 63000,
    duration: '3-4 giờ', openingHours: '07:00 - 17:00',
    imageUrl: 'https://images.unsplash.com/photo-1580541178496-ecf0573e04e9',
  },
  {
    name: 'Bảo tàng Chứng tích Chiến tranh',
    province: 'TP. Hồ Chí Minh', city: 'Hồ Chí Minh', country: 'Việt Nam',
    description: 'Bảo tàng lưu giữ hiện vật chiến tranh Việt Nam, một trong những bảo tàng thu hút khách quốc tế nhất.',
    ticketPrice: 40000, category: 'museum', rating: 4.8, reviewsCount: 87000,
    duration: '2-3 giờ', openingHours: '07:30 - 18:00',
    imageUrl: 'https://images.unsplash.com/photo-1580541178496-ecf0573e04e9',
  },
  {
    name: 'Phố đi bộ Nguyễn Huệ',
    province: 'TP. Hồ Chí Minh', city: 'Hồ Chí Minh', country: 'Việt Nam',
    description: 'Con phố trung tâm sầm uất với UBND Thành phố, nhà hàng, cà phê và các sự kiện văn hóa.',
    ticketPrice: 0, category: 'landmark', rating: 4.5, reviewsCount: 72000,
    duration: '1-2 giờ', openingHours: '24/7',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  },
  {
    name: 'Chợ Bến Thành',
    province: 'TP. Hồ Chí Minh', city: 'Hồ Chí Minh', country: 'Việt Nam',
    description: 'Biểu tượng lịch sử Sài Gòn với đa dạng hàng hóa, đặc sản và ẩm thực đường phố.',
    ticketPrice: 0, category: 'market', rating: 4.3, reviewsCount: 65000,
    duration: '1-2 giờ', openingHours: '06:00 - 19:00',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  },
];

async function main() {
  console.log('🚀 Bắt đầu seed destinations...');

  // 1. Xóa các record phụ thuộc trước
  console.log('🗑️  Xóa dữ liệu cũ...');
  await prisma.tripActivityTag.deleteMany({});
  await prisma.tripLocation.deleteMany({});
  await prisma.postLocation.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.destinationNearby.deleteMany({});
  await prisma.destination.deleteMany({});
  console.log('✅ Đã xóa toàn bộ destinations & dữ liệu liên quan\n');

  // 2. Thêm destinations mới
  let count = 0;
  for (const d of destinations) {
    await prisma.destination.create({ data: d });
    count++;
    process.stdout.write(`\r📍 Đã thêm ${count}/${destinations.length} địa điểm...`);
  }

  console.log(`\n\n✅ Hoàn thành! Đã thêm ${count} địa điểm thật vào database.`);

  // 3. Tóm tắt theo thành phố
  const byCities = destinations.reduce((acc, d) => {
    acc[d.city] = (acc[d.city] || 0) + 1;
    return acc;
  }, {});
  console.log('\n📊 Phân bổ theo thành phố:');
  Object.entries(byCities).sort((a,b) => b[1]-a[1]).forEach(([city, n]) => {
    console.log(`   ${city}: ${n} địa điểm`);
  });
}

main()
  .catch(e => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
