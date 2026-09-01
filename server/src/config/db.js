import mongoose from 'mongoose';
export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn('MongoDB URI not configured — API is running without database persistence.');
    return false;
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: Number(process.env.DB_MAX_POOL_SIZE) || 20,
    minPoolSize: Number(process.env.DB_MIN_POOL_SIZE) || 2,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
  });
  console.log('MongoDB connected');
  return true;
}
