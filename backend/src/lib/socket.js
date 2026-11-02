import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[String(userId)];
}

const userSocketMap = {}; // { userId: socketId }

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;

    // ── Auto-mark all pending messages to this user as "delivered" ──────────
    try {
      const pending = await Message.find({
        receiverId: userId,
        status: "sent",
      }).distinct("senderId");

      if (pending.length > 0) {
        await Message.updateMany(
          { receiverId: userId, status: "sent" },
          { status: "delivered" }
        );
        // Notify each original sender
        pending.forEach((senderId) => {
          const senderSocketId = getReceiverSocketId(String(senderId));
          if (senderSocketId) {
            io.to(senderSocketId).emit("messagesDelivered", { to: userId });
          }
        });
      }
    } catch (err) {
      console.warn("Auto-deliver error:", err.message);
    }
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ── Typing events ────────────────────────────────────────────────────────
  socket.on("typing", ({ receiverId, isGroup }) => {
    if (isGroup) {
      socket.to(`group_${receiverId}`).emit("typing", { senderId: userId, groupId: receiverId });
    } else {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId: userId });
      }
    }
  });

  socket.on("stopTyping", ({ receiverId, isGroup }) => {
    if (isGroup) {
      socket.to(`group_${receiverId}`).emit("stopTyping", { senderId: userId, groupId: receiverId });
    } else {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
      }
    }
  });

  // ── Group room management ────────────────────────────────────────────────
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group_${groupId}`);
  });

  // ── Mark messages read (via socket shortcut) ─────────────────────────────
  socket.on("markRead", ({ senderId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { by: userId });
    }
  });

  // ── Disconnect ───────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    io.emit("userLastSeen", { userId, lastSeen: new Date() });
  });
});

export { io, app, server };