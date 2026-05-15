import os from 'os';
import fs from 'fs';
import path from 'path';

// Cấu hình đường dẫn tới các file cần cập nhật
const APP_PATH = 'd:/myApp';
const ADMIN_PATH = 'c:/Users/vansi/Downloads/histra-admin';

// 1. Lấy địa chỉ IP hiện tại của máy tính
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

const currentIP = getLocalIP();
const apiPort = 5000;
const newBaseUrl = `http://${currentIP}:${apiPort}`;

console.log(`📡 Phát hiện địa chỉ IP mới: ${currentIP}`);
console.log(`🌐 Cập nhật API Base URL thành: ${newBaseUrl}`);

// 2. Cập nhật .env trong myApp
const appEnvPath = path.join(APP_PATH, '.env');
if (fs.existsSync(appEnvPath)) {
    let content = fs.readFileSync(appEnvPath, 'utf8');
    content = content.replace(/API_BASE_URL=http:\/\/[0-9.]+:5000/g, `API_BASE_URL=${newBaseUrl}`);
    fs.writeFileSync(appEnvPath, content);
    console.log(`✅ Đã cập nhật .env trong myApp`);
}

// 3. Cập nhật config.ts trong myApp
const appConfigPath = path.join(APP_PATH, 'constants', 'config.ts');
if (fs.existsSync(appConfigPath)) {
    let content = fs.readFileSync(appConfigPath, 'utf8');
    content = content.replace(/'http:\/\/[0-9.]+:5000'/g, `'${newBaseUrl}'`);
    fs.writeFileSync(appConfigPath, content);
    console.log(`✅ Đã cập nhật constants/config.ts trong myApp`);
}

// 4. Cập nhật .env trong histra-admin (nếu có)
const adminEnvPath = path.join(ADMIN_PATH, '.env');
if (fs.existsSync(adminEnvPath)) {
    let content = fs.readFileSync(adminEnvPath, 'utf8');
    content = content.replace(/VITE_API_URL=http:\/\/[0-9.]+:5000/g, `VITE_API_URL=${newBaseUrl}`);
    fs.writeFileSync(adminEnvPath, content);
    console.log(`✅ Đã cập nhật .env trong histra-admin`);
}

console.log('\n🚀 Xong! Bây giờ bạn hãy khởi động lại App với lệnh: npx expo start -c');
