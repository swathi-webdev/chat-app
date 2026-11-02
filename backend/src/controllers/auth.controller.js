import mongoose from "mongoose";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import Report from "../models/report.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

const checkDB = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message:
        "Database connection failed. Please ensure MongoDB is running or check your MONGODB_URL in backend/.env",
    });
    return false;
  }
  return true;
};

export const signup = async (req, res) => {
  if (!checkDB(res)) return;
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        status: newUser.status,
        contacts: newUser.contacts,
        createdAt: newUser.createdAt,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const login = async (req, res) => {
  if (!checkDB(res)) return;
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      status: user.status,
      contacts: user.contacts,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Update last seen before logout
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() });
    }
    res.cookie("jwt", " ", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const { profilePic, fullName, status } = req.body;
    const userId = req.user._id;

    const updateData = {};

    // Handle profile picture
    if (profilePic) {
      let finalImageUrl = profilePic;
      try {
        console.log("Uploading image to Cloudinary...");
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          resource_type: "image",
          folder: "chat-app",
        });
        if (uploadResponse?.secure_url) {
          finalImageUrl = uploadResponse.secure_url;
        }
      } catch (cloudError) {
        console.warn(
          "Cloudinary upload failed (using direct image storage):",
          cloudError.message
        );
        finalImageUrl = profilePic;
      }
      updateData.profilePic = finalImageUrl;
    }

    // Handle fullName update
    if (fullName && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }

    // Handle status update
    if (status !== undefined) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to update profile" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users by name or email
export const searchUsers = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const loggedInUserId = req.user._id;
    const regex = new RegExp(q.trim(), "i");

    const users = await User.find({
      _id: { $ne: loggedInUserId },
      $or: [{ fullName: regex }, { email: regex }],
    })
      .select("-password")
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add a contact (with customName, contactNo, and username/email)
export const addContact = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const { contactId, customName, contactNo, username, email } = req.body;
    const userId = req.user._id;

    let targetUserId = contactId;

    // If contactId is not directly passed, locate user strictly by the entered username or email
    if (!targetUserId) {
      const targetIdentifier = (username || email || "").trim();
      if (!targetIdentifier) {
        return res.status(400).json({ message: "Username or email is required to find the user" });
      }

      // Search strictly by exact email or exact full name/username
      const foundUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          { email: targetIdentifier.toLowerCase() },
          { fullName: new RegExp(`^${targetIdentifier}$`, "i") },
        ],
      }).select("-password");

      if (!foundUser) {
        return res.status(404).json({
          message: `No user found with username or email "${targetIdentifier}"`,
        });
      }
      targetUserId = foundUser._id;
    }

    if (String(targetUserId) === String(userId)) {
      return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    const contactUser = await User.findById(targetUserId).select("-password");
    if (!contactUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(userId);
    const alreadyAdded = currentUser.contacts.some(
      (c) => String(c.userId) === String(targetUserId)
    );
    if (alreadyAdded) {
      return res.status(400).json({ message: "Contact already added to your list" });
    }

    await User.findByIdAndUpdate(userId, {
      $push: {
        contacts: {
          userId: targetUserId,
          customName: customName?.trim() || "",
          contactNo: contactNo?.trim() || "",
        },
      },
    });

    res.status(200).json({
      message: "Contact added successfully",
      user: {
        ...contactUser.toObject(),
        customName: customName?.trim() || "",
        contactNo: contactNo?.trim() || "",
        displayName: customName?.trim() || contactUser.fullName,
      },
    });
  } catch (error) {
    console.log("Error in addContact:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get contacts list (merged with customName/contactNo)
export const getContacts = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    const contactIds = currentUser.contacts.map((c) => c.userId);
    const contactUsers = await User.find({ _id: { $in: contactIds } }).select("-password");

    const merged = contactUsers.map((u) => {
      const saved = currentUser.contacts.find(
        (c) => String(c.userId) === String(u._id)
      );
      return {
        ...u.toObject(),
        customName: saved?.customName || "",
        contactNo: saved?.contactNo || "",
        displayName: saved?.customName?.trim() || u.fullName,
      };
    });

    res.status(200).json(merged);
  } catch (error) {
    console.log("Error in getContacts:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Block a user
export const blockUser = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    if (String(userId) === String(targetUserId)) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: targetUserId },
    });

    res.status(200).json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    console.log("Error in blockUser:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: targetUserId },
    });

    res.status(200).json({ success: true, message: "User unblocked successfully" });
  } catch (error) {
    console.log("Error in unblockUser:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mute a contact
export const muteContact = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const userId = req.user._id;
    const { contactId } = req.params;
    const { duration } = req.body; // "8h" | "1w" | "always"

    let until = null;
    const now = new Date();
    if (duration === "8h") {
      until = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    } else if (duration === "1w") {
      until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    // Remove existing mute for this contact first
    await User.findByIdAndUpdate(userId, {
      $pull: { mutedContacts: { contactId } },
    });

    // Add new mute
    await User.findByIdAndUpdate(userId, {
      $push: { mutedContacts: { contactId, until } },
    });

    res.status(200).json({ success: true, contactId, until });
  } catch (error) {
    console.log("Error in muteContact:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Unmute a contact
export const unmuteContact = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const userId = req.user._id;
    const { contactId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { mutedContacts: { contactId } },
    });

    res.status(200).json({ success: true, contactId });
  } catch (error) {
    console.log("Error in unmuteContact:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Save chat wallpaper for a specific contact
export const setChatWallpaper = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const userId = req.user._id;
    const { contactId, wallpaper } = req.body;

    let finalWallpaper = wallpaper;
    // Upload if base64 image
    if (wallpaper && wallpaper.startsWith("data:image")) {
      try {
        const uploadRes = await cloudinary.uploader.upload(wallpaper, {
          folder: "chat-app/wallpapers",
        });
        finalWallpaper = uploadRes.secure_url;
      } catch (err) {
        console.warn("Cloudinary wallpaper upload fallback:", err.message);
      }
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { chatWallpapers: { contactId } },
    });

    if (finalWallpaper) {
      await User.findByIdAndUpdate(userId, {
        $push: { chatWallpapers: { contactId, wallpaper: finalWallpaper } },
      });
    }

    res.status(200).json({ success: true, contactId, wallpaper: finalWallpaper });
  } catch (error) {
    console.log("Error in setChatWallpaper:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// File a report
export const reportUser = async (req, res) => {
  if (!checkDB(res)) return;
  try {
    const reporterId = req.user._id;
    const { reportedUserId, reason, details } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: "Reason and reported user are required" });
    }

    const report = new Report({
      reporterId,
      reportedUserId,
      reason,
      details: details || "",
    });

    await report.save();
    res.status(201).json({ success: true, message: "Report submitted successfully. Thank you." });
  } catch (error) {
    console.log("Error in reportUser:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
