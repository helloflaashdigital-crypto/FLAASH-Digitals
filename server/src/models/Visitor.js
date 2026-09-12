import mongoose from 'mongoose';
import { contentOptions } from './shared.js';

const schema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, select: false },
  company: { type: String, trim: true, maxlength: 120 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 30 },
  landingPage: { type: String, maxlength: 500 },
  lastVisitedAt: { type: Date, required: true },
  submittedAt: Date,
}, contentOptions);
schema.index({ createdAt: -1, _id: -1 });
export default mongoose.model('Visitor', schema);
