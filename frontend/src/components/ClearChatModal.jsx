import { X, Trash2, AlertTriangle } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ClearChatModal = ({ onClose }) => {
  const { selectedUser, clearChat } = useChatStore();

  const handleClear = async () => {
    if (!selectedUser) return;
    await clearChat(selectedUser._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-sm modal-panel overflow-hidden border border-base-300">
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <Trash2 className="size-5 text-error" />
            <h2 className="text-lg font-semibold text-base-content">Clear Chat</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-error/10 text-error rounded-lg">
            <AlertTriangle className="size-5 shrink-0 mt-0.5" />
            <p className="text-xs">
              Are you sure you want to clear messages in this chat with{" "}
              <strong>{selectedUser?.displayName || selectedUser?.fullName}</strong>?
              Messages will be removed only for you.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button onClick={onClose} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button onClick={handleClear} className="btn btn-error flex-1 gap-2">
              <Trash2 className="size-4" /> Clear Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearChatModal;

