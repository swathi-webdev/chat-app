import express from 'express';
import { protectRoute } from '../middleaware/auth.middleware.js';
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  markDelivered,
  markRead,
  deleteForMe,
  deleteForEveryone,
  clearChat,
  getSharedMedia,
} from '../controllers/message.controller.js';

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/delivered/:senderId", protectRoute, markDelivered);
router.put("/read/:senderId", protectRoute, markRead);
router.delete("/delete-for-me/:messageId", protectRoute, deleteForMe);
router.delete("/delete-for-everyone/:messageId", protectRoute, deleteForEveryone);
router.delete("/clear/:id", protectRoute, clearChat);
router.get("/media/:id", protectRoute, getSharedMedia);

export default router;
