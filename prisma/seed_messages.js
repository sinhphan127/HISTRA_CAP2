import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email1 = 'vansinh1272003@gmail.com';
  const email2 = 'giakhai1272003@gmail.com';

  const user1 = await prisma.user.findUnique({ where: { email: email1 } });
  const user2 = await prisma.user.findUnique({ where: { email: email2 } });

  if (!user1 || !user2) {
    console.log("Could not find one or both users. Please ensure they exist.");
    return;
  }

  // Create a private conversation between user1 and user2
  // Note: We need a unique way to identify a private conversation or just create one.
  // In many systems, private conversations are identified by the set of users.
  
  // Find if a conversation already exists between these two
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      type: 'private',
      users: {
        every: {
          userId: { in: [user1.id, user2.id] }
        }
      }
    }
  });

  let conversationId;

  if (existingConversation) {
    conversationId = existingConversation.id;
    console.log(`Found existing conversation ID: ${conversationId}`);
  } else {
    const newConversation = await prisma.conversation.create({
      data: {
        type: 'private',
        lastMessage: 'Hẹn gặp bạn sau!',
        lastMessageTime: new Date(),
        users: {
          create: [
            { userId: user1.id },
            { userId: user2.id }
          ]
        }
      }
    });
    conversationId = newConversation.id;
    console.log(`Created new conversation ID: ${conversationId}`);
  }

  // Add sample messages
  const messages = [
    { userId: user1.id, content: 'Chào Khải, bạn có khỏe không?', messageType: 'text' },
    { userId: user2.id, content: 'Chào Sinh, mình khỏe. Bạn thì sao?', messageType: 'text' },
    { userId: user1.id, content: 'Mình cũng bình thường. Bạn đã xem bộ ảnh lịch sử mình mới đăng chưa?', messageType: 'text' },
    { userId: user2.id, content: 'Chưa, để mình vào xem ngay. Chắc chắn là đẹp lắm!', messageType: 'text' },
    { userId: user1.id, content: 'Hẹn gặp bạn sau!', messageType: 'text' },
  ];

  console.log("Adding messages...");
  for (const msg of messages) {
    await prisma.message.create({
      data: {
        conversationId: conversationId,
        userId: msg.userId,
        content: msg.content,
        messageType: msg.messageType,
        createdAt: new Date(Date.now() - (messages.length - messages.indexOf(msg)) * 60000) // Delay messages by minutes
      }
    });
  }

  // Update last message in conversation
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: messages[messages.length - 1].content,
      lastMessageTime: new Date()
    }
  });

  console.log("Seeding messages completed!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
