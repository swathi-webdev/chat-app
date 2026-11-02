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
      return {
        ...u.toObject(),
        customName: saved?.customName || "",
        contactNo: saved?.contactNo || "",
        displayName: saved?.customName?.trim() || u.fullName,
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
    });

    res.status(200).json(messages);
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
    const { text, image, fileData, fileName, fileMime } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

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

    // ── Handle generic file (document, video, zip, etc.) ───────────────────
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
        // Fallback: store base64 directly (works for small files)
        fileUrl = fileData;
      }
    }

    // Receiver online?
    const receiverSocketId = getReceiverSocketId(receiverId);
    const initialStatus = receiverSocketId ? "delivered" : "sent";

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      fileUrl,
      fileName: resolvedFileName,
      fileType: resolvedFileType,
      status: initialStatus,
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

    await Message.updateMany(
      { senderId, receiverId, status: "sent" },
      { status: "delivered" }
    );

    // Notify the original sender about delivery
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesDelivered", { to: receiverId });
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

    await Message.updateMany(
      { senderId, receiverId, status: { $in: ["sent", "delivered"] } },
      { status: "read" }
    );

    // Notify the original sender about read
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { by: receiverId });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.log("Error in markRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
