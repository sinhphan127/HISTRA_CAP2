import prisma from "../config/prismaClient.js";

export const createStory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { content } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!imageUrl) {
            return res.status(400).json({ success: false, message: "Vui lòng tải lên hình ảnh cho Tin" });
        }

        // Tin hết hạn sau 24 giờ
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const story = await prisma.story.create({
            data: {
                userId,
                imageUrl,
                content,
                expiresAt
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true
                    }
                }
            }
        });

        res.status(201).json({ success: true, data: story });
    } catch (error) {
        console.error("Lỗi đăng Tin:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const getStories = async (req, res) => {
    try {
        const now = new Date();
        const stories = await prisma.story.findMany({
            where: {
                expiresAt: {
                    gt: now
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ success: true, data: stories });
    } catch (error) {
        console.error("Lỗi lấy danh sách Tin:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const deleteStory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const story = await prisma.story.findUnique({
            where: { id: parseInt(id, 10) }
        });

        if (!story) {
            return res.status(404).json({ success: false, message: "Không tìm thấy Tin" });
        }

        if (story.userId !== userId) {
            return res.status(403).json({ success: false, message: "Không có quyền xóa Tin này" });
        }

        await prisma.story.delete({
            where: { id: parseInt(id, 10) }
        });

        res.status(200).json({ success: true, message: "Đã xóa Tin" });
    } catch (error) {
        console.error("Lỗi xóa Tin:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};
