import prisma from '../config/prismaClient.js';

// Tạo nhóm chat
export const createGroupConversation = async (name, userIds, creatorId) => {
    const cId = parseInt(creatorId, 10);
    const allMemberIds = [...new Set([...userIds.map(id => parseInt(id, 10)), cId])];
    if (allMemberIds.length > 50) {
        throw new Error("Nhóm chat chỉ hỗ trợ tối đa 50 thành viên.");
    }
    return await prisma.conversation.create({
        data: {
            type: "group",
            groupName: name,
            creatorId: cId,
            users: {
                create: allMemberIds.map(id => ({ userId: id }))
            }
        },
        include: { users: true }
    });
};

// Lưu tin nhắn 
export const saveMessage = async (conversationId, userId, content, type = 'text') => {
    const cid = parseInt(conversationId, 10);
    const uid = parseInt(userId, 10);
    
    const message = await prisma.message.create({
        data: {
            conversationId: cid, 
            userId: uid,
            content: content,
            messageType: type
        },
        include: {
            user: { select: { fullName: true, avatarUrl: true } }
        }
    });

    await prisma.conversation.update({
        where: { id: cid },
        data: {
            lastMessage: type === 'text' ? content : `[${type}]`,
            lastMessageTime: new Date()
        }
    });

    return message;
};

// Lấy lịch sử chat
export const getMessagesByConversation = async (conversationId, skip = 0, take = 50) => {
    return await prisma.message.findMany({
        where: { conversationId: parseInt(conversationId, 10) }, 
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip, 10),
        take: parseInt(take, 10),
        include: { user: { select: { fullName: true, avatarUrl: true } } }
    });
};

// Chat 1-1
export const getOrCreatePrivateConversation = async (user1Id, user2Id) => {
    const u1 = parseInt(user1Id, 10);
    const u2 = parseInt(user2Id, 10);
    const existingConversation = await prisma.conversation.findFirst({
        where: {
            type: "private", 
            AND: [
                { users: { some: { userId: u1 } } },
                { users: { some: { userId: u2 } } }
            ]
        },
        include: { users: true }
    });
    if (existingConversation) return existingConversation;
    return await prisma.conversation.create({
        data: {
            type: "private",
            users: {
                create: [{ userId: u1 }, { userId: u2 }]
            }
        },
        include: { users: true }
    });
};

// Lấy danh sách hội thoại của user
export const getUserConversations = async (userId) => {
    const uid = parseInt(userId, 10);
    const conversations = await prisma.conversation.findMany({
        where: {
            users: {
                some: { userId: uid }
            }
        },
        include: {
            users: {
                include: {
                    user: {
                        select: { id: true, fullName: true, avatarUrl: true }
                    }
                }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    conversations.sort((a, b) => {
        const dateA = a.messages.length > 0 ? new Date(a.messages[0].createdAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.messages.length > 0 ? new Date(b.messages[0].createdAt).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
    });

    return conversations;
};