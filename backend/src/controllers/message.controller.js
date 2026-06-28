// import User from "../models/user.models.js";
// import Message from "../models/message.model.js";
// import cloudinary from "../lib/cloudinary.js";

// export const getUsersForSidebar = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id;
//     const filteredUsers = await User.find({
//       _id: { $ne: loggedInUserId },
//     }).select("-password");
//     res.status(200).json(filteredUsers);
//   } catch (error) {
//     console.error("Errors in getUsersForSidebar:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
// export const getMessages = async (req, res) => {
//   try {
//     const { id: userToChatId } = req.params;
//     const myId = req.user._id;
//     const messages = await Message.find({
//       $or: [
//         { sender: myId, receiverId: userToChatId },
//         { sender: userToChatId, receiverId: myId },
//       ],
//     });
//     res.status(200).json(messages);
//   } catch (error) {
//     console.log("Error in getMessages controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body;
//     const { id: receiverId } = req.params;
//     const senderId = req.user._id;
//     let imageUrl;
//     if (image) {
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }
//     const newMessage = new Message({
//       sender: senderId,
//       receiver: receiverId,
//       message: text,
//       image: imageUrl,
//     });
//     await newMessage.save();
//     res.status(201).json(newMessage);
// }
// //   } catch (error) {
// //     console.error("Error in sendMessage controller:", error.message);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
//
// };

import User from "../models/user.models.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
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

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = "";

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message: text,
      image: imageUrl,
    });

    await newMessage.save();
    
  // todo
  const receiverSocketId=getReceiverSocketId(receiverId);
  if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage",newMessage);
  }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("========== CLOUDINARY ERROR ==========");
    console.log(error);
    console.log("Message:", error.message);
    console.log("HTTP Code:", error.http_code);
    
    res.status(500).json({
      message: error.message,
    });
  }
};