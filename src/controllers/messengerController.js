import prisma from "../config/prismaClient.js";
import { 
    createGroupConversation, 
    getMessagesByConversation as getMessagesService, 
    getOrCreatePrivateConversation,
    saveMessage,
    getUserConversations,
    toggleMessageReaction,
    markMessagesAsRead
} from '../services/messengerService.js';
import { io, notifyNewMessage } from '../socket.js';


export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await getUserConversations(userId);
        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error("Lỗi lấy danh sách chat:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const createGroup = async (req, res) => {
    try {
        let { name, userIds } = req.body;
        const creatorId = parseInt(req.user.id, 10); 
        let formattedUserIds = [];
        if (Array.isArray(userIds)) {
            formattedUserIds = userIds.map(id => parseInt(id, 10));
        } else if (typeof userIds === 'string') {
            formattedUserIds = userIds.split(',').map(id => parseInt(id.trim(), 10));
        }
        const group = await createGroupConversation(name, formattedUserIds, creatorId);
        res.status(201).json({ success: true, data: group });
    } catch (error) {
        const status = error.message === "Nhóm chat chỉ hỗ trợ tối đa 50 thành viên." ? 400 : 500;
        const message = status === 400 ? error.message : "Không thể tạo nhóm chat.";
        res.status(status).json({ success: false, message });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const skip = parseInt(req.query.skip) || 0;
        const formattedId = parseInt(conversationId, 10);
        const messages = await getMessagesService(formattedId, skip);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error("Lỗi chi tiết:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const createPrivateChat = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;
        if (senderId === receiverId) throw new Error("Không thể tự chat với chính mình.");
        const conversation = await getOrCreatePrivateConversation(senderId, receiverId);
        res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        const status = error.message === "Không thể tự chat với chính mình." ? 400 : 500;
        const message = status === 400 ? error.message : "Không thể tạo cuộc trò chuyện.";
        res.status(status).json({ success: false, message });
    }
};

export const sendImage = async (req, res) => {
    try {
        const { conversationId } = req.body;
        if (!req.file) return res.status(400).json({ message: "Không có ảnh nào được tải lên." });
        const imageUrl = `/uploads/${req.file.filename}`;
        const message = await saveMessage(conversationId, req.user.id, imageUrl, 'image');

        // Emit qua Socket.io
        await notifyNewMessage(parseInt(conversationId, 10), message);

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: "Không thể gửi ảnh lúc này." });
    }
};
export const sendMessageAPI = async (req, res) => {
    try {
        const { conversationId, content, type } = req.body;
        const senderId = parseInt(req.user.id, 10);
        if (!conversationId || !content) {
            return res.status(400).json({ success: false, message: "Thiếu dữ liệu đầu vào." });
        }
        const formattedId = parseInt(conversationId, 10);
        const newMessage = await saveMessage(formattedId, senderId, content, type || 'text');

        // Emit via Socket.io
        await notifyNewMessage(formattedId, newMessage);

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        console.error("Lỗi gửi tin nhắn API:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};
export const searchUsers = async (req, res) => {
    try {
        const { keyword } = req.query;
        const currentUserId = parseInt(req.user.id, 10);

        if (!keyword) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập từ khóa tìm kiếm." });
        }
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { fullName: { contains: keyword } },
                            { email: { contains: keyword } }
                        ]
                    },
                    {
                        id: { not: currentUserId } 
                    }
                ]
            },
            select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                email: true
            },
            take: 10
        });

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Lỗi tìm kiếm người dùng:", error);
        res.status(500).json({ success: false, message: "Lỗi Server khi tìm kiếm" });
    }
};

export const reactToMessage = async (req, res) => {
    try {
        const { messageId, reaction } = req.body;
        const userId = req.user.id;
        const result = await toggleMessageReaction(messageId, userId, reaction);
        
        // Notify via socket if possible (you can emit a 'message_reaction' event)
        // For simplicity, we can fetch the conversationId or pass it in body
        const message = await prisma.message.findUnique({ 
            where: { id: parseInt(messageId, 10) },
            select: { conversationId: true }
        });
        
        if (message) {
            io.to(parseInt(message.conversationId, 10)).emit('message_reaction', {
                messageId,
                userId,
                reaction: result // might be null if deleted
            });
        }

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const markRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        await markMessagesAsRead(conversationId, userId);
        
        // Notify other user that messages are read
        io.to(parseInt(conversationId, 10)).emit('messages_read', {
            conversationId: parseInt(conversationId, 10),
            userId // The user who read the messages
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};
