import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import SearchMessagesBar from "./SearchMessagesBar";
import MessageInfoModal from "./MessageInfoModal";
import ForwardModal from "./ForwardModal";
import { useEffect, useRef, useState } from "react";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import TypingIndicator from "./TypingIndicator";
import MessageTick from "./MessageTick";
import FilePreview from "./FilePreview";
import {
  Reply,
  Copy,
  Forward,
  Info,
  Trash2,
  MoreHorizontal,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
    chatWallpapers,
    inChatSearchQuery,
    setReplyingTo,
    deleteForMe,
    deleteForEveryone,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messageRefs = useRef({});

  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  const [selectedInfoMessage, setSelectedInfoMessage] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  useEffect(() => {
    if (!selectedUser) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messageEndRef.current && messages && !highlightedMessageId) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close message dropdown on outside click
  useEffect(() => {
    const handleDocClick = () => setActiveMenuMessageId(null);
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const scrollToMessage = (messageId) => {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const isTyping = typingUsers[selectedUser?._id];
  const activeWallpaper = (selectedUser && chatWallpapers[selectedUser._id]) || "";

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const wallpaperStyle = activeWallpaper
    ? activeWallpaper.startsWith("#")
      ? { backgroundColor: activeWallpaper }
      : {
          backgroundImage: `url(${activeWallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
    : {};

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <ChatHeader />
      <SearchMessagesBar onNavigateMatch={scrollToMessage} />

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 transition-all"
        style={wallpaperStyle}
      >
        {messages.map((message) => {
          const isOwn = String(message.senderId) === String(authUser._id);
          const isMenuOpen = activeMenuMessageId === message._id;
          const isHighlighted = highlightedMessageId === message._id;
          const isSearchMatch =
            inChatSearchQuery.trim() &&
            (message.text || "").toLowerCase().includes(inChatSearchQuery.toLowerCase().trim());

          return (
            <div
              key={message._id}
              ref={(el) => (messageRefs.current[message._id] = el)}
              className={`chat ${isOwn ? "chat-end" : "chat-start"} group relative ${
                isHighlighted ? "scale-[1.02] transition-transform duration-200" : ""
              }`}
              style={{ animation: "contact-item-in 0.18s ease-out both" }}
            >
              {/* Avatar */}
              <div className="chat-image avatar hidden sm:block">
                <div className="size-9 rounded-full border border-base-300">
                  <img
                    src={
                      isOwn
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="avatar"
                  />
                </div>
              </div>

              {/* Time + Ticks row */}
              <div className="chat-header mb-1 flex items-center gap-1.5 text-xs text-base-content/60">
                <time>{formatMessageTime(message.createdAt)}</time>
                {isOwn && !message.isDeletedForEveryone && (
                  <MessageTick status={message.status} />
                )}
              </div>

              {/* Bubble Container with Context Menu Button */}
              <div className="relative group/bubble flex items-center gap-1">
                {/* Bubble */}
                <div
                  className={`chat-bubble flex flex-col gap-1 p-2.5 sm:p-3 rounded-2xl ${
                    message.isDeletedForEveryone
                      ? "bg-base-200 text-base-content/50 italic border border-base-300"
                      : isOwn
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 text-base-content"
                  } ${isSearchMatch ? "ring-2 ring-warning shadow-md" : ""}`}
                >
                  {/* Deleted for everyone message */}
                  {message.isDeletedForEveryone ? (
                    <div className="flex items-center gap-1.5 py-1 text-xs sm:text-sm">
                      <Ban className="size-3.5 opacity-60" />
                      <span>This message was deleted</span>
                    </div>
                  ) : (
                    <>
                      {/* Replied-To Quote Block */}
                      {message.replyTo && (
                        <div
                          onClick={() => scrollToMessage(message.replyTo.messageId)}
                          className="mb-1.5 p-1.5 px-2.5 rounded-lg bg-black/15 border-l-4 border-current text-xs cursor-pointer select-none"
                        >
                          <span className="font-semibold block truncate">
                            {message.replyTo.senderName || "Message"}
                          </span>
                          <span className="opacity-80 block truncate">
                            {message.replyTo.text}
                          </span>
                        </div>
                      )}

                      {/* Image Attachment */}
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="max-w-[200px] sm:max-w-[260px] rounded-lg mb-1 cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(message.image, "_blank")}
                        />
                      )}

                      {/* Sticker */}
                      {message.sticker && (
                        <img
                          src={message.sticker}
                          alt="Sticker"
                          className="w-24 h-24 sm:w-28 sm:h-28 object-contain my-1 select-none drop-shadow"
                        />
                      )}

                      {/* File / Document Attachment */}
                      {message.fileUrl && !message.image && (
                        <FilePreview
                          fileUrl={message.fileUrl}
                          fileName={message.fileName}
                          fileType={message.fileType}
                        />
                      )}

                      {/* Message Text */}
                      {message.text && (
                        <p className="break-words text-sm whitespace-pre-wrap leading-relaxed">
                          {message.text}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Message Dropdown Action Button (Three dots on hover) */}
                {!message.isDeletedForEveryone && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuMessageId(isMenuOpen ? null : message._id);
                      }}
                      className="opacity-0 group-hover/bubble:opacity-100 btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content transition-opacity"
                      title="Message options"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>

                    {/* Dropdown Options */}
                    {isMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute ${
                          isOwn ? "right-0" : "left-0"
                        } top-full mt-1 w-44 bg-base-100 text-base-content rounded-xl shadow-2xl border border-base-300 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-150`}
                      >
                        {/* Reply */}
                        <button
                          onClick={() => {
                            setActiveMenuMessageId(null);
                            setReplyingTo({
                              _id: message._id,
                              text: message.text,
                              image: message.image,
                              fileUrl: message.fileUrl,
                              sticker: message.sticker,
                              senderName: isOwn ? "You" : selectedUser.displayName || selectedUser.fullName,
                              senderId: message.senderId,
                            });
                          }}
                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-base-200 transition-colors text-left"
                        >
                          <Reply className="size-3.5 text-primary" /> Reply
                        </button>

                        {/* Copy */}
                        {message.text && (
                          <button
                            onClick={() => {
                              setActiveMenuMessageId(null);
                              handleCopy(message.text);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-base-200 transition-colors text-left"
                          >
                            <Copy className="size-3.5 text-primary" /> Copy
                          </button>
                        )}

                        {/* Forward */}
                        <button
                          onClick={() => {
                            setActiveMenuMessageId(null);
                            setForwardMessage(message);
                          }}
                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-base-200 transition-colors text-left"
                        >
                          <Forward className="size-3.5 text-primary" /> Forward
                        </button>

                        {/* Message Info (Only on sent messages) */}
                        {isOwn && (
                          <button
                            onClick={() => {
                              setActiveMenuMessageId(null);
                              setSelectedInfoMessage(message);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-base-200 transition-colors text-left"
                          >
                            <Info className="size-3.5 text-primary" /> Message Info
                          </button>
                        )}

                        <div className="my-1 border-t border-base-300" />

                        {/* Delete for Me */}
                        <button
                          onClick={() => {
                            setActiveMenuMessageId(null);
                            deleteForMe(message._id);
                          }}
                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-base-200 text-error transition-colors text-left"
                        >
                          <Trash2 className="size-3.5" /> Delete for Me
                        </button>

                        {/* Delete for Everyone */}
                        {isOwn && (
                          <button
                            onClick={() => {
                              setActiveMenuMessageId(null);
                              deleteForEveryone(message._id);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-base-200 text-error transition-colors text-left font-medium"
                          >
                            <Trash2 className="size-3.5" /> Delete for Everyone
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {selectedInfoMessage && (
        <MessageInfoModal
          message={selectedInfoMessage}
          receiverUser={selectedUser}
          onClose={() => setSelectedInfoMessage(null)}
        />
      )}

      {forwardMessage && (
        <ForwardModal
          message={forwardMessage}
          onClose={() => setForwardMessage(null)}
        />
      )}
    </div>
  );
};

export default ChatContainer;
