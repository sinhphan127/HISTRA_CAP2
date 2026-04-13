import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js"; 
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authMiddleware = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập để thực hiện hành động này",
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id, 10) },
      select: { 
        id: true, 
        email: true,  
        fullName: true,
        bio: true,
        avatarUrl: true,    
        userRoles: { include: { role: true } },
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(401).json({ success: false, message: "Người dùng không tồn tại trong hệ thống" });
    }
    const mappedRole = user.userRoles?.[0]?.role?.roleName || "user";
    req.user = {
      ...user,
      role: mappedRole
    };
    next();
  } catch (error) {
    console.log("=== LỖI GIẢI MÃ TOKEN ===");
    console.log(error);
    return res.status(401).json({ success: false, message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn", error_detail: error.message });
  }
}; 
export const restrictToAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập vào khu vực quản trị viên"
    });
  }
  next();
};

export default authMiddleware;