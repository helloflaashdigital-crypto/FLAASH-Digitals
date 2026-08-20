import mongoose from 'mongoose';
export async function connectDatabase() { if (!process.env.MONGODB_URI) { console.warn('MongoDB URI not configured — API is running without database persistence.'); return false; } await mongoose.connect(process.env.MONGODB_URI); console.log('MongoDB connected'); return true; }
