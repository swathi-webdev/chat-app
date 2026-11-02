import { X, Check, CheckCheck, Clock, Info } from "lucide-react";

const MessageInfoModal = ({ message, receiverUser, onClose }) => {
  if (!message) return null;

  const formatDateTime = (date) => {
    if (!date) return "Not yet";
    const d = new Date(date);
    return `${d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  };

  const isDelivered = message.status === "delivered" || message.status === "read";
  const isRead = message.status === "read";

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-sm modal-panel overflow-hidden border border-base-300">
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <Info className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-base-content">Message Info</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Message preview snippet */}
          <div className="p-3 rounded-lg bg-base-200/80 border border-base-300 text-sm max-h-32 overflow-y-auto">
            {message.image && (
              <img src={message.image} alt="Message" className="size-20 rounded-md object-cover mb-2" />
            )}
            <p className="text-base-content break-words font-normal">
              {message.text || (message.fileName ? `📎 ${message.fileName}` : message.sticker ? "🎨 Sticker" : "📷 Image")}
            </p>
          </div>

          {/* Timestamps list */}
          <div className="space-y-3.5 pt-1">
            {/* Read Status */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {isRead ? (
                  <CheckCheck className="size-5 text-sky-500" />
                ) : (
                  <CheckCheck className="size-5 text-base-content/30" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-base-content">Read</p>
                <p className="text-xs text-base-content/60">
                  {message.readAt ? formatDateTime(message.readAt) : "Not read yet"}
                </p>
              </div>
            </div>

            {/* Delivered Status */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {isDelivered ? (
                  <CheckCheck className="size-5 text-base-content/60" />
                ) : (
                  <Check className="size-5 text-base-content/30" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-base-content">Delivered</p>
                <p className="text-xs text-base-content/60">
                  {message.deliveredAt ? formatDateTime(message.deliveredAt) : (isDelivered ? formatDateTime(message.createdAt) : "Pending delivery")}
                </p>
              </div>
            </div>

            {/* Sent Status */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Clock className="size-5 text-base-content/60" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-base-content">Sent</p>
                <p className="text-xs text-base-content/60">{formatDateTime(message.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Receiver Info */}
          {receiverUser && (
            <div className="pt-2 border-t border-base-300 flex items-center gap-2.5">
              <img
                src={receiverUser.profilePic || "/avatar.png"}
                alt={receiverUser.fullName}
                className="size-8 rounded-full object-cover"
              />
              <div className="min-w-0 text-xs">
                <p className="font-semibold text-base-content truncate">
                  {receiverUser.displayName || receiverUser.fullName}
                </p>
                <p className="text-base-content/50 truncate">{receiverUser.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInfoModal;

