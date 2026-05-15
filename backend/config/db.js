// Centralized MongoDB connection setup for the ShopNest backend.
import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing from environment variables.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully.');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
