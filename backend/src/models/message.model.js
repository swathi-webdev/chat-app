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
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
