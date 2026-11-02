import express from 'express';
import {
  login,
  logout,
  signup,
  checkAuth,
  updateProfile,
  searchUsers,
  addContact,
  getContacts,
  blockUser,
  unblockUser,
  muteContact,
  unmuteContact,
  setChatWallpaper,
  reportUser,
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleaware/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);
router.get("/search-users", protectRoute, searchUsers);
router.post("/add-contact", protectRoute, addContact);
router.get("/contacts", protectRoute, getContacts);
router.put("/block/:targetUserId", protectRoute, blockUser);
router.put("/unblock/:targetUserId", protectRoute, unblockUser);
router.post("/mute/:contactId", protectRoute, muteContact);
router.delete("/mute/:contactId", protectRoute, unmuteContact);
router.post("/wallpaper", protectRoute, setChatWallpaper);
router.post("/report", protectRoute, reportUser);

export default router;
