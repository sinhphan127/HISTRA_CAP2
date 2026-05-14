import express from 'express';
import multer from 'multer';
import path from 'path';
import { getConversations, createGroup, getChatHistory, createPrivateChat, sendImage, sendMessageAPI, searchUsers } from '../controllers/messengerController.js';
import authMiddleware from '../middlewares/authMiddlewares.js';
const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
router.use(authMiddleware);
router.get('/conversations', getConversations);
router.post('/group', createGroup);
router.get('/:conversationId/messages', getChatHistory);
router.post('/private', createPrivateChat);
router.post('/send-image', upload.single('image'), sendImage); 
router.post('/send-message', sendMessageAPI);
router.get('/search-users', searchUsers);
export default router;