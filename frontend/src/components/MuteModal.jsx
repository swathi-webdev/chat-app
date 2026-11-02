import { useState } from "react";
import { X, BellOff, Volume2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const MuteModal = ({ onClose }) => {
  const { selectedUser, muteContact, unmuteContact } = useChatStore();
  const [duration, setDuration] = useState("8h");
  const isMuted = selectedUser?.isMuted;

  const handleMute = async () => {
    if (!selectedUser) return;
    if (isMuted) {
      await unmuteContact(selectedUser._id);
    } else {
      await muteContact(selectedUser._id, duration);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-sm modal-panel overflow-hidden border border-base-300">
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <BellOff className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-base-content">
              {isMuted ? "Unmute Notifications" : "Mute Notifications"}
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
            {isMuted
              ? `Do you want to unmute notifications for ${selectedUser?.displayName || selectedUser?.fullName}?`
              : `Other participants will not see that you muted this chat. You will still be notified if you are mentioned.`}
          </p>

          {!isMuted && (
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2.5 rounded-lg border border-base-300 hover:bg-base-200 cursor-pointer">
                <input
                  type="radio"
                  name="mute-duration"
                  value="8h"
                  checked={duration === "8h"}
                  onChange={() => setDuration("8h")}
                  className="radio radio-primary radio-sm"
                />
                <span className="text-sm font-medium">8 Hours</span>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-lg border border-base-300 hover:bg-base-200 cursor-pointer">
                <input
                  type="radio"
                  name="mute-duration"
                  value="1w"
                  checked={duration === "1w"}
                  onChange={() => setDuration("1w")}
                  className="radio radio-primary radio-sm"
                />
                <span className="text-sm font-medium">1 Week</span>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-lg border border-base-300 hover:bg-base-200 cursor-pointer">
                <input
                  type="radio"
                  name="mute-duration"
                  value="always"
                  checked={duration === "always"}
                  onChange={() => setDuration("always")}
                  className="radio radio-primary radio-sm"
                />
                <span className="text-sm font-medium">Always</span>
              </label>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button onClick={onClose} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button
              onClick={handleMute}
              className={`btn flex-1 gap-2 ${isMuted ? "btn-success" : "btn-primary"}`}
            >
              {isMuted ? <Volume2 className="size-4" /> : <BellOff className="size-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuteModal;

