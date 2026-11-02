import User from "../models/user.models.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

/**
 * Returns only the contacts that this user has explicitly added.
 */
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const currentUser = await User.findById(loggedInUserId);
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const contactIds = currentUser.contacts.map((c) => c.userId);
    if (contactIds.length === 0) return res.status(200).json([]);

    const contactUsers = await User.find({ _id: { $in: contactIds } }).select("-password");

    const merged = contactUsers.map((u) => {
      const saved = currentUser.contacts.find(
        (c) => String(c.userId) === String(u._id)
      );
      const isMuted = currentUser.mutedContacts?.some(
        (m) => String(m.contactId) === String(u._id) && (!m.until || new Date(m.until) > new Date())
      );
      const isBlocked = currentUser.blockedUsers?.some(
        (b) => String(b) === String(u._id)
      );
      return {
        ...u.toObject(),
        customName: saved?.customName || "",
        contactNo: saved?.contactNo || "",
        displayName: saved?.customName?.trim() || u.fullName,
        isMuted: !!isMuted,
        isBlocked: !!isBlocked,
      };
    });

    res.status(200).json(merged);
  } catch (error) {
    console.log("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      clearedBy: { $ne: myId },
      deletedFor: { $ne: myId },
    }).sort({ createdAt: 1 });

    const sanitized = messages.map((m) => {
      if (m.isDeletedForEveryone) {
        return {
          ...m.toObject(),
          text: "This message was deleted",
          image: "",
          fileUrl: "",
          sticker: "",
        };
      }
      return m.toObject();
    });

    res.status(200).json(sanitized);
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** Helper — detect file category from MIME type */
function detectFileType(mimeType, fileName) {
  if (!mimeType) return "other";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document")) return "doc";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "xls";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "ppt";
  if (mimeType.startsWith("text/")) return "txt";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z")) return "zip";
  if (mimeType.startsWith("video/")) return "video";
  return "other";
}

export const sendMessage = async (req, res) => {
  try {
    const { text, image, fileData, fileName, fileMime, replyTo, sticker } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Check blocking rules
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: "User not found" });

    if (sender.blockedUsers?.some((id) => String(id) === String(receiverId))) {
      return res.status(403).json({ message: "You have blocked this user. Unblock to send messages." });
    }
    if (receiver.blockedUsers?.some((id) => String(id) === String(senderId))) {
      return res.status(403).json({ message: "You cannot message this user." });
    }

    let imageUrl = "";
    let fileUrl = "";
    let resolvedFileName = fileName || "";
    let resolvedFileType = "";

    // ── Handle image ────────────────────────────────────────────────────────
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          resource_type: "image",
        });
        imageUrl = uploadResponse.secure_url;
      } catch {
        imageUrl = image; // fallback to base64
      }
      resolvedFileType = "image";
    }

    // ── Handle generic file ─────────────────────────────────────────────────
    if (fileData && !image) {
      resolvedFileType = detectFileType(fileMime, fileName);
      try {
        const resourceType = fileMime?.startsWith("video/") ? "video" : "raw";
        const uploadResponse = await cloudinary.uploader.upload(fileData, {
          resource_type: resourceType,
          public_id: `chat-app/files/${Date.now()}_${resolvedFileName}`,
          use_filename: true,
        });
        fileUrl = uploadResponse.secure_url;
      } catch {
        fileUrl = fileData;
      }
    }

    // Receiver online?
    const receiverSocketId = getReceiverSocketId(receiverId);
    const initialStatus = receiverSocketId ? "delivered" : "sent";
    const now = new Date();

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
      fileUrl,
      fileName: resolvedFileName,
      fileType: resolvedFileType,
      sticker: sticker || "",
      replyTo: replyTo || null,
      status: initialStatus,
      deliveredAt: initialStatus === "delivered" ? now : null,
    });

    await newMessage.save();

    // Emit to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Notify sender of delivery status immediately if receiver is online
    if (initialStatus === "delivered") {
      const senderSocketId = getReceiverSocketId(String(senderId));
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: newMessage._id,
          status: "delivered",
          deliveredAt: now,
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: error.message || "Failed to send message" });
  }
};

/** Mark all messages from `senderId` to logged-in user as delivered */
export const markDelivered = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const { senderId } = req.params;
    const now = new Date();

    await Message.updateMany(
      { senderId, receiverId, status: "sent" },
      { status: "delivered", deliveredAt: now }
    );

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesDelivered", { to: receiverId, deliveredAt: now });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.log("Error in markDelivered:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** Mark all messages from `senderId` to logged-in user as read */
export const markRead = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const { senderId } = req.params;
    const now = new Date();

    await Message.updateMany(
      { senderId, receiverId, status: { $in: ["sent", "delivered"] } },
      { status: "read", readAt: now }
    );

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { by: receiverId, readAt: now });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.log("Error in markRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** Delete message for current user only ("Delete for Me") */
export const deleteForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user._id;

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: myId },
    });

    res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.log("Error in deleteForMe:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** Delete message for everyone */
export const deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (String(message.senderId) !== String(myId)) {
      return res.status(403).json({ message: "You can only delete your own messages for everyone" });
    }

    message.isDeletedForEveryone = true;
    message.text = "This message was deleted";
    message.image = "";
    message.fileUrl = "";
    message.sticker = "";
    await message.save();

    // Broadcast to both participants
    const receiverSocketId = getReceiverSocketId(String(message.receiverId));
    const senderSocketId = getReceiverSocketId(String(message.senderId));
    if (receiverSocketId) io.to(receiverSocketId).emit("messageDeletedForEveryone", { messageId });
    if (senderSocketId) io.to(senderSocketId).emit("messageDeletedForEveryone", { messageId });

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.log("Error in deleteForEveryone:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** Clear chat history for the current user */
export const clearChat = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      {
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      },
      {
        $addToSet: { clearedBy: myId },
      }
    );

    res.status(200).json({ success: true, message: "Chat cleared successfully" });
  } catch (error) {
    console.log("Error in clearChat:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** Shared media (images and documents) for Contact Info modal */
export const getSharedMedia = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const mediaMessages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      clearedBy: { $ne: myId },
      deletedFor: { $ne: myId },
      isDeletedForEveryone: false,
      $or: [
        { image: { $exists: true, $ne: "" } },
        { fileUrl: { $exists: true, $ne: "" } },
      ],
    })
      .select("image fileUrl fileName fileType createdAt senderId")
      .sort({ createdAt: -1 });

    res.status(200).json(mediaMessages);
  } catch (error) {
    console.log("Error in getSharedMedia:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
