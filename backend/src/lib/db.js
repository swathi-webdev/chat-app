import mongoose from "mongoose";

const DEFAULT_MONGODB_URI =
  "mongodb+srv://swathisuresh076_db_user:ihgRKcUUjifa2hl8@cluster0.xmuluvh.mongodb.net/chat_db?appName=Cluster0";

export const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URL || process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
  }
};
