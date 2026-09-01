import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import publicRoutes from './routes/publicRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();
const contactLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many inquiries from this network. Please try again later.' }
});
app.set('trust proxy', 1);
app.set('etag', 'strong');
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, callback) => { const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(value => value.trim()); if (!origin || allowed.includes(origin)) return callback(null, true); callback(new Error('Origin not allowed by CORS')); }, credentials: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: request => request.path === '/api/v1/health',
  message: { success: false, message: 'Request volume is temporarily high. Please retry shortly.' }
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), { maxAge: '7d', immutable: true, etag: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.get('/api/v1/health', (req, res) => res.json({ success: true, status: 'healthy' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/contact', contactLimit);
app.use('/api/v1', (req, res, next) => {
  if (req.method === 'GET') res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
});
app.use('/api/v1', publicRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
