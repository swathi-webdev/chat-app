import { X, Users, Crown, Shield } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const GroupInfoModal = ({ group, onClose }) => {
  const { authUser } = useAuthStore();
  if (!group) return null;

  const isAdmin = String(group.admin?._id || group.admin) === String(authUser?._id);

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-md modal-panel overflow-hidden border border-base-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-base-content">Group Info</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Group Photo & Name */}
          <div className="flex flex-col items-center text-center gap-2">
            <img
              src={group.groupPic || "/avatar.png"}
              alt={group.name}
              className="size-20 rounded-full object-cover border-4 border-base-300 shadow-md"
            />
            <div>
              <h3 className="text-lg font-bold text-base-content flex items-center justify-center gap-1.5">
                {group.name}
              </h3>
              <p className="text-xs text-base-content/60">
                Group · {group.members?.length || 0} members
              </p>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
              Members ({group.members?.length || 0})
            </h4>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {group.members?.map((member) => {
                const memberObj = typeof member === "object" ? member : { _id: member, fullName: "Member" };
                const isGroupAdmin = String(memberObj._id) === String(group.admin?._id || group.admin);
                const isMe = String(memberObj._id) === String(authUser?._id);

                return (
                  <div
                    key={memberObj._id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-base-200/50"
                  >
                    <img
                      src={memberObj.profilePic || "/avatar.png"}
                      alt={memberObj.fullName}
                      className="size-9 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-base-content truncate">
                        {memberObj.fullName} {isMe ? "(You)" : ""}
                      </p>
                      <p className="text-xs text-base-content/50 truncate">
                        {memberObj.email || ""}
                      </p>
                    </div>

                    {isGroupAdmin && (
                      <span className="badge badge-primary badge-xs gap-1 font-medium">
                        <Crown className="size-2.5" /> Admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-base-300 bg-base-100 flex justify-end">
          <button onClick={onClose} className="btn btn-primary btn-sm px-6">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;

