import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from './utils/jwt.js'; 
import { saveMessage } from './services/messengerService.js';
import prisma from './config/prismaClient.js';

let io = null;

export const notifyNewMessage = async (conversationId, message) => {
    if (!io) return;
    
    const cid = parseInt(conversationId, 10);
    // Emit tới phòng hội thoại
    io.to(cid).emit('receive_message', message);

    // Emit tới từng user trong hội thoại
    const conversation = await prisma.conversation.findUnique({
        where: { id: cid },
        include: { users: true }
    });

    if (conversation) {
        conversation.users.forEach(u => {
            io.to(`user_${u.userId}`).emit('new_message_notification', {
                conversationId: conversation.id,
                message: message
            });
        });
    }
};

export const initSocket = (server) => {
    io = new SocketIOServer(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: true 
    },
    allowEIO3: true, 
    transports: ['polling', 'websocket'] 
});
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Vui lòng cung cấp token."));

            const decoded = verifyToken(token);
            socket.user = decoded; 
            next();
        } catch (err) {
            console.log("[LỖI AUTH]:", err.message);
            return next(new Error("Token không hợp lệ."));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id || socket.user._id;
        console.log(`[KẾT NỐI] User: ${userId} | SocketID: ${socket.id}`);
        
        // Vào phòng cá nhân để nhận thông báo toàn cục
        socket.join(`user_${userId}`);

        socket.on('join_room', (conversationId) => {
            socket.join(parseInt(conversationId, 10));
            console.log(`[PHÒNG] User ${userId} đã vào phòng: ${conversationId}`);
        });

        socket.on('send_message', async (data) => {
            console.log(`[TIN NHẮN] Từ ${userId} gửi tới phòng ${data.conversationId}: ${data.content}`);

            try {
                const message = await saveMessage(data.conversationId, userId, data.content, data.type || 'text');
                await notifyNewMessage(data.conversationId, message);
            } catch (dbErr) {
                console.log("⚠️ [LỖI LƯU DB/SOCKET]:", dbErr.message);
            }
        });

        socket.on('typing', (data) => {
            const cid = parseInt(data.conversationId, 10);
            socket.to(cid).emit('typing', { userId, conversationId: cid });
        });

        socket.on('stop_typing', (data) => {
            const cid = parseInt(data.conversationId, 10);
            socket.to(cid).emit('stop_typing', { userId, conversationId: cid });
        });

        // --- CALL SIGNALING ---
        socket.on('request_call', async (data) => {
            // data: { conversationId, callerId, callerName, callerAvatar, type }
            const cid = parseInt(data.conversationId, 10);
            console.log(`[CALL] 📞 Yêu cầu gọi từ User ID: ${userId} trong phòng ${cid}`);
            
            // Tìm tất cả user trong hội thoại để báo cuộc gọi đến
            const conversation = await prisma.conversation.findUnique({
                where: { id: cid },
                include: { users: true }
            });

            if (conversation) {
                console.log(`[CALL] Tìm thấy ${conversation.users.length} người trong hội thoại. User hiện tại: ${userId} (${typeof userId})`);
                conversation.users.forEach(u => {
                    console.log(`[CALL] Kiểm tra User trong DB: ${u.userId} (${typeof u.userId})`);
                    // Không báo chính mình
                    if (String(u.userId) !== String(userId)) {
                        console.log(`[CALL] 📤 Đang gửi tín hiệu 'incoming_call' tới phòng: user_${u.userId}`);
                        io.to(`user_${u.userId}`).emit('incoming_call', data);
                    }
                });
            } else {
                console.log(`[CALL] ❌ Không tìm thấy hội thoại ID: ${cid}`);
            }
        });

        socket.on('accept_call', (data) => {
            const cid = parseInt(data.conversationId, 10);
            socket.to(cid).emit('call_accepted', data);
            console.log(`[CALL] Accepted in room ${cid}`);
        });

        socket.on('reject_call', (data) => {
            const cid = parseInt(data.conversationId, 10);
            socket.to(cid).emit('call_rejected', data);
            console.log(`[CALL] Rejected in room ${cid}`);
        });

        socket.on('end_call', (data) => {
            const cid = parseInt(data.conversationId, 10);
            socket.to(cid).emit('call_ended', data);
            console.log(`[CALL] Ended in room ${cid}`);
        });
        
        socket.on('disconnect', () => {
            console.log(`[NGẮT KẾT NỐI] User: ${userId}`);
        });
    });
    return io;
};

export { io };
export default initSocket;