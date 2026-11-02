import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";

import { connectDB } from './lib/db.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { app, server } from './lib/socket.js';
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

// ── Production static frontend serving ──
const candidatePaths = [
  path.join(__dirname, "../../frontend/dist"),
  path.join(process.cwd(), "frontend/dist"),
  path.join(process.cwd(), "../frontend/dist"),
  path.join(process.cwd(), "dist"),
];

const distPath = candidatePaths.find(
  (p) => fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))
);

if (process.env.NODE_ENV === "production" || distPath) {
  if (distPath) {
    app.use(express.static(distPath));
    app.get("/{*splat}", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    app.get("/{*splat}", (req, res) => {
      res.status(200).send("Chatty Backend is running. Frontend build not found.");
    });
  }
}

connectDB();
server.listen(PORT, () => {
  console.log('server is running on port:' + PORT);
});
