import express from 'express';
import { protectRoute } from '../middleaware/auth.middleware.js';
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  markDelivered,
  markRead,
} from '../controllers/message.controller.js';

const router = express.Router();
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/delivered/:senderId", protectRoute, markDelivered);
router.put("/read/:senderId", protectRoute, markRead);
export default router;