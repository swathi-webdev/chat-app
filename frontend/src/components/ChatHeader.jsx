import { useState, useRef, useEffect } from "react";
import {
  X,
  MoreVertical,
  ArrowLeft,
  Info,
  Search,
  Palette,
  Image,
  BellOff,
  Volume2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Flag,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

import ContactInfoModal from "./ContactInfoModal";
import ChatWallpaperModal from "./ChatWallpaperModal";
import MuteModal from "./MuteModal";
import ClearChatModal from "./ClearChatModal";
import BlockModal from "./BlockModal";
import ReportModal from "./ReportModal";
import ThemeQuickModal from "./ThemeQuickModal";

const ChatHeader = () => {
  const {
    selectedUser,
    setSelectedUser,
    typingUsers,
    lastSeenMap,
    setIsSearchInChatOpen,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "info" | "wallpaper" | "mute" | "clear" | "block" | "report" | "theme"
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id];
  const isBlocked = selectedUser.isBlocked;
  const isMuted = selectedUser.isMuted;

  const formatLastSeen = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  const lastSeen = lastSeenMap[selectedUser._id] || selectedUser.lastSeen;

  return (
    <>
      <div className="p-2.5 border-b border-base-300 bg-base-100/90 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Back Arrow (<768px) */}
            <button
              onClick={() => setSelectedUser(null)}
              className="btn btn-ghost btn-xs btn-circle md:hidden"
              title="Back to contacts"
            >
              <ArrowLeft className="size-5" />
            </button>

            {/* Avatar & click to open Contact Info */}
            <div
              onClick={() => setActiveModal("info")}
              className="avatar cursor-pointer"
              title="View contact info"
            >
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>

            {/* User Info */}
            <div
              onClick={() => setActiveModal("info")}
              className="cursor-pointer min-w-0"
              title="View contact info"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="font-medium text-base-content truncate text-sm sm:text-base">
                  {selectedUser.displayName || selectedUser.fullName}
                </h3>
                {isMuted && (
                  <BellOff className="size-3 text-base-content/40 shrink-0" title="Muted" />
                )}
                {isBlocked && (
                  <span className="badge badge-error badge-xs">Blocked</span>
                )}
              </div>
              <p className="text-xs text-base-content/60 truncate">
                {selectedUser.contactNo || selectedUser.email}
              </p>
              <p className="text-xs text-base-content/70 truncate">
                {isTyping ? (
                  <span className="text-primary font-medium animate-pulse">typing...</span>
                ) : isOnline ? (
                  <span className="text-success font-medium">Online</span>
                ) : lastSeen ? (
                  <span>Last seen {formatLastSeen(lastSeen)}</span>
                ) : (
                  "Offline"
                )}
              </p>
            </div>
          </div>

          {/* Right Action Icons: Three-Dot Menu & Close Button */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Vertical Three-Dot Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`btn btn-ghost btn-sm btn-circle text-base-content ${menuOpen ? "bg-base-300" : ""}`}
                title="More options"
              >
                <MoreVertical className="size-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-base-100 rounded-xl shadow-2xl border border-base-300 py-1.5 z-50 text-base-content text-sm animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal("info");
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-base-200 transition-colors text-left"
                  >
                    <Info className="size-4 text-primary" /> Contact Info
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setIsSearchInChatOpen(true);
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-base-200 transition-colors text-left"
                  >
                    <Search className="size-4 text-primary" /> Search Messages
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal("theme");
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-base-200 transition-colors text-left"
                  >
                    <Palette className="size-4 text-primary" /> Change Theme
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal("wallpaper");
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-base-200 transition-colors text-left"
                  >
                    <Image className="size-4 text-primary" /> Chat Wallpaper
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal("mute");
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-base-200 transition-colors text-left"
                  >
                    {isMuted ? (
                      <>
                        <Volume2 className="size-4 text-primary" /> Unmute Notifications
                      </>
                    ) : (
                      <>
                        <BellOff className="size-4 text-primary" /> Mute Notifications
                      </>
                    )}
                  </button>

                  <div className="my-1 border-t border-base-300" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal("clear");
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-base-200 text-error transition-colors text-left"
                  >
                    <Trash2 className="size-4" /> Clear Chat
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal("block");
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-base-200 text-error transition-colors text-left"
                  >
                    {isBlocked ? (
                      <>
                        <ShieldCheck className="size-4 text-success" /> Unblock Contact
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="size-4" /> Block Contact
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal("report");
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-base-200 text-warning transition-colors text-left"
                  >
                    <Flag className="size-4" /> Report Contact
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="btn btn-ghost btn-sm btn-circle text-base-content"
              title="Close chat"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Modals ───────────────────────────────────────────────────────── */}
      {activeModal === "info" && (
        <ContactInfoModal
          onClose={() => setActiveModal(null)}
          onBlock={() => setActiveModal("block")}
          onReport={() => setActiveModal("report")}
        />
      )}
      {activeModal === "wallpaper" && (
        <ChatWallpaperModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "mute" && (
        <MuteModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "clear" && (
        <ClearChatModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "block" && (
        <BlockModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "report" && (
        <ReportModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "theme" && (
        <ThemeQuickModal onClose={() => setActiveModal(null)} />
      )}
    </>
  );
};

export default ChatHeader;
