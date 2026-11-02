import { useState } from "react";
import { X, UserPlus, Loader, Phone, User, AtSign, CheckCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const AddContactModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { addContact } = useAuthStore();
  const { getUsers } = useChatStore();

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a contact name");
      return;
    }
    if (!username.trim()) {
      toast.error("Please enter a username or email");
      return;
    }

    setIsSaving(true);
    const result = await addContact({
      customName: name.trim(),
      username: username.trim(),
      contactNo: phone.trim(),
    });
    setIsSaving(false);

    if (result !== null) {
      setSaved(true);
      await getUsers(); // Refresh sidebar contacts
      setTimeout(() => onClose(), 800); // Close after brief success indicator
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-md modal-panel overflow-hidden border border-base-300">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-base-content">Add Contact</h2>
          </div>
          {/* ✕ Close exit button — always visible */}
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="w-8 h-8 rounded-full bg-base-200 text-base-content hover:bg-error hover:text-white flex items-center justify-center transition-all duration-150 hover:scale-110 shadow-sm"
          >
            <X className="size-4 stroke-[2.5]" />
          </button>
        </div>

        {/* ─── Form Body ─── */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Name Field */}
          <div>
            <label className="label label-text font-medium mb-1 flex items-center gap-1.5 text-base-content">
              <User className="size-3.5 text-primary" /> Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contact name..."
              className="input input-bordered w-full text-base-content bg-base-100 placeholder:text-base-content/40 focus:outline-none focus:border-primary"
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Username Field */}
          <div>
            <label className="label label-text font-medium mb-1 flex items-center gap-1.5 text-base-content">
              <AtSign className="size-3.5 text-primary" /> Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email..."
              className="input input-bordered w-full text-base-content bg-base-100 placeholder:text-base-content/40 focus:outline-none focus:border-primary"
              maxLength={60}
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="label label-text font-medium mb-1 flex items-center gap-1.5 text-base-content">
              <Phone className="size-3.5 text-primary" /> Phone Number (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number..."
              className="input input-bordered w-full text-base-content bg-base-100 placeholder:text-base-content/40 focus:outline-none focus:border-primary"
              maxLength={20}
            />
          </div>

          {/* ─── Footer Buttons ─── */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isSaving || saved}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || saved || !name.trim() || !username.trim()}
              className={`btn flex-1 gap-2 ${saved ? "btn-success" : "btn-primary"}`}
            >
              {isSaving ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="size-4" />
                  Saved!
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Save Contact
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;