import prisma from "../src/config/prismaClient.js";
import axios from "axios";

/**
 * Hàm delay để tránh bị chặn bởi API (Rate Limit)
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hàm tìm kiếm tọa độ với chiến lược fallback
 */
async function getCoordinates(name, city, province) {
    // 0. Làm sạch tên địa điểm (Heuristics)
    let searchName = name;
    if (name.startsWith('Chợ trung tâm')) {
        searchName = name.replace('Chợ trung tâm', 'Chợ');
    } else if (name.startsWith('Trung tâm văn hóa')) {
        searchName = name.replace('Trung tâm văn hóa', 'Trung tâm văn hóa tỉnh');
    }

    // Các định dạng truy vấn thử nghiệm
    const queries = [
        `${searchName}, ${city || ''}, ${province || ''}, Việt Nam`,
        `${searchName}, ${province || city || ''}, Việt Nam`,
        `${searchName}, Việt Nam`
    ].filter(q => q.length > 5);

    for (let query of queries) {
        try {
            const url = `https://nominatim.openstreetmap.org/search`;
            const response = await axios.get(url, {
                params: {
                    q: query,
                    format: 'json',
                    limit: 1
                },
                headers: { 'User-Agent': 'HistraApp/1.0' }
            });

            if (response.data && response.data.length > 0) {
                return {
                    lat: parseFloat(response.data[0].lat),
                    lon: parseFloat(response.data[0].lon),
                    method: query
                };
            }
            // Nếu không thấy, đợi một chút rồi thử query tiếp theo
            await delay(500);
        } catch (error) {
            console.error(`Lỗi query (${query}):`, error.message);
        }
    }
    return null;
}

async function startFixing() {
    console.log("🚀 Bắt đầu quá trình sửa lỗi tọa độ Destination...");
    
    try {
        // 1. Quét tất cả các địa điểm có từ khóa "Trung tâm văn hóa" hoặc "Chợ" hoặc đang có tọa độ 15.01
        const destinations = await prisma.destination.findMany({
            where: { 
                isDeleted: false,
                OR: [
                    { latitude: 15.01 },
                    { name: { contains: 'Trung tâm văn hóa' } },
                    { name: { contains: 'Chợ' } }
                ]
            }
        });

        console.log(`🔍 Tìm thấy ${destinations.length} địa điểm cần kiểm tra.`);

        let successCount = 0;
        let failCount = 0;

        for (const dest of destinations) {
            console.log(`\n-----------------------------------`);
            console.log(`📍 Đang xử lý: ${dest.name} (${dest.city})`);
            console.log(`Current GPS: ${dest.latitude}, ${dest.longitude}`);

            // Tra cứu tọa độ mới
            const newCoords = await getCoordinates(dest.name, dest.city, dest.province);

            if (newCoords) {
                console.log(`✅ Tìm thấy tọa độ mới: ${newCoords.lat}, ${newCoords.lon}`);
                
                // Cập nhật Database
                await prisma.destination.update({
                    where: { id: dest.id },
                    data: {
                        latitude: newCoords.lat,
                        longitude: newCoords.lon
                    }
                });
                
                successCount++;
            } else {
                console.log(`❌ Không tìm thấy tọa độ chuẩn cho địa điểm này.`);
                failCount++;
            }

            // Nghỉ 1 giây giữa các lần gọi để tôn trọng API cộng đồng
            await delay(1000);
        }

        console.log(`\n===================================`);
        console.log(`🏁 HOÀN THÀNH!`);
        console.log(`✅ Cập nhật thành công: ${successCount}`);
        console.log(`❌ Thất bại: ${failCount}`);

    } catch (error) {
        console.error("❌ Lỗi nghiêm trọng:", error);
    } finally {
        await prisma.$disconnect();
    }
}

startFixing();
