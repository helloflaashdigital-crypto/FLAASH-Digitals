import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { recordVisitor } from '../controllers/visitorController.js';

const router = Router();
const visitFields = () => [
  body('sessionId').isUUID(4).withMessage('Invalid visit session'),
  body('landingPage').optional().isString().bail().isLength({ max: 500 }).matches(/^\/(?!\/)[^?#]*$/).withMessage('Invalid landing page'),
];
const limit = rateLimit({ windowMs: 15 * 60 * 1000, max: 120, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again shortly.' } });
router.post('/visits', limit, visitFields(), recordVisitor);
router.post('/visitors', limit, visitFields(), [
  body('company').isString().bail().trim().isLength({ min: 1, max: 120 }).withMessage('Enter your company name (up to 120 characters)'),
  body('email').isString().bail().trim().isLength({ max: 254 }).isEmail().withMessage('Enter a valid email address'),
  body('phone').isString().bail().trim().isLength({ min: 7, max: 30 }).matches(/^\+?[\d\s().-]+$/).custom(value => { const length = value.replace(/\D/g, '').length; return length >= 7 && length <= 15; }).withMessage('Enter a valid phone number with 7 to 15 digits'),
], recordVisitor);
export default router;
