import { useState, useRef } from "react";
import { X, Image, Upload, RotateCcw, Check } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const DEFAULT_WALLPAPERS = [
  { id: "none", name: "Default (None)", value: "" },
  { id: "doodle-light", name: "Doodle Light", value: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60" },
  { id: "dark-minimal", name: "Dark Texture", value: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60" },
  { id: "pastel-gradient", name: "Pastel Wave", value: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60" },
  { id: "nature", name: "Nature Green", value: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=60" },
  { id: "solid-slate", name: "Slate", value: "#1e293b" },
  { id: "solid-cream", name: "Warm Cream", value: "#fef3c7" },
  { id: "solid-sage", name: "Sage", value: "#e2e8f0" },
];

const ChatWallpaperModal = ({ onClose }) => {
  const { selectedUser, chatWallpapers, setChatWallpaper } = useChatStore();
  const fileInputRef = useRef(null);

  const currentWallpaper = (selectedUser && chatWallpapers[selectedUser._id]) || "";
  const [selected, setSelected] = useState(currentWallpaper);

  const handleApply = async (val) => {
    if (!selectedUser) return;
    setSelected(val);
    await setChatWallpaper(selectedUser._id, val);
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await handleApply(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-md modal-panel overflow-hidden border border-base-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <Image className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-base-content">Chat Wallpaper</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-base-content/60">
            Choose a wallpaper for this chat with{" "}
            <span className="font-semibold text-base-content">
              {selectedUser?.displayName || selectedUser?.fullName}
            </span>
            .
          </p>

          {/* Wallpapers Grid */}
          <div className="grid grid-cols-2 gap-3">
            {DEFAULT_WALLPAPERS.map((wp) => {
              const isActive = selected === wp.value;
              const isColor = wp.value.startsWith("#");

              return (
                <button
                  key={wp.id}
                  onClick={() => handleApply(wp.value)}
                  className={`h-24 rounded-lg overflow-hidden border-2 relative transition-all text-left flex flex-col justify-end p-2 ${
                    isActive ? "border-primary ring-2 ring-primary/40" : "border-base-300 hover:border-base-content/40"
                  }`}
                  style={
                    wp.value === ""
                      ? { background: "var(--fallback-b2, #f3f4f6)" }
                      : isColor
                      ? { backgroundColor: wp.value }
                      : { backgroundImage: `url(${wp.value})`, backgroundSize: "cover", backgroundPosition: "center" }
                  }
                >
                  <span className="text-[11px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded w-max">
                    {wp.name}
                  </span>
                  {isActive && (
                    <span className="absolute top-2 right-2 bg-primary text-primary-content size-5 rounded-full flex items-center justify-center shadow">
                      <Check className="size-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Upload Custom or Reset */}
          <div className="pt-2 border-t border-base-300 flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline btn-sm flex-1 gap-2"
            >
              <Upload className="size-4" /> Upload Custom
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomUpload}
            />
            <button
              onClick={() => handleApply("")}
              className="btn btn-ghost btn-sm gap-1.5 text-base-content/70"
              title="Reset to default"
            >
              <RotateCcw className="size-4" /> Reset
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-base-300 bg-base-100 flex justify-end">
          <button onClick={onClose} className="btn btn-primary btn-sm px-6">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWallpaperModal;

