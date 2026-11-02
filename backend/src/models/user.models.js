import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customName: {
      type: String,
      default: "",
    },
    contactNo: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Hey there! I am using Chatty",
    },
    contacts: [contactSchema],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    mutedContacts: [
      {
        contactId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        until: {
          type: Date,
        },
      },
    ],
    chatWallpapers: [
      {
        contactId: {
          type: String,
        },
        wallpaper: {
          type: String,
        },
      },
    ],
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
