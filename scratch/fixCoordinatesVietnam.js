import prisma from "../src/config/prismaClient.js";

const provinceCoords = {
  "An Giang": { lat: 10.53, lng: 105.12 },
  "Bà Rịa - Vũng Tàu": { lat: 10.45, lng: 107.16 },
  "Bắc Giang": { lat: 21.27, lng: 106.19 },
  "Bắc Kạn": { lat: 22.14, lng: 105.83 },
  "Bạc Liêu": { lat: 9.29, lng: 105.72 },
  "Bắc Ninh": { lat: 21.18, lng: 106.07 },
  "Bến Tre": { lat: 10.24, lng: 106.37 },
  "Bình Định": { lat: 13.78, lng: 109.22 },
  "Bình Dương": { lat: 10.97, lng: 106.65 },
  "Bình Phước": { lat: 11.53, lng: 106.88 },
  "Bình Thuận": { lat: 10.93, lng: 108.10 },
  "Cà Mau": { lat: 9.17, lng: 104.91 },
  "Cần Thơ": { lat: 10.03, lng: 105.78 },
  "Cao Bằng": { lat: 22.66, lng: 106.26 },
  "Đà Nẵng": { lat: 16.04, lng: 108.20 },
  "Đắk Lắk": { lat: 12.66, lng: 108.03 },
  "Đắk Nông": { lat: 12.00, lng: 107.68 },
  "Điện Biên": { lat: 21.38, lng: 103.02 },
  "Đồng Nai": { lat: 10.94, lng: 106.81 },
  "Đồng Tháp": { lat: 10.45, lng: 105.63 },
  "Gia Lai": { lat: 13.98, lng: 108.00 },
  "Hà Giang": { lat: 22.82, lng: 104.98 },
  "Hà Nam": { lat: 20.54, lng: 105.91 },
  "Hà Nội": { lat: 21.02, lng: 105.83 },
  "Hà Tĩnh": { lat: 18.33, lng: 105.90 },
  "Hải Dương": { lat: 20.93, lng: 106.31 },
  "Hải Phòng": { lat: 20.84, lng: 106.68 },
  "Hậu Giang": { lat: 9.78, lng: 105.47 },
  "Hòa Bình": { lat: 20.81, lng: 105.33 },
  "Hưng Yên": { lat: 20.64, lng: 106.05 },
  "Khánh Hòa": { lat: 12.23, lng: 109.19 },
  "Kiên Giang": { lat: 10.01, lng: 105.08 },
  "Kon Tum": { lat: 14.35, lng: 108.00 },
  "Lai Châu": { lat: 22.39, lng: 103.46 },
  "Lâm Đồng": { lat: 11.94, lng: 108.45 },
  "Lạng Sơn": { lat: 21.85, lng: 106.76 },
  "Lào Cai": { lat: 22.48, lng: 103.97 },
  "Long An": { lat: 10.53, lng: 106.40 },
  "Nam Định": { lat: 20.42, lng: 106.16 },
  "Nghệ An": { lat: 18.67, lng: 105.68 },
  "Ninh Bình": { lat: 20.25, lng: 105.97 },
  "Ninh Thuận": { lat: 11.56, lng: 108.99 },
  "Phú Thọ": { lat: 21.32, lng: 105.40 },
  "Phú Yên": { lat: 13.08, lng: 109.30 },
  "Quảng Bình": { lat: 17.47, lng: 106.60 },
  "Quảng Nam": { lat: 15.88, lng: 108.33 },
  "Quảng Ngãi": { lat: 15.12, lng: 108.80 },
  "Quảng Ninh": { lat: 20.95, lng: 107.07 },
  "Quảng Trị": { lat: 16.74, lng: 107.10 },
  "Sóc Trăng": { lat: 9.60, lng: 105.97 },
  "Sơn La": { lat: 21.32, lng: 103.91 },
  "Tây Ninh": { lat: 11.31, lng: 106.10 },
  "Thái Bình": { lat: 20.44, lng: 106.33 },
  "Thái Nguyên": { lat: 21.59, lng: 105.84 },
  "Thanh Hóa": { lat: 19.80, lng: 105.77 },
  "Thừa Thiên Huế": { lat: 16.46, lng: 107.59 },
  "Tiền Giang": { lat: 10.36, lng: 106.36 },
  "TP. Hồ Chí Minh": { lat: 10.77, lng: 106.69 },
  "Hồ Chí Minh": { lat: 10.77, lng: 106.69 },
  "Trà Vinh": { lat: 9.94, lng: 106.34 },
  "Tuyên Quang": { lat: 21.81, lng: 105.21 },
  "Vĩnh Long": { lat: 10.25, lng: 105.97 },
  "Vĩnh Phúc": { lat: 21.31, lng: 105.59 },
  "Yên Bái": { lat: 21.70, lng: 104.87 }
};

async function fix() {
  console.log("Fixing coordinates for all destinations (Numerical Check)...");
  const destinations = await prisma.destination.findMany({
    where: { isDeleted: false }
  });

  let count = 0;
  for (const dest of destinations) {
    const coords = provinceCoords[dest.province];
    const latNum = Number(dest.latitude);
    const lngNum = Number(dest.longitude);
    
    // Kiểm tra nếu tọa độ là placeholder (15.0 hoặc 16.0)
    if (coords && (latNum === 15 || latNum === 16)) {
      // Thêm random offset nhỏ để không bị chồng lên nhau
      const newLat = (coords.lat + (Math.random() - 0.5) * 0.08).toFixed(4);
      const newLng = (coords.lng + (Math.random() - 0.5) * 0.08).toFixed(4);
      
      await prisma.destination.update({
        where: { id: dest.id },
        data: {
          latitude: newLat,
          longitude: newLng
        }
      });
      count++;
    }
  }
  
  console.log(`Updated ${count} destinations to correct province locations.`);
  console.log("Coordinate fix finished!");
  process.exit(0);
}

fix();
