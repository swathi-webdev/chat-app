import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, members, groupPic } = req.body;
    const adminId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (!members || members.length === 0) {
      return res
        .status(400)
        .json({ message: "Select at least one member for the group" });
    }

    // Ensure admin is always in the group
    const allMembers = [...new Set([String(adminId), ...members])];

    let groupPicUrl = "";
    if (groupPic) {
      try {
        const uploadRes = await cloudinary.uploader.upload(groupPic, {
          resource_type: "image",
          folder: "chat-app/groups",
        });
        groupPicUrl = uploadRes.secure_url;
      } catch (err) {
        console.warn("Cloudinary group pic upload failed:", err.message);
        groupPicUrl = groupPic;
      }
    }

    const newGroup = new Group({
      name: name.trim(),
      admin: adminId,
      members: allMembers,
      groupPic: groupPicUrl,
    });

    await newGroup.save();

    const populatedGroup = await Group.findById(newGroup._id).populate(
      "members",
      "-password"
    );

    // Notify all members via socket
    allMembers.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) {
        io.to(socketId).emit("newGroup", populatedGroup);
      }
    });

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.log("Error in createGroup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get groups the user belongs to
export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("members", "-password")
      .sort({ lastMessageAt: -1 });
    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getGroups:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => String(m) === String(userId)
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName profilePic email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send a message to a group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image, sticker } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => String(m) === String(senderId)
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    let imageUrl = "";
    if (image) {
      try {
        const uploadRes = await cloudinary.uploader.upload(image);
        imageUrl = uploadRes.secure_url;
      } catch (err) {
        console.warn("Cloudinary upload failed:", err.message);
        imageUrl = image;
      }
    }

    const newMessage = new GroupMessage({
      groupId,
      senderId,
      text: text || "",
      image: imageUrl,
      sticker: sticker || "",
      readBy: [senderId],
    });

    await newMessage.save();

    // Update group's lastMessage
    await Group.findByIdAndUpdate(groupId, {
      lastMessage: text || (sticker ? "🎨 Sticker" : "📷 Image"),
      lastMessageAt: new Date(),
    });

    const populatedMessage = await GroupMessage.findById(newMessage._id).populate(
      "senderId",
      "fullName profilePic email"
    );

    // Emit to all group members
    group.members.forEach((memberId) => {
      const socketId = getReceiverSocketId(String(memberId));
      if (socketId) {
        io.to(socketId).emit("newGroupMessage", {
          message: populatedMessage,
          groupId,
        });
      }
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

