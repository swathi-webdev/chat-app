import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import { X, Image, Send, Users, ArrowLeft, Smile, Sparkles } from "lucide-react";
import { formatMessageTime } from "../lib/utils";
import TypingIndicator from "./TypingIndicator";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import EmojiPicker from "./EmojiPicker";
import StickerPicker from "./StickerPicker";
import GroupInfoModal from "./GroupInfoModal";
import toast from "react-hot-toast";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    setSelectedGroup,
    groupMessages,
    getGroupMessages,
    sendGroupMessage,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    isGroupMessagesLoading,
  } = useGroupStore();

  const { authUser, socket } = useAuthStore();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!selectedGroup) return;
    getGroupMessages(selectedGroup._id);
    subscribeToGroupMessages();
    return () => unsubscribeFromGroupMessages();
  }, [selectedGroup, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current && groupMessages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !selectedGroup) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { receiverId: selectedGroup._id, isGroup: true });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTyping", { receiverId: selectedGroup._id, isGroup: true });
    }, 1500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    await sendGroupMessage(selectedGroup._id, { text: text.trim(), image: imagePreview });
    setText("");
    setImagePreview(null);
    setShowEmojiPicker(false);
    setShowStickerPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (socket && isTyping) {
      socket.emit("stopTyping", { receiverId: selectedGroup._id, isGroup: true });
      setIsTyping(false);
    }
  };

  const handleSelectSticker = async (stickerUrl, captionText = "") => {
    if (!selectedGroup) return;
    setShowStickerPicker(false);
    await sendGroupMessage(selectedGroup._id, { sticker: stickerUrl, text: captionText || "" });
  };

  const memberCount = selectedGroup?.members?.length || 0;

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-2.5 border-b border-base-300 bg-base-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedGroup(null)} className="btn btn-ghost btn-xs btn-circle md:hidden">
              <ArrowLeft className="size-5" />
            </button>
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src={selectedGroup?.groupPic || "/avatar.png"} alt={selectedGroup?.name} />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-base-content">{selectedGroup?.name}</h3>
              <p className="text-xs text-base-content/60">{memberCount} members</p>
            </div>
          </div>
          <button onClick={() => setSelectedGroup(null)} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-5" />
          </button>
        </div>
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Group Header */}
      <div className="p-2.5 border-b border-base-300 bg-base-100/90 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Back Arrow */}
            <button
              onClick={() => setSelectedGroup(null)}
              className="btn btn-ghost btn-xs btn-circle md:hidden"
              title="Back"
            >
              <ArrowLeft className="size-5" />
            </button>

            <div
              onClick={() => setShowGroupInfo(true)}
              className="avatar cursor-pointer"
              title="View group info"
            >
              <div className="size-10 rounded-full relative">
                <img src={selectedGroup?.groupPic || "/avatar.png"} alt={selectedGroup?.name} />
              </div>
            </div>

            <div
              onClick={() => setShowGroupInfo(true)}
              className="cursor-pointer min-w-0"
              title="View group info"
            >
              <h3 className="font-medium text-base-content truncate flex items-center gap-1.5 text-sm sm:text-base">
                <Users className="size-4 text-primary shrink-0" />
                {selectedGroup?.name}
              </h3>
              <p className="text-xs text-base-content/60 truncate">{memberCount} members</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedGroup(null)}
            className="btn btn-ghost btn-sm btn-circle text-base-content"
            title="Close group"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
        {groupMessages.map((message) => {
          const isOwn = String(message.senderId?._id || message.senderId) === String(authUser._id);
          const sender = message.senderId;

          return (
            <div
              key={message._id}
              className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
              style={{ animation: "contact-item-in 0.18s ease-out both" }}
            >
              <div className="chat-image avatar hidden sm:block">
                <div className="size-9 rounded-full border border-base-300">
                  <img
                    src={isOwn ? authUser.profilePic || "/avatar.png" : sender?.profilePic || "/avatar.png"}
                    alt="avatar"
                  />
                </div>
              </div>

              <div className="chat-header mb-1 text-xs text-base-content/60 flex items-center gap-1">
                {!isOwn && (
                  <span className="font-semibold text-primary mr-1">
                    {sender?.fullName || "Member"}
                  </span>
                )}
                <time>{formatMessageTime(message.createdAt)}</time>
              </div>

              <div
                className={`chat-bubble flex flex-col p-2.5 sm:p-3 rounded-2xl ${
                  isOwn ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"
                }`}
              >
                {message.sticker && (
                  <img
                    src={message.sticker}
                    alt="Sticker"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain my-1 select-none drop-shadow"
                  />
                )}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="max-w-[200px] sm:max-w-[260px] rounded-lg mb-1.5 cursor-pointer hover:opacity-95"
                    onClick={() => window.open(message.image, "_blank")}
                  />
                )}
                {message.text && (
                  <p className="break-words text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-2.5 sm:p-4 w-full relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker
            onSelectEmoji={(em) => setText((p) => p + em)}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        {/* Sticker Picker */}
        {showStickerPicker && (
          <StickerPicker
            onSelectSticker={handleSelectSticker}
            onClose={() => setShowStickerPicker(false)}
          />
        )}

        {imagePreview && (
          <div className="mb-3 flex items-center gap-2 p-2 bg-base-200 rounded-xl border border-base-300">
            <img src={imagePreview} alt="preview" className="size-16 object-cover rounded-lg" />
            <button
              onClick={() => {
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="ml-auto w-6 h-6 rounded-full bg-error text-error-content flex items-center justify-center"
              type="button"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-1.5 sm:gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className="btn btn-circle btn-sm btn-ghost text-base-content/60 hover:text-base-content"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowStickerPicker(false);
            }}
          >
            <Smile size={19} />
          </button>

          <button
            type="button"
            className={`btn btn-circle btn-sm btn-ghost ${
              showStickerPicker ? "text-primary bg-base-300" : "text-base-content/60 hover:text-base-content"
            }`}
            onClick={() => {
              setShowStickerPicker(!showStickerPicker);
              setShowEmojiPicker(false);
            }}
            title="Stickers"
          >
            <Sparkles size={18} />
          </button>

          <button
            type="button"
            className={`btn btn-circle btn-sm btn-ghost ${
              imagePreview ? "text-emerald-500" : "text-base-content/60 hover:text-base-content"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md text-base-content bg-base-100 placeholder:text-base-content/40 focus:outline-none focus:border-primary text-sm"
              placeholder="Type a group message..."
              value={text}
              onChange={handleTyping}
            />
          </div>

          <button
            type="submit"
            className="btn btn-sm sm:btn-md btn-circle btn-primary shrink-0"
            disabled={(!text.trim() && !imagePreview)}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Group Info Modal */}
      {showGroupInfo && (
        <GroupInfoModal group={selectedGroup} onClose={() => setShowGroupInfo(false)} />
      )}
    </div>
  );
};

export default GroupChatContainer;
