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
export default router;
