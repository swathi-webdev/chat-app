import mongoose from "mongoose";
import fs from "fs";
import path from "path";

let mongodInstance = null;

export const connectDB = async () => {
  if (process.env.MONGODB_URL) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URL, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`External MongoDB connection failed (${error.message}). Starting local database server...`);
    }
  }

  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const dbDir = path.resolve(process.cwd(), "../data/local_db");
    fs.mkdirSync(dbDir, { recursive: true });

    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbPath: dbDir,
        storageEngine: "wiredTiger",
      },
      binary: { version: "6.0.16" },
    });

    const localUri = mongodInstance.getUri() + "chat_db";
    const conn = await mongoose.connect(localUri);
    console.log(`Local MongoDB connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
};