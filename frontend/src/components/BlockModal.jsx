import { X, ShieldAlert, ShieldCheck } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const BlockModal = ({ onClose }) => {
  const { selectedUser, blockUser, unblockUser } = useChatStore();
  const isBlocked = selectedUser?.isBlocked;

  const handleToggleBlock = async () => {
    if (!selectedUser) return;
    if (isBlocked) {
      await unblockUser(selectedUser._id);
    } else {
      await blockUser(selectedUser._id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-sm modal-panel overflow-hidden border border-base-300">
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className={`size-5 ${isBlocked ? "text-success" : "text-error"}`} />
            <h2 className="text-lg font-semibold text-base-content">
              {isBlocked ? "Unblock Contact" : "Block Contact"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-base-content/80">
            {isBlocked
              ? `Unblock ${selectedUser?.displayName || selectedUser?.fullName}? You will be able to send and receive messages again.`
              : `Block ${selectedUser?.displayName || selectedUser?.fullName}? Blocked contacts will no longer be able to message or call you.`}
          </p>

          <div className="pt-2 flex gap-2">
            <button onClick={onClose} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button
              onClick={handleToggleBlock}
              className={`btn flex-1 gap-2 ${isBlocked ? "btn-success" : "btn-error"}`}
            >
              {isBlocked ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
              {isBlocked ? "Unblock" : "Block"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockModal;

