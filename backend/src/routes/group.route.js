import express from 'express';
import { protectRoute } from '../middleaware/auth.middleware.js';
import {
  createGroup,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
} from '../controllers/group.controller.js';

const router = express.Router();
router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/send", protectRoute, sendGroupMessage);
export default router;

