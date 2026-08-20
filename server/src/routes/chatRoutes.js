import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { sendChatMessage } from '../controllers/chatController.js';

const router = Router();
const chatLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many assistant messages. Please wait a few minutes and try again.' } });
router.post('/', chatLimit, [body('message').isString().trim().isLength({ min: 1, max: 1200 }).withMessage('Enter a message up to 1,200 characters.'), body('history').optional().isArray({ max: 8 }).withMessage('Conversation history is invalid.')], sendChatMessage);
export default router;
