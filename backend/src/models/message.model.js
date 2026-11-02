import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    // Image attachment (backwards-compatible)
    image: {
      type: String,
    },
    // Generic file attachment (documents, zip, etc.)
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileType: {
      // "image" | "pdf" | "doc" | "xls" | "ppt" | "txt" | "zip" | "other"
      type: String,
      default: "",
    },
    // Delivery status — single tick | double tick | blue double tick
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    // Reply-to reference
    replyTo: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      text: {
        type: String,
        default: "",
      },
      senderName: {
        type: String,
        default: "",
      },
    },
    // Sticker URL / identifier
    sticker: {
      type: String,
      default: "",
    },
    // Soft-delete for individual user ("Delete for Me")
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // "Delete for Everyone"
    isDeletedForEveryone: {
      type: Boolean,
      default: false,
    },
    // Cleared conversation tracking ("Clear Chat")
    clearedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
