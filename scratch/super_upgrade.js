import prisma from "../src/config/prismaClient.js";
import axios from "axios";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const bigData = {
    "Cà Mau": ["Mũi Cà Mau", "Hòn Đá Bạc", "Đầm Thị Tường", "Rừng quốc gia U Minh Hạ", "Đảo Hòn Khoai", "Khu tưởng niệm Chủ tịch Hồ Chí Minh"],
    "Sóc Trăng": ["Chùa Dơi", "Chùa Chén Kiểu", "Chùa Som Rong", "Bảo tàng Khmer", "Hồ Bể", "Căn cứ Tỉnh ủy Sóc Trăng"],
    "Bạc Liêu": ["Cánh đồng điện gió Bạc Liêu", "Nhà Công tử Bạc Liêu", "Phật Bà Nam Hải", "Khu lưu niệm Cao Văn Lầu", "Vườn chim Bạc Liêu"],
    "Cần Thơ": ["Bến Ninh Kiều", "Chợ nổi Cái Răng", "Nhà cổ Bình Thủy", "Thiền viện Trúc Lâm Phương Nam", "Vườn cò Bằng Lăng"],
    "Đà Nẵng": ["Bà Nà Hills", "Bán đảo Sơn Trà", "Ngũ Hành Sơn", "Cầu Rồng", "Bãi biển Mỹ Khê", "Bảo tàng Chăm", "Chùa Linh Ứng", "Suối Khoáng Nóng Núi Thần Tài"],
    "Quảng Nam": ["Phố cổ Hội An", "Thánh địa Mỹ Sơn", "Rừng dừa Bảy Mẫu", "Cù Lao Chàm", "Biển An Bàng", "Làng rau Trà Quế", "Tượng đài Mẹ Thứ"],
    "Thừa Thiên Huế": ["Đại Nội Huế", "Chùa Thiên Mụ", "Lăng Khải Định", "Lăng Tự Đức", "Chợ Đông Ba", "Cầu Trường Tiền", "Phá Tam Giang", "Đồi Thiên An"],
    "Hà Nội": ["Hồ Hoàn Kiếm", "Văn Miếu Quốc Tử Giám", "Lăng Bác", "Chùa Một Cột", "Hồ Tây", "Hoàng thành Thăng Long", "Chùa Trấn Quốc", "Nhà hát Lớn"],
    "Hồ Chí Minh": ["Dinh Độc Lập", "Nhà thờ Đức Bà", "Bưu điện Trung tâm Sài Gòn", "Chợ Bến Thành", "Địa đạo Củ Chi", "Phố đi bộ Nguyễn Huệ", "Bitexco Financial Tower", "Bảo tàng Chứng tích Chiến tranh"],
    "Lâm Đồng": ["Thác Datanla", "Hồ Tuyền Lâm", "Núi Langbiang", "Thung lũng Tình Yêu", "Ga Đà Lạt", "Dinh Bảo Đại", "Vườn hoa Thành phố", "Thác Prenn"],
    "Kiên Giang": ["Đảo Ngọc Phú Quốc", "Hòn Phụ Tử", "Rạch Giá", "Nam Du", "Hòn Thơm", "Hà Tiên"],
    "An Giang": ["Rừng tràm Trà Sư", "Miếu Bà Chúa Xứ", "Núi Cấm", "Chợ Châu Đốc", "Cổng trời Tri Tôn", "Hồ Tà Pạ"],
    "Hà Giang": ["Cột cờ Lũng Cú", "Đèo Mã Pí Lèng", "Dinh thự họ Vương", "Phố cổ Đồng Văn", "Ruộng bậc thang Hoàng Su Phì", "Cổng trời Quản Bạ"],
    "Lào Cai": ["Fansipan Sapa", "Bản Cát Cát", "Nhà thờ Đá Sapa", "Đèo Ô Quy Hồ", "Thung lũng Mường Hoa", "Chợ Bắc Hà"],
    "Ninh Bình": ["Tràng An", "Bái Đính", "Tam Cốc - Bích Động", "Cố đô Hoa Lư", "Hang Múa", "Tuyệt Tình Cốc"],
    "Quảng Ninh": ["Vịnh Hạ Long", "Yên Tử", "Đảo Tuần Châu", "Biển Trà Cổ", "Bảo tàng Quảng Ninh", "Đảo Cô Tô"],
    "Bình Thuận": ["Mũi Né", "Bàu Trắng", "Đảo Phú Quý", "Tháp Chăm Poshanu", "Hải đăng Kê Gà", "Đồi Cát Bay"],
    "Ninh Thuận": ["Vịnh Vĩnh Hy", "Hang Rái", "Tháp Po Klong Garai", "Vườn nho Thái An", "Mũi Dinh"],
    "Khánh Hòa": ["Vinpearl Nha Trang", "Tháp Bà Ponagar", "Đảo Bình Ba", "Vịnh Vân Phong", "Hòn Chồng", "Đảo Điệp Sơn"],
    "Phú Yên": ["Gành Đá Đĩa", "Mũi Điện", "Tháp Nhạn", "Đầm Ô Loan", "Bãi Xép", "Cầu gỗ Ông Cọp"],
    "Bình Định": ["Kỳ Co", "Eo Gió", "Tháp Bánh Ít", "Chùa Thiên Hưng", "Ghềnh Ráng Tiên Sa"],
    "Tây Ninh": ["Núi Bà Đen", "Tòa thánh Tây Ninh", "Hồ Dầu Tiếng", "Ma Thiên Lãnh"],
    "Bà Rịa - Vũng Tàu": ["Tượng Chúa Kitô Vua", "Bãi Sau", "Ngọn Hải Đăng", "Hồ Mây", "Mũi Nghinh Phong", "Côn Đảo"]
};

async function getCoordinates(name, province) {
    const query = `${name}, ${province}, Việt Nam`;
    try {
        const url = `https://nominatim.openstreetmap.org/search`;
        const response = await axios.get(url, {
            params: { q: query, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'HistraApp/1.0' }
        });
        if (response.data && response.data.length > 0) {
            return { lat: parseFloat(response.data[0].lat), lon: parseFloat(response.data[0].lon) };
        }
    } catch (e) {}
    return null;
}

async function perfectUpgrade() {
    console.log("🚀 Bắt đầu chiến dịch SIÊU NÂNG CẤP (Bản không trùng lặp)...");

    try {
        // 1. Hồi sinh toàn bộ để xử lý lại
        await prisma.destination.updateMany({
            where: { isDeleted: true },
            data: { isDeleted: false }
        });

        const provinces = Object.keys(bigData);

        for (const prov of provinces) {
            console.log(`\n📍 Đang xử lý tỉnh: ${prov}`);
            
            // Lấy toàn bộ địa điểm hiện có của tỉnh này
            const dests = await prisma.destination.findMany({
                where: { 
                    isDeleted: false,
                    OR: [{ province: prov }, { city: prov }]
                }
            });

            const pool = [...bigData[prov]]; // Danh sách địa danh xịn sẵn có cho tỉnh này
            const existingNames = new Set();
            const toFix = [];

            // Phân loại: Cái nào xịn rồi thì giữ, cái nào rác thì đưa vào list sửa
            for (const d of dests) {
                if (!d.name.includes("Chợ") && !d.name.includes("Trung tâm văn hóa") && !d.name.includes("Sân vận động")) {
                    existingNames.add(d.name);
                } else {
                    toFix.push(d);
                }
            }

            // Tiến hành sửa các điểm "rác" bằng các tên trong pool chưa có trong existingNames
            for (const d of toFix) {
                // Tìm một tên trong pool mà chưa xuất hiện trong existingNames
                const nextName = pool.find(name => !existingNames.has(name));

                if (nextName) {
                    console.log(`✨ Thay thế: [${d.name}] -> [${nextName}]`);
                    const coords = await getCoordinates(nextName, prov);
                    
                    await prisma.destination.update({
                        where: { id: d.id },
                        data: {
                            name: nextName,
                            latitude: coords ? coords.lat : d.latitude,
                            longitude: coords ? coords.lon : d.longitude,
                            description: `${nextName} là điểm đến tuyệt vời tại ${prov}.`
                        }
                    });
                    existingNames.add(nextName);
                    await delay(800);
                } else {
                    // Nếu hết tên xịn rồi mà vẫn còn dư bản ghi "rác" -> Xóa bản ghi đó để tránh trùng
                    console.log(`🗑️  Xóa bản ghi thừa: ${d.name}`);
                    await prisma.destination.update({
                        where: { id: d.id },
                        data: { isDeleted: true }
                    });
                }
            }
        }

        console.log("🏁 SIÊU NÂNG CẤP HOÀN TẤT - DATABASE ĐÃ SẠCH VÀ ĐẸP!");

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

perfectUpgrade();
