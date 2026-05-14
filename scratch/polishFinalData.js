import prisma from "../src/config/prismaClient.js";

async function polish() {
  console.log("Polishing Database (Descriptions, City, Country)...");

  const destinations = await prisma.destination.findMany();

  const descriptionsMap = {
    "Dinh Độc Lập": "Di tích lịch sử đặc biệt cấp quốc gia, nơi ghi dấu ngày thống nhất đất nước.",
    "Nhà thờ Đức Bà": "Kiến trúc Công giáo đặc sắc với gạch đỏ hồng từ Marseille, biểu tượng của Sài Gòn.",
    "Bưu điện Trung tâm Sài Gòn": "Công trình kiến trúc Phục hưng đẹp nhất thành phố, điểm check-in không thể bỏ qua.",
    "Chợ Bến Thành": "Ngôi chợ biểu tượng lâu đời nhất Sài Gòn với tháp đồng hồ đặc trưng.",
    "Landmark 81": "Tòa nhà cao nhất Việt Nam với đài quan sát 360 độ ngắm toàn cảnh thành phố.",
    "Địa đạo Củ Chi": "Hệ thống phòng thủ trong lòng đất kỳ vĩ, nhân chứng lịch sử hào hùng.",
    "Đại Nội Huế": "Quần thể kiến trúc cung đình phong kiến cuối cùng tại Việt Nam, di sản UNESCO.",
    "Chùa Thiên Mụ": "Ngôi chùa cổ kính nhất xứ Huế với tháp Phước Duyên cao 7 tầng soi bóng sông Hương.",
    "Lăng Khải Định": "Đỉnh cao của kiến trúc lăng tẩm với sự giao thoa văn hóa Đông - Tây độc đáo.",
    "Cầu Trường Tiền": "Cây cầu lịch sử bắc qua sông Hương, linh hồn của cố đô Huế.",
    "Chùa Cầu": "Biểu tượng của phố cổ Hội An, minh chứng cho sự giao thoa văn hóa Việt - Nhật.",
    "Rừng dừa Bảy Mẫu": "Khu sinh thái ngập mặn với trải nghiệm đi thuyền thúng thú vị.",
    "Bà Nà Hills": "Khu du lịch trên đỉnh núi Chúa với khí hậu 4 mùa trong ngày và Cầu Vàng nổi tiếng.",
    "Hồ Xuân Hương": "Trái tim của Đà Lạt, nơi dạo bộ lãng mạn quanh mặt hồ phẳng lặng.",
    "Quảng trường Lâm Viên": "Điểm nhấn kiến trúc với bông hoa dã quỳ và nụ hoa Atiso khổng lồ bằng kính.",
    "Vườn quốc gia Bạch Mã": "Thiên đường đa dạng sinh học với khí hậu mát mẻ và nhiều thác nước hùng vĩ.",
    "Làng hương Thủy Xuân": "Con phố rực rỡ sắc màu của những bó hương đa sắc, điểm check-in đậm chất Huế.",
    "Chợ Đông Ba": "Trung tâm thương mại truyền thống lớn nhất Huế, nơi hội tụ tinh hoa ẩm thực cố đô."
    // ... và hàng trăm mô tả khác sẽ được sinh tự động theo logic dưới đây
  };

  let count = 0;
  for (const dest of destinations) {
    let updateData = {
        country: "Việt Nam",
        city: dest.city || dest.province // Nếu city null thì lấy province
    };

    // Nếu description còn là câu mẫu cũ hoặc null
    if (!dest.description || dest.description.includes("Một điểm tham quan thú vị")) {
        // Lấy mô tả từ map hoặc sinh thông minh
        let newDesc = descriptionsMap[dest.name];
        if (!newDesc) {
            if (dest.name.toLowerCase().includes("chùa")) newDesc = `Ngôi chùa linh thiêng và thanh tịnh tại ${dest.province}, mang đậm kiến trúc Phật giáo.`;
            else if (dest.name.toLowerCase().includes("làng")) newDesc = `Làng nghề truyền thống lưu giữ những giá trị văn hóa đặc sắc của người dân ${dest.province}.`;
            else if (dest.name.toLowerCase().includes("cafe")) newDesc = `Không gian cafe thư giãn với phong cách thiết kế độc đáo, điểm dừng chân lý tưởng.`;
            else if (dest.name.toLowerCase().includes("chợ")) newDesc = `Nơi mua sắm sầm uất và trải nghiệm văn hóa ẩm thực địa phương đặc sắc.`;
            else if (dest.name.toLowerCase().includes("biển")) newDesc = `Bãi biển tuyệt đẹp với cát trắng, nắng vàng và không khí trong lành.`;
            else newDesc = `Địa danh nổi tiếng tại ${dest.province} với cảnh quan đẹp và giá trị văn hóa độc đáo.`;
        }
        updateData.description = newDesc;
    }

    await prisma.destination.update({
      where: { id: dest.id },
      data: updateData
    });
    count++;
  }

  console.log(`Successfully polished ${count} destinations.`);
  process.exit(0);
}

polish();
