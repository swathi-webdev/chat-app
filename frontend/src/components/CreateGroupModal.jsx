import { useState, useRef } from "react";
import { X, Users, Camera, Loader } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [groupPic, setGroupPic] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);
  const { createGroup } = useGroupStore();
  const { users } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setGroupPic(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }
    setIsCreating(true);
    const result = await createGroup({
      name: groupName.trim(),
      members: selectedMembers,
      groupPic,
    });
    setIsCreating(false);
    if (result) {
      if (onGroupCreated) onGroupCreated(result);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] modal-panel">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 shrink-0 bg-base-100">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-base-content">Create Group</h2>
          </div>
          {/* ✕ Close button — always visible */}
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="w-8 h-8 rounded-full bg-base-200 text-base-content hover:bg-error hover:text-white flex items-center justify-center transition-all duration-150 hover:scale-110 shadow-sm"
          >
            <X className="size-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Group Picture */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img
                src={groupPic || "/avatar.png"}
                alt="Group"
                className="size-20 rounded-full object-cover border-2 border-base-300"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full text-primary-content hover:scale-105 transition-transform"
              >
                <Camera className="size-3" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <p className="text-xs text-base-content/50">Group photo (optional)</p>
          </div>

          {/* Group Name */}
          <div>
            <label className="label label-text font-medium text-base-content">Group Name</label>
            <input
              type="text"
              className="input input-bordered w-full text-base-content bg-base-100 placeholder:text-base-content/50 focus:outline-none focus:border-primary text-sm font-normal"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Members */}
          <div>
            <label className="label label-text font-medium text-base-content">
              Add Members
              {selectedMembers.length > 0 && (
                <span className="badge badge-primary badge-sm ml-2">
                  {selectedMembers.length} selected
                </span>
              )}
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto border border-base-300 rounded-lg p-2">
              {users.length === 0 && (
                <div className="text-center py-5 px-3 space-y-1">
                  <p className="text-sm font-medium text-base-content/70">No contacts available</p>
                  <p className="text-xs text-base-content/40">
                    Add contacts first using the (+) button in Contacts, then add them to your group.
                  </p>
                </div>
              )}
              {users.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                  />
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="size-8 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-base-content truncate">
                      {user.displayName || user.fullName}
                    </p>
                    <p className="text-xs text-base-content/50 truncate">
                      {user.contactNo || user.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 shrink-0 flex gap-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}
            className="btn btn-primary flex-1 gap-2"
          >
            {isCreating ? (
              <>
                <Loader className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Users className="size-4" />
                Create Group
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;

