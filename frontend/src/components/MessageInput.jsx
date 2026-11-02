import { useChatStore } from "../store/useChatStore";
import { useState, useRef } from "react";
import {
  Paperclip, Image, Send, X, FileText, Film, Archive, File,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

/** Map mime-type to a label + icon for the attachment preview bar */
function getFileInfo(file) {
  if (!file) return {};
  const t = file.type;
  if (t.startsWith("image/"))           return { icon: Image,     label: file.name, color: "text-emerald-400" };
  if (t === "application/pdf")          return { icon: FileText,  label: file.name, color: "text-red-400" };
  if (t.includes("word"))               return { icon: FileText,  label: file.name, color: "text-blue-400" };
  if (t.includes("excel") || t.includes("spreadsheet"))
                                        return { icon: FileText,  label: file.name, color: "text-green-400" };
  if (t.includes("powerpoint") || t.includes("presentation"))
                                        return { icon: FileText,  label: file.name, color: "text-orange-400" };
  if (t.startsWith("video/"))           return { icon: Film,      label: file.name, color: "text-purple-400" };
  if (t.includes("zip") || t.includes("rar"))
                                        return { icon: Archive,   label: file.name, color: "text-yellow-400" };
  return                                       { icon: File,      label: file.name, color: "text-zinc-400" };
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
  const [selectedFile, setSelectedFile] = useState(null);   // File object
  const [imagePreview, setImagePreview] = useState(null);   // data-URL for images
  const [filePreview, setFilePreview] = useState(null);     // { icon, label, color } for docs
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const imageInputRef = useRef(null);   // images-only input
  const fileInputRef  = useRef(null);   // any-file input
  const typingTimeoutRef = useRef(null);

  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  // ── Typing emit ──────────────────────────────────────────────────────────
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

  // ── Image picker ─────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result); setSelectedFile(file); setFilePreview(null); };
    reader.readAsDataURL(file);
  };

  // ── Generic file picker ───────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { toast.error("File must be less than 25 MB"); return; }

    if (file.type.startsWith("image/")) {
      // Treat as image
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); setSelectedFile(file); setFilePreview(null); };
      reader.readAsDataURL(file);
      return;
    }

    const info = getFileInfo(file);
    setFilePreview(info);
    setSelectedFile(file);
    setImagePreview(null);
  };

  // ── Clear attachment ──────────────────────────────────────────────────────
  const clearAttachment = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFilePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (fileInputRef.current)  fileInputRef.current.value  = "";
  };

  // ── Send ──────────────────────────────────────────────────────────────────
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

  const hasAttachment = !!selectedFile;

  return (
    <div className="p-4 w-full">

      {/* ── Attachment preview bar ─────────────────────────────────────────── */}
      {hasAttachment && (
        <div
          className="mb-3 flex items-start gap-3 p-2 bg-base-200 rounded-xl border border-base-300"
          style={{ animation: "modal-slide-up 0.2s ease-out both" }}
        >
          {/* Image preview */}
          {imagePreview && (
            <div className="relative shrink-0">
              <img
                src={imagePreview}
                alt="preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
            </div>
          )}

          {/* Document preview */}
          {filePreview && !imagePreview && (
            <div className="flex items-center gap-2 py-1">
              <filePreview.icon size={32} className={filePreview.color} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate max-w-[200px]">{filePreview.label}</p>
                <p className="text-xs text-base-content/50">Ready to send</p>
              </div>
            </div>
          )}

          {/* ✕ Remove button — fixed absolute positioning */}
          <button
            type="button"
            onClick={clearAttachment}
            className="ml-auto shrink-0 w-7 h-7 rounded-full bg-error text-error-content flex items-center justify-center hover:scale-110 transition-transform shadow"
            title="Remove attachment"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ── Input row ──────────────────────────────────────────────────────── */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">

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

        {/* Image attach button */}
        <button
          type="button"
          title="Attach image"
          className={`btn btn-circle btn-sm hidden sm:flex ${
            imagePreview ? "text-emerald-500 btn-ghost" : "btn-ghost text-zinc-400"
          }`}
          onClick={() => imageInputRef.current?.click()}
        >
          <Image size={18} />
        </button>

        {/* File attach button (docs, video, zip…) */}
        <button
          type="button"
          title="Attach file"
          className={`btn btn-circle btn-sm hidden sm:flex ${
            filePreview ? "text-primary btn-ghost" : "btn-ghost text-zinc-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={18} />
        </button>

        {/* Text input */}
        <div className="flex-1">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={(!text.trim() && !hasAttachment) || isSending}
        >
          {isSending
            ? <span className="loading loading-spinner loading-xs" />
            : <Send size={20} />
          }
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
