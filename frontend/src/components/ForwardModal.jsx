import { useState } from "react";
import { X, Send, Forward, Check, Users, User } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ForwardModal = ({ message, onClose }) => {
  const { users } = useChatStore();
  const { groups } = useGroupStore();

  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const toggleContact = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleGroup = (id) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleForward = async () => {
    if (selectedContacts.length === 0 && selectedGroups.length === 0) {
      toast.error("Please select at least one chat to forward to");
      return;
    }

    setIsSending(true);
    const forwardPayload = {
      text: message.text || "",
      image: message.image || "",
      fileUrl: message.fileUrl || "",
      fileName: message.fileName || "",
      fileType: message.fileType || "",
      sticker: message.sticker || "",
    };

    try {
      // Forward to contacts
      for (const contactId of selectedContacts) {
        await axiosInstance.post(`/messages/send/${contactId}`, forwardPayload);
      }
      // Forward to groups
      for (const groupId of selectedGroups) {
        await axiosInstance.post(`/groups/${groupId}/send`, forwardPayload);
      }
      toast.success("Message forwarded");
      onClose();
    } catch (error) {
      toast.error("Failed to forward message to some chats");
    } finally {
      setIsSending(false);
    }
  };

  const totalSelected = selectedContacts.length + selectedGroups.length;

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-md modal-panel overflow-hidden border border-base-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <Forward className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-base-content">Forward Message</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* List of Contacts and Groups */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {/* Contacts Section */}
          <div>
            <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2">Contacts</h4>
            {users.length === 0 ? (
              <p className="text-xs text-base-content/40 py-2">No contacts available</p>
            ) : (
              <div className="space-y-1">
                {users.map((u) => {
                  const isChecked = selectedContacts.includes(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => toggleContact(u._id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? "bg-primary/10 border border-primary/30" : "hover:bg-base-200"
                      }`}
                    >
                      <img
                        src={u.profilePic || "/avatar.png"}
                        alt={u.fullName}
                        className="size-9 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-base-content truncate">
                          {u.displayName || u.fullName}
                        </p>
                        <p className="text-xs text-base-content/50 truncate">{u.contactNo || u.email}</p>
                      </div>
                      <div
                        className={`size-5 rounded-full border flex items-center justify-center ${
                          isChecked ? "bg-primary border-primary text-primary-content" : "border-base-300"
                        }`}
                      >
                        {isChecked && <Check className="size-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Groups Section */}
          {groups.length > 0 && (
            <div className="pt-2 border-t border-base-300">
              <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2">Groups</h4>
              <div className="space-y-1">
                {groups.map((g) => {
                  const isChecked = selectedGroups.includes(g._id);
                  return (
                    <div
                      key={g._id}
                      onClick={() => toggleGroup(g._id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? "bg-primary/10 border border-primary/30" : "hover:bg-base-200"
                      }`}
                    >
                      <img
                        src={g.groupPic || "/avatar.png"}
                        alt={g.name}
                        className="size-9 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-base-content truncate flex items-center gap-1.5">
                          <Users className="size-3.5 text-primary" /> {g.name}
                        </p>
                        <p className="text-xs text-base-content/50 truncate">
                          {g.members?.length || 0} members
                        </p>
                      </div>
                      <div
                        className={`size-5 rounded-full border flex items-center justify-center ${
                          isChecked ? "bg-primary border-primary text-primary-content" : "border-base-300"
                        }`}
                      >
                        {isChecked && <Check className="size-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-base-300 bg-base-100 flex items-center justify-between">
          <span className="text-xs text-base-content/60">
            {totalSelected > 0 ? `${totalSelected} selected` : "Select recipients"}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button
              onClick={handleForward}
              disabled={isSending || totalSelected === 0}
              className="btn btn-primary btn-sm gap-2"
            >
              <Send className="size-3.5" /> Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;

