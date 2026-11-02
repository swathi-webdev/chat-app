import { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  Image,
  Send,
  X,
  FileText,
  Film,
  Archive,
  File,
  Smile,
  Sparkles,
  Reply,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import EmojiPicker from "./EmojiPicker";
import StickerPicker from "./StickerPicker";

function getFileInfo(file) {
  if (!file) return {};
  const t = file.type;
  if (t.startsWith("image/")) return { icon: Image, label: file.name, color: "text-emerald-400" };
  if (t === "application/pdf") return { icon: FileText, label: file.name, color: "text-red-400" };
  if (t.includes("word")) return { icon: FileText, label: file.name, color: "text-blue-400" };
  if (t.includes("excel") || t.includes("spreadsheet"))
    return { icon: FileText, label: file.name, color: "text-green-400" };
  if (t.includes("powerpoint") || t.includes("presentation"))
    return { icon: FileText, label: file.name, color: "text-orange-400" };
  if (t.startsWith("video/")) return { icon: Film, label: file.name, color: "text-purple-400" };
  if (t.includes("zip") || t.includes("rar"))
    return { icon: Archive, label: file.name, color: "text-yellow-400" };
  return { icon: File, label: file.name, color: "text-zinc-400" };
}

const ACCEPTED = [
  "image/*",
  "video/*",
  "application/pdf",
  ".doc,.docx",
  ".xls,.xlsx",
  ".ppt,.pptx",
  ".txt",
  ".zip,.rar,.7z",
].join(",");

const MessageInput = () => {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pickerContainerRef = useRef(null);

  const { sendMessage, selectedUser, replyingTo, setReplyingTo, unblockUser } = useChatStore();
  const { socket } = useAuthStore();

  // Close emoji & sticker pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerContainerRef.current && !pickerContainerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
        setShowStickerPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !selectedUser) return;
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { receiverId: selectedUser._id, isGroup: false });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTyping", { receiverId: selectedUser._id, isGroup: false });
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
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setSelectedFile(file);
      setFilePreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File must be less than 25 MB");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setSelectedFile(file);
        setFilePreview(null);
      };
      reader.readAsDataURL(file);
      return;
    }

    const info = getFileInfo(file);
    setFilePreview(info);
    setSelectedFile(file);
    setImagePreview(null);
  };

  const clearAttachment = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFilePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    textInputRef.current?.focus();
  };

  const handleSelectSticker = async (stickerUrl, captionText = "") => {
    setShowStickerPicker(false);
    setIsSending(true);
    try {
      await sendMessage({ sticker: stickerUrl, text: captionText || "" });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;
    setIsSending(true);

    try {
      let payload = { text: text.trim() };

      if (selectedFile) {
        const reader = new FileReader();
        const dataUrl = await new Promise((res) => {
          reader.onloadend = () => res(reader.result);
          reader.readAsDataURL(selectedFile);
        });

        if (selectedFile.type.startsWith("image/")) {
          payload.image = dataUrl;
        } else {
          payload.fileData = dataUrl;
          payload.fileName = selectedFile.name;
          payload.fileMime = selectedFile.type;
        }
      }

      await sendMessage(payload);

      setText("");
      clearAttachment();
      setShowEmojiPicker(false);
      setShowStickerPicker(false);
      if (socket && selectedUser && isTyping) {
        socket.emit("stopTyping", { receiverId: selectedUser._id, isGroup: false });
        setIsTyping(false);
      }
    } catch (err) {
      console.error("Failed to send:", err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // If user is blocked, render blocked notice
  if (selectedUser?.isBlocked) {
    return (
      <div className="p-4 w-full bg-base-100 border-t border-base-300">
        <div className="flex items-center justify-between p-3 bg-base-200 rounded-xl">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
            <ShieldAlert className="size-4 text-error shrink-0" />
            <span>You have blocked this contact. Unblock to send messages.</span>
          </div>
          <button
            onClick={() => unblockUser(selectedUser._id)}
            className="btn btn-error btn-xs"
          >
            Unblock
          </button>
        </div>
      </div>
    );
  }

  const hasAttachment = !!selectedFile;

  return (
    <div className="p-2.5 sm:p-4 w-full relative" ref={pickerContainerRef}>
      {/* ── Reply Preview Bar ─────────────────────────────────────────────── */}
      {replyingTo && (
        <div
          className="mb-2 p-2 px-3 bg-base-200/90 rounded-xl border-l-4 border-primary flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-150"
        >
          <div className="min-w-0 pr-2">
            <span className="font-semibold text-primary flex items-center gap-1">
              <Reply className="size-3" /> Replying to {replyingTo.senderName || "message"}
            </span>
            <p className="text-base-content/70 truncate text-xs mt-0.5">
              {replyingTo.text || (replyingTo.image ? "📷 Photo" : replyingTo.fileUrl ? "📎 Attachment" : replyingTo.sticker ? "🎨 Sticker" : "Message")}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="btn btn-ghost btn-xs btn-circle shrink-0"
            title="Cancel reply"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ── Attachment Preview Bar ────────────────────────────────────────── */}
      {hasAttachment && (
        <div
          className="mb-3 flex items-start gap-3 p-2 bg-base-200 rounded-xl border border-base-300"
          style={{ animation: "modal-slide-up 0.2s ease-out both" }}
        >
          {imagePreview && (
            <div className="relative shrink-0">
              <img
                src={imagePreview}
                alt="preview"
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-base-300"
              />
            </div>
          )}

          {filePreview && !imagePreview && (
            <div className="flex items-center gap-2 py-1">
              <filePreview.icon size={28} className={filePreview.color} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate max-w-[180px]">
                  {filePreview.label}
                </p>
                <p className="text-[11px] text-base-content/50">Ready to send</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={clearAttachment}
            className="ml-auto shrink-0 w-6 h-6 rounded-full bg-error text-error-content flex items-center justify-center hover:scale-110 transition-transform shadow"
            title="Remove attachment"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ── Emoji Picker Popover ─────────────────────────────────────────── */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* ── Sticker Picker Popover ───────────────────────────────────────── */}
      {showStickerPicker && (
        <StickerPicker
          onSelectSticker={handleSelectSticker}
          onClose={() => setShowStickerPicker(false)}
        />
      )}

      {/* ── Input row ──────────────────────────────────────────────────────── */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
        {/* Hidden inputs */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={imageInputRef}
          onChange={handleImageChange}
        />
        <input
          type="file"
          accept={ACCEPTED}
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* Emoji Button */}
        <button
          type="button"
          title="Emoji"
          className={`btn btn-circle btn-sm btn-ghost ${
            showEmojiPicker ? "text-primary bg-base-300" : "text-base-content/60 hover:text-base-content"
          }`}
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowStickerPicker(false);
          }}
        >
          <Smile size={19} />
        </button>

        {/* Sticker Button */}
        <button
          type="button"
          title="Stickers"
          className={`btn btn-circle btn-sm btn-ghost ${
            showStickerPicker ? "text-primary bg-base-300" : "text-base-content/60 hover:text-base-content"
          }`}
          onClick={() => {
            setShowStickerPicker(!showStickerPicker);
            setShowEmojiPicker(false);
          }}
        >
          <Sparkles size={18} />
        </button>

        {/* Image attach button */}
        <button
          type="button"
          title="Attach image"
          className={`btn btn-circle btn-sm btn-ghost ${
            imagePreview ? "text-emerald-500" : "text-base-content/60 hover:text-base-content"
          }`}
          onClick={() => imageInputRef.current?.click()}
        >
          <Image size={18} />
        </button>

        {/* File attach button */}
        <button
          type="button"
          title="Attach document/file"
          className={`btn btn-circle btn-sm btn-ghost ${
            filePreview ? "text-primary" : "text-base-content/60 hover:text-base-content"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={18} />
        </button>

        {/* Text input */}
        <div className="flex-1 min-w-0">
          <input
            ref={textInputRef}
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md text-base-content bg-base-100 placeholder:text-base-content/40 focus:outline-none focus:border-primary text-sm"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          className="btn btn-sm sm:btn-md btn-circle btn-primary shrink-0"
          disabled={(!text.trim() && !hasAttachment) || isSending}
        >
          {isSending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
