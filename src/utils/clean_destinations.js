import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function detectAndClean() {
    console.log('--- BẮT ĐẦU KIỂM TRA CHUYÊN SÂU ---');
    
    const all = await prisma.destination.findMany({
        select: { id: true, name: true, city: true, province: true, address: true }
    });

    const nameMap = new Map();
    const toDelete = [];

    all.forEach(dest => {
        if (!dest.name) return;

        // Chuẩn hóa tên: xóa dấu, xóa khoảng trắng, chuyển về chữ thường
        const normalized = dest.name
            .trim()
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
            .replace(/\s+/g, ''); // Xóa toàn bộ khoảng trắng

        if (nameMap.has(normalized)) {
            const first = nameMap.get(normalized);
            toDelete.push({
                id: dest.id,
                name: dest.name,
                location: dest.city || dest.province || 'Không rõ',
                keepId: first.id,
                keepLocation: first.location
            });
        } else {
            nameMap.set(normalized, { id: dest.id, location: dest.city || dest.province || 'Không rõ' });
        }
    });

    if (toDelete.length > 0) {
        console.log(`⚠️  Phát hiện ${toDelete.length} trường hợp nghi vấn trùng lặp:`);
        toDelete.forEach(d => {
            console.log(`   - TRÙNG: [ID: ${d.id}] "${d.name}" (${d.location})`);
            console.log(`     GIỮ:  [ID: ${d.keepId}] (${d.keepLocation})`);
            console.log('     ---');
        });

        console.log(`\n🚀 Đang tiến hành xóa ${toDelete.length} bản ghi...`);
        const ids = toDelete.map(d => d.id);
        const result = await prisma.destination.deleteMany({
            where: { id: { in: ids } }
        });
        console.log(`✅ Thành công! Đã xóa ${result.count} địa điểm trùng tên.`);
    } else {
        console.log('✨ Tuyệt vời! Không tìm thấy địa điểm nào bị trùng tên sau khi đã xóa dấu và khoảng trắng.');
    }
}

detectAndClean()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
