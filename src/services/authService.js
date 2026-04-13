import prisma from "../config/prismaClient.js";
import crypto from "crypto";
import generateOTP from "../utils/generateOtp.js";
import { sendEmail } from "../utils/mailer.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { signToken } from "../utils/jwt.js";

const OTP_TTL_MINUTES = 10;

export async function register({ full_name, email, password, confirm_password }) {
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error("Email này đã được đăng ký.");

  let role = await prisma.role.findUnique({ where: { roleName: "user" } });
  if (!role) { role = await prisma.role.create({ data: { roleName: "user" } }); }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { 
      fullName: full_name, 
      email: email, 
      password: hashed, 
      status: "pending", 
      userRoles: { create: { roleId: role.id } }
    },
    select: { id: true, email: true, fullName: true, createdAt: true },
  });

  const otp = generateOTP(6);
  const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      userId: user.id,
      code: String(otp),
      expiredAt: expiry,
      isUsed: false
    }
  });

  const subject = "Xác thực tài khoản mới - Hành trình Khám phá Lịch sử";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4a373; border-radius: 12px; background-color: #fffcf2;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6b705c; margin: 0;">Chào mừng bạn đến với Histra!</h2>
        <p style="color: #a98467; font-style: italic; margin-top: 5px;">Xác thực tài khoản của bạn để bắt đầu</p>
      </div>
      <p style="font-size: 16px; color: #333;">Xin chào ${full_name || 'bạn'},</p>
      <p style="font-size: 14px; color: #555;">Đây là mã xác nhận (OTP) gồm 6 chữ số để kích hoạt tài khoản của bạn. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
      <div style="background-color: #ccd5ae; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; border: 1px dashed #6b705c;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b4332;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #555;">Mã sẽ hết hạn sau <b>${OTP_TTL_MINUTES} phút</b>.</p>
      <hr style="border: none; border-top: 1px solid #d4a373; margin: 30px 0;">
      <p style="text-align: center; font-size: 12px; color: #a98467;">© 2026 HISTRA Team.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html, text: `Mã xác nhận của bạn là: ${otp}` });
  return { ...user, message: "Vui lòng kiểm tra email để lấy mã xác thực OTP." };
}

export async function login({ loginIdentifier, password, provider, token, full_name, role_required }) {
  let user;
  let email = loginIdentifier;
  let name = full_name;

  if (provider === "google") {
    if (!token) throw new Error("Yêu cầu token xác thực Google");
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name || full_name;
    } catch (error) {
      throw new Error("Xác thực Google thất bại: " + error.message);
    }
  } else if (provider === "facebook") {
    if (!token) throw new Error("Yêu cầu token xác thực Facebook");
    try {
      const res = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`);
      email = res.data.email;
      name = res.data.name || full_name;
      if (!email) throw new Error("Facebook không cung cấp email. Vui lòng kiểm tra quyền truy cập.");
    } catch (error) {
      throw new Error("Xác thực Facebook thất bại");
    }
  }

  if (provider === "google" || provider === "facebook") {
    user = await prisma.user.findUnique({ 
      where: { email },
      include: { userRoles: { include: { role: true } } }
    });

    if (!user) {
      let role = await prisma.role.findUnique({ where: { roleName: "user" } });
      if (!role) { role = await prisma.role.create({ data: { roleName: "user" } }); }
      user = await prisma.user.create({
        data: {
          email, 
          fullName: name, 
          password: "", 
          status: "active", // Social login mặc định là active
          userRoles: { create: { roleId: role.id } }
        },
        include: { userRoles: { include: { role: true } } }
      });
    }
  } 
  else {
    user = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { email: loginIdentifier },
          { username: loginIdentifier }
        ]
      },
      include: { userRoles: { include: { role: true } } }
    });
    
    if (!user) throw new Error("Tài khoản hoặc mật khẩu không đúng.");
    if (user.isDeleted) throw new Error("Tài khoản này đã bị xoá khỏi hệ thống.");
    if (user.status === "pending") throw new Error("Tài khoản chưa được xác minh. Vui lòng xác minh email trước khi đăng nhập.");
    if (user.status !== "active") throw new Error("Tài khoản này đang bị vô hiệu hoá.");
    
    // Kiểm tra khoá tạm thời
    if (user.lockUntil && new Date() < user.lockUntil) {
      const diff = Math.ceil((user.lockUntil - new Date()) / 60000);
      throw new Error(`Tài khoản đang bị khoá tạm thời do nhập sai quá nhiều lần. Vui lòng thử lại sau ${diff} phút.`);
    }

    if (!user.password && (provider !== "google" && provider !== "facebook")) {
      throw new Error("Tài khoản này được tạo bằng mạng xã hội. Vui lòng đăng nhập bằng Google/Facebook.");
    }
    
    if (user.password) {
      const match = await comparePassword(password, user.password);
      if (!match) {
        // Tăng số lần đăng nhập sai
        const newAttempts = (user.failedLoginAttempts || 0) + 1;
        let lockUntil = null;
        if (newAttempts >= 5) {
          lockUntil = new Date(Date.now() + 15 * 60000); // Khoá 15 phút
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: newAttempts, lockUntil }
          });
          throw new Error(`Bạn đã nhập sai mật khẩu 5 lần. Tài khoản bị khoá tạm thời trong 15 phút.`);
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: newAttempts }
        });
        throw new Error("Tài khoản hoặc mật khẩu không đúng.");
      }
    }
    
    // Đăng nhập thành công -> Reset số lần sai
    if (user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockUntil: null }
      });
    }
  }

  const userRoles = user.userRoles.map(ur => ur.role.roleName);
  
  if (role_required === "admin" && !userRoles.includes("admin")) {
    throw new Error("Bạn không có quyền truy cập vào trang quản trị");
  }

  const jwtToken = signToken({ id: user.id, email: user.email, role: userRoles[0] || "user" });
  return {
    token: jwtToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: userRoles[0] || "user"
    }
  };
}

export async function forgotPassword ( email ) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Không tìm thấy người dùng với email này");

  const otp = generateOTP(6);
  const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      userId: user.id,
      code: String(otp),
      expiredAt: expiry,
      isUsed: false
    }
  });

  const subject = "Mã xác thực bảo mật (OTP) - Hành trình Khám phá Lịch sử";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4a373; border-radius: 12px; background-color: #fffcf2;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6b705c; margin: 0;">Chuyến hành trình đang chờ bạn</h2>
        <p style="color: #a98467; font-style: italic; margin-top: 5px;">Xác thực để bắt đầu khám phá những dấu ấn lịch sử</p>
      </div>
      <p style="font-size: 16px; color: #333;">Xin chào nhà lữ hành,</p>
      <div style="background-color: #ccd5ae; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; border: 1px dashed #6b705c;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b4332;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #555;">Mã hết hạn sau <b>${OTP_TTL_MINUTES} phút</b>.</p>
      <hr style="border: none; border-top: 1px solid #d4a373; margin: 30px 0;">
      <p style="text-align: center; font-size: 12px; color: #a98467;">© 2026 HISTRA Team.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html, text: `OTP: ${otp}` });
  return { message: "Mã OTP đã được gửi thành công" };
}

export async function verifyOtp({ email, otp }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Yêu cầu không hợp lệ");
  
  const otpRecord = await prisma.otpCode.findFirst({
    where: { userId: user.id, code: String(otp).trim(), isUsed: false },
    orderBy: { createdAt: 'desc' }
  });
  if (!otpRecord) throw new Error("Mã OTP không chính xác hoặc đã được sử dụng");
  if (new Date() > otpRecord.expiredAt) throw new Error("Mã OTP đã hết hạn");

  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { isUsed: true }
  });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: resetToken,
      resetTokenExpiry: resetTokenExpiry,
    },
  });

  return { resetToken };
}

export async function resetPassword({ email, resetToken, newPassword }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.resetToken !== resetToken) throw new Error("Token không hợp lệ");
  if (new Date() > user.resetTokenExpiry) throw new Error("Token đã hết hạn");

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: "Đặt lại mật khẩu thành công" };
}

export async function updateProfile(userId, { full_name, phone, bio, avatar_url }) {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });
  if (!user) throw new Error("Không tìm thấy người dùng");

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId, 10) },
    data: {
      ...(full_name && { fullName: full_name }),
      ...(bio && { bio }),
      ...(phone && { phoneNumber: phone }),
      ...(avatar_url && { avatarUrl: avatar_url }),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      bio: true,
      phoneNumber: true,
      avatarUrl: true
    }
  });

  return updatedUser;
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) },
    select: {
      id: true,
      email: true,
      fullName: true,
      bio: true,
      phoneNumber: true,
      avatarUrl: true,
      userRoles: { include: { role: true } },
      createdAt: true,
      _count: {
        select: {
          trips: true,
          friendshipsAddressee: { where: { status: 'accepted' } }, // Followers
          friendshipsRequester: { where: { status: 'accepted' } }, // Following
        }
      }
    }
  });
  if (!user) throw new Error("Không tìm thấy người dùng");
  
  const mappedRole = user.userRoles?.[0]?.role?.roleName || "user";
  return {
    ...user,
    role: mappedRole
  };
}

export async function verifyRegisterOtp({ email, otp }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Yêu cầu không hợp lệ");
  if (user.status !== "pending") throw new Error("Tài khoản này đã được xác thực hoặc bị khóa");

  const otpRecord = await prisma.otpCode.findFirst({
    where: { userId: user.id, code: String(otp).trim(), isUsed: false },
    orderBy: { createdAt: 'desc' }
  });

  if (!otpRecord) throw new Error("Mã OTP không chính xác");
  if (new Date() > otpRecord.expiredAt) throw new Error("Mã OTP đã hết hạn");

  await prisma.$transaction([
    prisma.otpCode.update({ where: { id: otpRecord.id }, data: { isUsed: true } }),
    prisma.user.update({ where: { id: user.id }, data: { status: "active" } })
  ]);

  return { message: "Xác thực tài khoản thành công! Bây giờ bạn có thể đăng nhập." };
}

export async function resendRegisterOtp(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Không tìm thấy tài khoản");
  if (user.status !== "pending") throw new Error("Tài khoản không ở trạng thái chờ xác thực");

  const otp = generateOTP(6);
  const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // Huỷ các mã cũ chưa dùng
  await prisma.otpCode.updateMany({
    where: { userId: user.id, isUsed: false },
    data: { isUsed: true }
  });

  await prisma.otpCode.create({
    data: {
      userId: user.id,
      code: String(otp),
      expiredAt: expiry,
      isUsed: false
    }
  });

  const subject = "Mã xác thực mới - Hành trình Khám phá Lịch sử";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4a373; border-radius: 12px; background-color: #fffcf2;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6b705c; margin: 0;">Mã xác thực mới của bạn</h2>
      </div>
      <p style="font-size: 16px; color: #333;">Xin chào ${user.fullName || 'bạn'},</p>
      <div style="background-color: #ccd5ae; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; border: 1px dashed #6b705c;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b4332;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #555;">Mã hết hạn sau <b>${OTP_TTL_MINUTES} phút</b>.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html, text: `OTP: ${otp}` });
  return { message: "Mã OTP mới đã được gửi thành công." };
}

export async function getUserFriends(userId) {
  const uid = parseInt(userId, 10);
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: uid, status: 'accepted' },
        { addresseeId: uid, status: 'accepted' }
      ]
    },
    include: {
      requester: { select: { id: true, fullName: true, avatarUrl: true, bio: true } },
      addressee: { select: { id: true, fullName: true, avatarUrl: true, bio: true } }
    }
  });

  return friendships.map(f => {
    return f.requesterId === uid ? f.addressee : f.requester;
  });
}