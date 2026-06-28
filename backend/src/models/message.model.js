// import mongoose from "mongoose";
// const messageSchema=new mongoose.Schema(
//     {
//         sender:{
//             type:mongoose.Schema.Types.ObjectId,
//             ref:"User",
//             required:true,
//         },
//         receiver:{
//             type:mongoose.Schema.Types.ObjectId,        
//             ref:"User",
//             required:true,
//         },
//         message:{
//             type:String,
//             required:true,
//         },
//         text:{
//             type:String,
//         },
//         image:{
//             type:String,
//         },
//     },
//     {timestamps:true}
// );
// const Message=mongoose.model("Message",messageSchema);
// export default Message;

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
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;