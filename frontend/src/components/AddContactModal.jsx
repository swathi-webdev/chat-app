import { useState, useRef, useEffect } from "react";
import { X, UserPlus, Loader, Phone, User, CheckCircle, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const AddContactModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [matchedUser, setMatchedUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { searchUsers, addContact } = useAuthStore();
  const { getUsers } = useChatStore();
  const debounceRef = useRef(null);

  // Real-time lookup as user types name or phone/email
  useEffect(() => {
    const query = phoneOrEmail.trim() || name.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setMatchedUser(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchUsers(query);
      setIsSearching(false);
      setSuggestions(results || []);
      // If exact match on email or name, auto-select
      const exact = (results || []).find(
        (u) =>
          u.email.toLowerCase() === query.toLowerCase() ||
          u.fullName.toLowerCase() === query.toLowerCase()
      );
      if (exact) setMatchedUser(exact);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name, phoneOrEmail, searchUsers]);

  const handleSelectSuggestion = (user) => {
    setMatchedUser(user);
    if (!name.trim()) setName(user.fullName);
    if (!phoneOrEmail.trim()) setPhoneOrEmail(user.email);
    setSuggestions([]);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a contact name");
      return;
    }
    if (!phoneOrEmail.trim() && !matchedUser) {
      toast.error("Please enter a phone number or email");
      return;
    }

    setIsSaving(true);
    const result = await addContact(
      matchedUser?._id || null,
      name.trim(),
      phoneOrEmail.trim()
    );
    setIsSaving(false);

    if (result !== null) {
      setSaved(true);
      await getUsers(); // Refresh sidebar contacts
      setTimeout(() => onClose(), 900); // Close after success flash
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
            onClick={onClose}
            title="Close"
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all duration-150 hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
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

          {/* Phone Number / Email Field */}
          <div>
            <label className="label label-text font-medium mb-1 flex items-center gap-1.5 text-base-content">
              <Phone className="size-3.5 text-primary" /> Phone Number 
            </label>
            <div className="relative">
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="Enter phone number "
                className="input input-bordered w-full text-base-content bg-base-100 placeholder:text-base-content/40 focus:outline-none focus:border-primary pr-8"
                maxLength={60}
              />
              {isSearching && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-primary" />
              )}
            </div>
          </div>

          {/* Suggestions Dropdown (if multiple matches found) */}
          {suggestions.length > 0 && !matchedUser && (
            <div className="border border-base-300 rounded-lg p-2 max-h-36 overflow-y-auto space-y-1 bg-base-200/50">
              <p className="text-xs text-base-content/60 font-medium px-1 flex items-center gap-1">
                <Search className="size-3" /> Matching Chatty users:
              </p>
              {suggestions.map((u) => (
                <button
                  type="button"
                  key={u._id}
                  onClick={() => handleSelectSuggestion(u)}
                  className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-base-200 text-left transition-colors"
                >
                  <img
                    src={u.profilePic || "/avatar.png"}
                    alt={u.fullName}
                    className="size-6 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-base-content truncate">{u.fullName}</p>
                    <p className="text-[10px] text-base-content/50 truncate">{u.email}</p>
                  </div>
                  <span className="text-[11px] text-primary font-medium shrink-0">Select</span>
                </button>
              ))}
            </div>
          )}

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
              disabled={isSaving || saved || !name.trim() || (!phoneOrEmail.trim() && !matchedUser)}
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
