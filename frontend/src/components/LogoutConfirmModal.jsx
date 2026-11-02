import { LogOut, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const LogoutConfirmModal = () => {
  const { logout, setShowLogoutConfirm } = useAuthStore();

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-sm modal-panel">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <LogOut className="size-5 text-error" />
            <h2 className="text-lg font-semibold text-base-content">Logout</h2>
          </div>
          {/* ✕ Close button — always visible */}
          <button
            onClick={() => setShowLogoutConfirm(false)}
            title="Close"
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all duration-150 hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-base-content/80">
            Are you sure you want to logout?
          </p>
          <p className="text-sm text-base-content/50 mt-1">
            You will need to log in again to access your chats.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-base-300 flex gap-3">
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="btn btn-ghost flex-1"
          >
            Cancel
          </button>
          <button
            onClick={logout}
            className="btn btn-error flex-1 gap-2"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;

