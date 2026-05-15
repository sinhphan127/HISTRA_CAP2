import prisma from "../src/config/prismaClient.js";
import axios from "axios";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Danh sách địa danh du lịch thay thế cho các tỉnh thành (phong cách du lịch bụi/phượt)
const replacements = {
    "Cà Mau": "Mũi Cà Mau",
    "Sóc Trăng": "Chùa Dơi",
    "Bạc Liêu": "Cánh đồng điện gió Bạc Liêu",
    "Hậu Giang": "Công viên giải trí Kittyd & Minnied",
    "Cần Thơ": "Bến Ninh Kiều",
    "Vĩnh Long": "Cù lao An Bình",
    "Trà Vinh": "Biển Ba Động",
    "Đồng Tháp": "Vườn quốc gia Tràm Chim",
    "An Giang": "Rừng tràm Trà Sư",
    "Kiên Giang": "Đảo Phú Quốc",
    "Bến Tre": "Cồn Phụng",
    "Tiền Giang": "Chùa Vĩnh Tràng",
    "Long An": "Làng nổi Tân Lập",
    "Tây Ninh": "Núi Bà Đen",
    "Bình Dương": "Khu du lịch Đại Nam",
    "Bình Phước": "Vườn quốc gia Bù Gia Mập",
    "Đồng Nai": "Thác Giang Điền",
    "Bà Rịa - Vũng Tàu": "Ngọn Hải Đăng Vũng Tàu",
    "Lâm Đồng": "Thác Datanla Đà Lạt",
    "Đắk Nông": "Hồ Tà Đùng",
    "Đắk Lắk": "Bản Đôn",
    "Gia Lai": "Biển Hồ Pleiku",
    "Kon Tum": "Nhà thờ Gỗ Kon Tum",
    "Bình Thuận": "Bàu Trắng Mũi Né",
    "Ninh Thuận": "Vịnh Vĩnh Hy",
    "Khánh Hòa": "Vinpearl Nha Trang",
    "Phú Yên": "Gành Đá Đĩa",
    "Bình Định": "Kỳ Co Quy Nhơn",
    "Quảng Ngãi": "Đảo Lý Sơn",
    "Quảng Nam": "Phố cổ Hội An",
    "Đà Nẵng": "Bà Nà Hills",
    "Thừa Thiên Huế": "Đại Nội Huế",
    "Quảng Trị": "Thành cổ Quảng Trị",
    "Quảng Bình": "Động Phong Nha",
    "Hà Tĩnh": "Biển Thiên Cầm",
    "Nghệ An": "Bãi biển Cửa Lò",
    "Thanh Hóa": "Bãi biển Sầm Sơn",
    "Ninh Bình": "Tràng An",
    "Hà Nam": "Chùa Tam Chúc",
    "Nam Định": "Nhà thờ đổ Hải Lý",
    "Thái Bình": "Biển Đồng Châu",
    "Hải Dương": "Côn Sơn Kiếp Bạc",
    "Hải Phòng": "Đảo Cát Bà",
    "Quảng Ninh": "Vịnh Hạ Long",
    "Bắc Ninh": "Chùa Phật Tích",
    "Bắc Giang": "Tây Yên Tử",
    "Hưng Yên": "Phố Hiến",
    "Vĩnh Phúc": "Tam Đảo",
    "Thái Nguyên": "Hồ Núi Cốc",
    "Bắc Kạn": "Hồ Ba Bể",
    "Tuyên Quang": "Khu di tích Tân Trào",
    "Phú Thọ": "Đền Hùng",
    "Yên Bái": "Mù Cang Chải",
    "Lào Cai": "Fansipan Sapa",
    "Hà Giang": "Cột cờ Lũng Cú",
    "Cao Bằng": "Thác Bản Giốc",
    "Lạng Sơn": "Mẫu Sơn",
    "Sơn La": "Cao nguyên Mộc Châu",
    "Hòa Bình": "Thung lũng Mai Châu",
    "Điện Biên": "Cánh đồng Mường Thanh",
    "Lai Châu": "Đèo Ô Quy Hồ",
    "Hà Nội": "Hồ Hoàn Kiếm",
    "TP Hồ Chí Minh": "Dinh Độc Lập"
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

async function upgradeDestinations() {
    console.log("🌟 Bắt đầu nâng cấp địa điểm du lịch bụi...");
    
    try {
        // Tìm các địa điểm cần thay thế
        const targets = await prisma.destination.findMany({
            where: {
                isDeleted: false,
                OR: [
                    { name: { contains: 'Trung tâm văn hóa' } },
                    { name: { contains: 'Chợ' } }
                ]
            }
        });

        console.log(`🔍 Tìm thấy ${targets.length} địa điểm cần nâng cấp.`);

        for (const dest of targets) {
            const province = dest.province || dest.city;
            const newName = replacements[province];

            if (newName && newName !== dest.name) {
                console.log(`♻️  Thay thế: [${dest.name}] -> [${newName}] tại ${province}`);
                
                // Tìm tọa độ mới
                const coords = await getCoordinates(newName, province);
                
                await prisma.destination.update({
                    where: { id: dest.id },
                    data: {
                        name: newName,
                        latitude: coords ? coords.lat : dest.latitude,
                        longitude: coords ? coords.lon : dest.longitude,
                        category: "Địa điểm tham quan",
                        description: `Địa điểm du lịch nổi tiếng tại ${province}, thu hút nhiều phượt thủ và khách du lịch khám phá.`
                    }
                });

                if (coords) console.log(`📍 GPS chuẩn: ${coords.lat}, ${coords.lon}`);
                else console.log(`⚠️  Không lấy được GPS tự động cho ${newName}`);

                await delay(1000);
            }
        }
        console.log("🏁 Hoàn thành nâng cấp địa điểm!");
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

upgradeDestinations();
