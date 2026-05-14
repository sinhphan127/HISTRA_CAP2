import prisma from "../src/config/prismaClient.js";
import { hashPassword } from "../src/utils/bcrypt.js";

async function createAdmin() {
  const adminData = {
    username: "admin2",
    email: "admin2@histra.vn",
    password: "admin123",
    fullName: "Second Administrator"
  };

  try {
    // 1. Kiểm tra/Tạo Role admin
    let adminRole = await prisma.role.findUnique({
      where: { roleName: "admin" }
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { roleName: "admin" }
      });
      console.log("Created 'admin' role.");
    }

    // 2. Kiểm tra User đã tồn tại chưa
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      }
    });

    if (existingUser) {
      // Nếu user đã tồn tại, cập nhật role thành admin nếu chưa có
      const existingUserRole = await prisma.userRole.findFirst({
        where: { userId: existingUser.id, roleId: adminRole.id }
      });

      if (!existingUserRole) {
        await prisma.userRole.create({
          data: { userId: existingUser.id, roleId: adminRole.id }
        });
        console.log(`Updated user '${existingUser.username}' to admin role.`);
      } else {
        console.log(`User '${existingUser.username}' already has admin role.`);
      }
    } else {
      // 3. Tạo User mới
      const hashedPassword = await hashPassword(adminData.password);
      const newUser = await prisma.user.create({
        data: {
          username: adminData.username,
          email: adminData.email,
          password: hashedPassword,
          fullName: adminData.fullName,
          status: "active",
          userRoles: {
            create: {
              roleId: adminRole.id
            }
          }
        }
      });
      console.log(`Created new admin user: ${newUser.username}`);
      console.log(`Email: ${newUser.email}`);
      console.log(`Password: ${adminData.password}`);
    }

  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
