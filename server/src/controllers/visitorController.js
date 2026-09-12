import { validationResult } from 'express-validator';
import Visitor from '../models/Visitor.js';
import AppError from '../utils/AppError.js';

export async function recordVisitor(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 422);
  const submitting = req.path === '/visitors';
  if (req.body.website) return res.status(201).json({ success: true });
  const now = new Date();
  const changes = { lastVisitedAt: now };
  if (submitting) Object.assign(changes, {
    company: req.body.company.trim(), email: req.body.email.trim().toLowerCase(),
    phone: req.body.phone.trim(), submittedAt: now,
  });
  const filter = { sessionId: req.body.sessionId };
  const update = { $set: changes, $setOnInsert: { landingPage: req.body.landingPage || '/' } };
  try {
    await Visitor.updateOne(filter, update, { upsert: true, runValidators: true });
  } catch (error) {
    // Concurrent initial visit and form submission share one session record.
    if (error.code !== 11000) throw error;
    await Visitor.updateOne(filter, update, { runValidators: true });
  }
  res.status(201).json({ success: true, message: submitting ? 'Thank you! Our team will be in touch.' : 'Visit recorded' });
}

export async function listVisitors(req, res) {
  const positiveInteger = (value, fallback) => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : fallback;
  const page = Math.min(positiveInteger(req.query.page, 1), 1000000);
  const limit = Math.min(positiveInteger(req.query.limit, 25), 100);
  const query = req.query.status === 'submitted' ? { submittedAt: { $exists: true } }
    : req.query.status === 'anonymous' ? { submittedAt: { $exists: false } } : {};
  const [items, total] = await Promise.all([
    Visitor.find(query).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
    Visitor.countDocuments(query),
  ]);
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } });
}
