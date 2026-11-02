import { useEffect } from "react";
import { X, User, Phone, Mail, Info, Clock, Image, FileText, ShieldAlert } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const ContactInfoModal = ({ onClose, onBlock, onReport }) => {
  const { selectedUser, sharedMedia, getSharedMedia, isSharedMediaLoading, lastSeenMap } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    if (selectedUser?._id) {
      getSharedMedia(selectedUser._id);
    }
  }, [selectedUser, getSharedMedia]);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const lastSeen = lastSeenMap[selectedUser._id] || selectedUser.lastSeen;

  const formatLastSeen = (date) => {
    if (!date) return "Offline";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  const images = sharedMedia.filter((m) => m.image);
  const docs = sharedMedia.filter((m) => m.fileUrl);

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-md modal-panel max-h-[90vh] flex flex-col overflow-hidden border border-base-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <Info className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-base-content">Contact Info</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Avatar & Display Name */}
          <div className="flex flex-col items-center text-center gap-2">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="size-24 rounded-full object-cover border-4 border-base-300 shadow-md"
            />
            <div>
              <h3 className="text-xl font-bold text-base-content">
                {selectedUser.displayName || selectedUser.fullName}
              </h3>
              <p className="text-sm text-base-content/60">
                {isOnline ? (
                  <span className="text-success font-medium">● Online</span>
                ) : (
                  <span>Last seen: {formatLastSeen(lastSeen)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-base-200/60 rounded-xl p-3 space-y-3">
            {/* Status / About */}
            <div className="flex items-start gap-3">
              <Info className="size-4 text-primary shrink-0 mt-1" />
              <div className="min-w-0">
                <span className="text-xs text-base-content/50 uppercase font-bold tracking-wider">About</span>
                <p className="text-sm text-base-content break-words">
                  {selectedUser.status || "Hey there! I am using Chatty."}
                </p>
              </div>
            </div>

            {/* Username / Registered Name */}
            <div className="flex items-start gap-3">
              <User className="size-4 text-primary shrink-0 mt-1" />
              <div className="min-w-0">
                <span className="text-xs text-base-content/50 uppercase font-bold tracking-wider">Username</span>
                <p className="text-sm font-medium text-base-content truncate">{selectedUser.fullName}</p>
              </div>
            </div>

            {/* Phone Number */}
            {selectedUser.contactNo && (
              <div className="flex items-start gap-3">
                <Phone className="size-4 text-primary shrink-0 mt-1" />
                <div className="min-w-0">
                  <span className="text-xs text-base-content/50 uppercase font-bold tracking-wider">Phone Number</span>
                  <p className="text-sm font-medium text-base-content truncate">{selectedUser.contactNo}</p>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="flex items-start gap-3">
              <Mail className="size-4 text-primary shrink-0 mt-1" />
              <div className="min-w-0">
                <span className="text-xs text-base-content/50 uppercase font-bold tracking-wider">Email</span>
                <p className="text-sm font-medium text-base-content truncate">{selectedUser.email}</p>
              </div>
            </div>
          </div>

          {/* Shared Media Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm flex items-center gap-1.5 text-base-content">
                <Image className="size-4 text-primary" /> Media, links and docs ({sharedMedia.length})
              </span>
            </div>

            {isSharedMediaLoading ? (
              <div className="text-center py-4 text-xs text-base-content/50">Loading shared media...</div>
            ) : sharedMedia.length === 0 ? (
              <div className="text-center py-4 text-xs text-base-content/40 bg-base-200/40 rounded-lg">
                No shared photos or files yet
              </div>
            ) : (
              <div className="space-y-3">
                {/* Images grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 8).map((m) => (
                      <a
                        key={m._id}
                        href={m.image}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square rounded-lg overflow-hidden border border-base-300 hover:opacity-85 transition-opacity block bg-black"
                      >
                        <img src={m.image} alt="Shared" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Documents list */}
                {docs.length > 0 && (
                  <div className="space-y-1">
                    {docs.slice(0, 4).map((m) => (
                      <a
                        key={m._id}
                        href={m.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors text-xs text-base-content"
                      >
                        <FileText className="size-4 text-primary shrink-0" />
                        <span className="truncate flex-1">{m.fileName || "Document"}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Danger zone actions */}
          <div className="pt-2 border-t border-base-300 space-y-2">
            <button
              onClick={() => {
                onClose();
                onBlock?.();
              }}
              className="w-full btn btn-ghost text-error btn-sm justify-start gap-2 hover:bg-error/10"
            >
              <ShieldAlert className="size-4" />
              {selectedUser.isBlocked ? "Unblock Contact" : "Block Contact"}
            </button>
            <button
              onClick={() => {
                onClose();
                onReport?.();
              }}
              className="w-full btn btn-ghost text-warning btn-sm justify-start gap-2 hover:bg-warning/10"
            >
              <Info className="size-4" /> Report Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoModal;

