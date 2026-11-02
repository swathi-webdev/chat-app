import { useState, useRef } from "react";
import { Search, X, Plus, Star, Type, Send, Download, Sparkles, Check, Heart } from "lucide-react";
import toast from "react-hot-toast";

// ── Real Sticker Packs ────────────────────────────────────────────────────────

const CUPPY_STICKERS = [
  { id: "cup-1", title: "Smile", label: "Smiling Cup", url: "/stickers/cuppy/01_Cuppy_smile.webp" },
  { id: "cup-2", title: "LOL", label: "Laughing Cup", url: "/stickers/cuppy/02_Cuppy_lol.webp" },
  { id: "cup-3", title: "ROFL", label: "Rolling on Floor", url: "/stickers/cuppy/03_Cuppy_rofl.webp" },
  { id: "cup-4", title: "Sad", label: "Sad Leaking Cup", url: "/stickers/cuppy/04_Cuppy_sad.webp" },
  { id: "cup-5", title: "Cry", label: "Crying Cup", url: "/stickers/cuppy/05_Cuppy_cry.webp" },
  { id: "cup-6", title: "Love", label: "Heart Coffee", url: "/stickers/cuppy/06_Cuppy_love.webp" },
  { id: "cup-7", title: "Hate", label: "Broken Heart Cup", url: "/stickers/cuppy/07_Cuppy_hate.webp" },
  { id: "cup-8", title: "Together", label: "Two Cups in Love", url: "/stickers/cuppy/08_Cuppy_lovewithmug.webp" },
  { id: "cup-9", title: "Cookie", label: "Cup & Cookie", url: "/stickers/cuppy/09_Cuppy_lovewithcookie.webp" },
  { id: "cup-10", title: "Hmm", label: "Thinking Cup", url: "/stickers/cuppy/10_Cuppy_hmm.webp" },
  { id: "cup-11", title: "Shocked", label: "Splash Cup", url: "/stickers/cuppy/11_Cuppy_upset.webp" },
  { id: "cup-12", title: "Angry", label: "Angry Cup", url: "/stickers/cuppy/12_Cuppy_angry.webp" },
  { id: "cup-13", title: "Curious", label: "Questioning Cup", url: "/stickers/cuppy/13_Cuppy_curious.webp" },
  { id: "cup-14", title: "Rainbow", label: "Rainbow Pour", url: "/stickers/cuppy/14_Cuppy_weird.webp" },
  { id: "cup-15", title: "Exhausted", label: "Bluescreen Cup", url: "/stickers/cuppy/15_Cuppy_bluescreen.webp" },
  { id: "cup-16", title: "Rage", label: "Spiky Rage Cup", url: "/stickers/cuppy/16_Cuppy_angry.webp" },
  { id: "cup-17", title: "Tired", label: "Sleepy Cup", url: "/stickers/cuppy/17_Cuppy_tired.webp" },
  { id: "cup-18", title: "Work Hard", label: "Studying Cup", url: "/stickers/cuppy/18_Cuppy_workhard.webp" },
  { id: "cup-19", title: "Shine", label: "Sparkling Cup", url: "/stickers/cuppy/19_Cuppy_shine.webp" },
  { id: "cup-20", title: "Disgusted", label: "Ugh Cup", url: "/stickers/cuppy/20_Cuppy_disgusting.webp" },
  { id: "cup-21", title: "Hello", label: "Waving Hi", url: "/stickers/cuppy/21_Cuppy_hi.webp" },
  { id: "cup-22", title: "Bye", label: "Waving Bye", url: "/stickers/cuppy/22_Cuppy_bye.webp" },
  { id: "cup-23", title: "Zen", label: "Green Tea Zen", url: "/stickers/cuppy/23_Cuppy_greentea.webp" },
];

const TOGETHER_STICKERS = [
  { id: "tog-1", title: "Sending Love", label: "Sending Love", url: "/stickers/together/01_SendingLove.webp" },
  { id: "tog-2", title: "Together", label: "We'll Do This Together", url: "/stickers/together/02_WellDoThisTogether.webp" },
  { id: "tog-3", title: "Heart", label: "Growing Heart", url: "/stickers/together/03_Heart.webp" },
  { id: "tog-4", title: "High Five", label: "Air High Five", url: "/stickers/together/04_AirHighFive.webp" },
  { id: "tog-8", title: "Are You OK?", label: "Are You OK Phone", url: "/stickers/together/08_AreYouOK.webp" },
  { id: "tog-9", title: "Staying Home", label: "Home Mug", url: "/stickers/together/09_StayingHomeMug.webp" },
  { id: "tog-10", title: "Bed Work", label: "Working From Bed", url: "/stickers/together/10_WorkingFromBed.webp" },
  { id: "tog-11", title: "Stay Calm", label: "Meditation", url: "/stickers/together/11_StayCalm.webp" },
  { id: "tog-12", title: "Stretching", label: "Gymnastics Dog", url: "/stickers/together/12_Gymnastics.webp" },
  { id: "tog-13", title: "Checking", label: "Double Checking", url: "/stickers/together/13_DoubleChecking.webp" },
  { id: "tog-14", title: "Cat Laptop", label: "Cat On The Laptop", url: "/stickers/together/14_CatOnTheLaptop.webp" },
  { id: "tog-15", title: "WFH Girl", label: "Working From Home Girl", url: "/stickers/together/15_WorkingFromHomeF.webp" },
  { id: "tog-16", title: "WFH Guy", label: "Working From Home Guy", url: "/stickers/together/16_WorkingFromHomeM.webp" },
  { id: "tog-17", title: "Wash Hands", label: "Washing Hands", url: "/stickers/together/17_WashingHands.webp" },
  { id: "tog-18", title: "Don't Touch", label: "Don't Touch Face", url: "/stickers/together/18_DontTouchYourFace.webp" },
  { id: "tog-19", title: "My Bubble", label: "Social Distancing", url: "/stickers/together/19_SocialDistancing.webp" },
  { id: "tog-20", title: "Superhero", label: "Superhero Nurse", url: "/stickers/together/20_SuperheroNurse.webp" },
  { id: "tog-21", title: "Hero", label: "You Are My Hero", url: "/stickers/together/21_YouAreMyHero.webp" },
];

const FLUENT_3D_BASE = "https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets";
const FUN_3D_STICKERS = [
  { id: "f3d-wave", title: "Wave", label: "Waving Hand", url: `${FLUENT_3D_BASE}/1f44b_3d.png` },
  { id: "f3d-thumb", title: "Thumbs Up", label: "Thumbs Up", url: `${FLUENT_3D_BASE}/1f44d_3d.png` },
  { id: "f3d-fire", title: "Fire", label: "Fire Flame", url: `${FLUENT_3D_BASE}/1f525_3d.png` },
  { id: "f3d-party", title: "Party", label: "Party Popper", url: `${FLUENT_3D_BASE}/1f389_3d.png` },
  { id: "f3d-rocket", title: "Rocket", label: "Rocket Ship", url: `${FLUENT_3D_BASE}/1f680_3d.png` },
  { id: "f3d-sparkle", title: "Sparkles", label: "Sparkles", url: `${FLUENT_3D_BASE}/2728_3d.png` },
  { id: "f3d-100", title: "100%", label: "100 Score", url: `${FLUENT_3D_BASE}/1f4af_3d.png` },
  { id: "f3d-clap", title: "Clap", label: "Applause", url: `${FLUENT_3D_BASE}/1f44f_3d.png` },
  { id: "f3d-muscle", title: "Strong", label: "Flexed Biceps", url: `${FLUENT_3D_BASE}/1f4aa_3d.png` },
  { id: "f3d-celeb", title: "Celebrate", label: "Party Horn Face", url: `${FLUENT_3D_BASE}/1f973_3d.png` },
  { id: "f3d-love", title: "In Love", label: "Heart Eyes", url: `${FLUENT_3D_BASE}/1f60d_3d.png` },
  { id: "f3d-rofl", title: "ROFL", label: "Rolling Laugh", url: `${FLUENT_3D_BASE}/1f923_3d.png` },
  { id: "f3d-cool", title: "Cool", label: "Sunglasses Cool", url: `${FLUENT_3D_BASE}/1f60e_3d.png` },
  { id: "f3d-unicorn", title: "Unicorn", label: "Cute Unicorn", url: `${FLUENT_3D_BASE}/1f984_3d.png` },
  { id: "f3d-alien", title: "Alien", label: "Space Alien", url: `${FLUENT_3D_BASE}/1f47d_3d.png` },
  { id: "f3d-heart", title: "Sparkle Heart", label: "Sparkling Heart", url: `${FLUENT_3D_BASE}/1f496_3d.png` },
];

const PACKS = {
  Cuppy: CUPPY_STICKERS,
  Together: TOGETHER_STICKERS,
  "3D Fun": FUN_3D_STICKERS,
};

const CATEGORIES = ["Cuppy", "Together", "3D Fun", "My Stickers", "Favorites"];

// ── Canvas text baking helper ──────────────────────────────────────────────────
const bakeStickerWithText = (imageUrl, text, position = "bottom", textColor = "#ffffff") => {
  return new Promise((resolve) => {
    if (!text || !text.trim()) {
      resolve(imageUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = Math.max(img.width || 400, img.height || 400, 480);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // Draw original sticker centered
      const w = img.width || size;
      const h = img.height || size;
      const ratio = Math.min((size * 0.85) / w, (size * 0.85) / h);
      const dw = w * ratio;
      const dh = h * ratio;
      const dx = (size - dw) / 2;
      const dy = (size - dh) / 2;

      ctx.drawImage(img, dx, dy, dw, dh);

      // Draw custom sticker text
      const cleanText = text.trim();
      const fontSize = Math.max(24, Math.floor(size * 0.1));
      ctx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let textY = size - fontSize * 0.75;
      if (position === "top") textY = fontSize * 0.9;
      if (position === "center") textY = size / 2;

      // Heavy black stroke (classic sticker outline)
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(5, Math.floor(fontSize * 0.22));
      ctx.strokeStyle = "#000000";
      ctx.strokeText(cleanText, size / 2, textY);

      // Inner fill
      ctx.fillStyle = textColor;
      ctx.fillText(cleanText, size / 2, textY);

      try {
        resolve(canvas.toDataURL("image/webp", 0.92));
      } catch {
        resolve(imageUrl);
      }
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
};

// ── Main StickerPicker Component ──────────────────────────────────────────────

const StickerPicker = ({ onSelectSticker, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("Cuppy");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("chatty_favorite_stickers") || "[]")
  );
  const [customStickers, setCustomStickers] = useState(() =>
    JSON.parse(localStorage.getItem("chatty_custom_stickers") || "[]")
  );

  // Preview Modal State
  const [previewSticker, setPreviewSticker] = useState(null);
  const [stickerText, setStickerText] = useState("");
  const [textPosition, setTextPosition] = useState("bottom"); // "bottom" | "top" | "center"
  const [textColor, setTextColor] = useState("#ffffff");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);

  const toggleFavorite = (sticker, e) => {
    e?.stopPropagation();
    let updated;
    if (favorites.some((f) => f.id === sticker.id)) {
      updated = favorites.filter((f) => f.id !== sticker.id);
      toast("Removed from favorites", { icon: "⭐" });
    } else {
      updated = [sticker, ...favorites];
      toast("Added to favorites!", { icon: "⭐" });
    }
    setFavorites(updated);
    localStorage.setItem("chatty_favorite_stickers", JSON.stringify(updated));
  };

  // Triggered when user selects a file from the "+ Add" button
  const handleCustomFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Open preview modal immediately so user can add text
      setPreviewSticker({
        id: `custom-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        label: file.name,
        url: reader.result,
        isNewUpload: true,
      });
      setStickerText("");
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Open preview modal when user clicks ANY sticker
  const handleStickerClick = (sticker) => {
    setPreviewSticker(sticker);
    setStickerText("");
  };

  // Save sticker to "My Stickers"
  const handleSaveToCustom = async () => {
    if (!previewSticker) return;
    setIsProcessing(true);
    try {
      const finalUrl = await bakeStickerWithText(
        previewSticker.url,
        stickerText,
        textPosition,
        textColor
      );
      const newSticker = {
        id: `custom-${Date.now()}`,
        title: stickerText.trim() || previewSticker.title || "Custom Sticker",
        label: stickerText.trim() || previewSticker.label || "Custom Sticker",
        url: finalUrl,
      };
      const updated = [newSticker, ...customStickers];
      setCustomStickers(updated);
      localStorage.setItem("chatty_custom_stickers", JSON.stringify(updated));
      toast.success("Sticker added to My Stickers!");
      setActiveCategory("My Stickers");
      setPreviewSticker(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Send sticker directly to the chat
  const handleSendSticker = async () => {
    if (!previewSticker) return;
    setIsProcessing(true);
    try {
      const finalUrl = await bakeStickerWithText(
        previewSticker.url,
        stickerText,
        textPosition,
        textColor
      );
      // If user created a new custom sticker with text, also persist it to My Stickers
      if (previewSticker.isNewUpload || stickerText.trim()) {
        const newSticker = {
          id: `custom-${Date.now()}`,
          title: stickerText.trim() || previewSticker.title || "Custom Sticker",
          label: stickerText.trim() || previewSticker.label || "Custom Sticker",
          url: finalUrl,
        };
        const updated = [newSticker, ...customStickers.filter((s) => s.id !== previewSticker.id)];
        setCustomStickers(updated);
        localStorage.setItem("chatty_custom_stickers", JSON.stringify(updated));
      }

      onSelectSticker(finalUrl, stickerText.trim());
      setPreviewSticker(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine current list to display
  let currentList = [];
  if (search.trim()) {
    const all = [
      ...CUPPY_STICKERS,
      ...TOGETHER_STICKERS,
      ...FUN_3D_STICKERS,
      ...customStickers,
    ];
    currentList = all.filter(
      (s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.label.toLowerCase().includes(search.toLowerCase())
    );
  } else if (activeCategory === "Favorites") {
    currentList = favorites;
  } else if (activeCategory === "My Stickers") {
    currentList = customStickers;
  } else {
    currentList = PACKS[activeCategory] || CUPPY_STICKERS;
  }

  const isFavorite = previewSticker
    ? favorites.some((f) => f.id === previewSticker.id)
    : false;

  return (
    <>
      <div className="absolute bottom-full mb-2 left-0 sm:left-4 w-76 sm:w-92 bg-base-100 text-base-content rounded-2xl shadow-2xl border border-base-300 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[380px]">
        {/* ── Top Bar with Search, Add Sticker, and Close ── */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-base-300 shrink-0">
          <div className="relative flex-1">
            <Search className="size-3.5 text-base-content/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stickers..."
              className="input input-bordered input-xs w-full pl-8 text-xs text-base-content bg-base-200/50 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleCustomFileSelect}
          />

          {/* + Add Sticker Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary btn-xs gap-1 px-2 font-medium shadow-sm hover:scale-105 transition-transform"
            title="Add a custom sticker and add text"
          >
            <Plus className="size-3.5" />
            <span>Add</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-base-200 hover:bg-error hover:text-white flex items-center justify-center transition-colors text-base-content/70"
            title="Close stickers"
          >
            <X className="size-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* ── Category Tabs ── */}
        {!search.trim() && (
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none mb-1 text-xs shrink-0">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    isActive
                      ? "bg-primary text-primary-content shadow-sm"
                      : "bg-base-200 hover:bg-base-300 text-base-content/70"
                  }`}
                >
                  {cat === "Favorites" && <Star className="size-3 fill-current" />}
                  {cat === "My Stickers" && <Sparkles className="size-3" />}
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Stickers Grid ── */}
        <div className="flex-1 overflow-y-auto pr-1">
          {currentList.length === 0 ? (
            <div className="py-12 text-center text-base-content/50 space-y-2">
              <p className="text-sm">No stickers in this tab yet</p>
              {activeCategory === "My Stickers" && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary btn-xs gap-1 mx-auto"
                >
                  <Plus className="size-3" /> Create Your First Sticker
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 p-1 select-none">
              {currentList.map((sticker) => {
                const isFav = favorites.some((f) => f.id === sticker.id);
                return (
                  <div
                    key={sticker.id}
                    onClick={() => handleStickerClick(sticker)}
                    className="group relative aspect-square p-2 rounded-xl hover:bg-base-200/80 cursor-pointer flex flex-col items-center justify-center transition-all hover:scale-105 border border-base-300/40 bg-base-100 shadow-xs"
                    title={sticker.label || sticker.title}
                  >
                    <img
                      src={sticker.url}
                      alt={sticker.title}
                      className="w-14 h-14 object-contain pointer-events-none drop-shadow select-none"
                      loading="lazy"
                    />

                    {/* Sticker Title under preview */}
                    <span className="text-[10px] text-base-content/70 truncate max-w-full mt-1 text-center font-medium">
                      {sticker.title}
                    </span>

                    {/* Quick Star / Favorite Toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(sticker, e)}
                      className={`absolute top-1 right-1 p-1 rounded-full bg-base-100/90 shadow transition-opacity ${
                        isFav ? "opacity-100 text-amber-500" : "opacity-0 group-hover:opacity-100 text-base-content/40 hover:text-amber-500"
                      }`}
                      title={isFav ? "Remove favorite" : "Add to favorites"}
                    >
                      <Star className={`size-3 ${isFav ? "fill-amber-500" : ""}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── STICKER PREVIEW & ADD TEXT MODAL ──────────────────────────────── */}
      {previewSticker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4 modal-backdrop">
          <div className="bg-base-100 text-base-content rounded-2xl shadow-2xl w-full max-w-sm border border-base-300 overflow-hidden modal-panel flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-base-300 bg-base-100">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="font-semibold text-sm text-base-content">
                  {previewSticker.isNewUpload ? "New Sticker" : "Sticker Preview"}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                {/* Favorite toggle */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(previewSticker)}
                  className={`btn btn-ghost btn-xs btn-circle ${
                    isFavorite ? "text-amber-500" : "text-base-content/50"
                  }`}
                  title={isFavorite ? "Starred" : "Star sticker"}
                >
                  <Star className={`size-4 ${isFavorite ? "fill-amber-500" : ""}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewSticker(null)}
                  className="w-7 h-7 rounded-full bg-base-200 text-base-content hover:bg-error hover:text-white flex items-center justify-center transition-colors"
                  title="Close preview"
                >
                  <X className="size-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Sticker Preview Area */}
            <div className="p-4 space-y-3.5">
              <div className="relative rounded-xl border border-base-300/80 bg-base-200/60 p-4 flex items-center justify-center min-h-[190px] max-h-[210px] overflow-hidden select-none">
                {/* Background grid pattern for transparency */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  }}
                />

                {/* Main Sticker Image */}
                <img
                  src={previewSticker.url}
                  alt={previewSticker.title}
                  className="max-h-36 max-w-full object-contain drop-shadow-lg relative z-10"
                />

                {/* Live Text Overlay on Sticker */}
                {stickerText.trim() && (
                  <div
                    className={`absolute z-20 left-2 right-2 text-center pointer-events-none ${
                      textPosition === "top"
                        ? "top-3"
                        : textPosition === "center"
                        ? "top-1/2 -translate-y-1/2"
                        : "bottom-3"
                    }`}
                  >
                    <span
                      style={{
                        color: textColor,
                        textShadow:
                          "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.85)",
                        fontFamily: "'Impact', 'Arial Black', sans-serif",
                        letterSpacing: "0.5px",
                      }}
                      className="text-base sm:text-lg font-black uppercase break-words px-2 inline-block max-w-full"
                    >
                      {stickerText}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Add Text Input Field ── */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-base-content flex items-center gap-1.5">
                  <Type className="size-3.5 text-primary" />
                  <span>Add Text (shows on sticker)</span>
                </label>
                <input
                  type="text"
                  value={stickerText}
                  onChange={(e) => setStickerText(e.target.value)}
                  placeholder="Type text for sticker (e.g., LOL, Hello, GM)..."
                  className="input input-bordered input-sm w-full text-base-content bg-base-100 placeholder:text-base-content/40 focus:outline-none focus:border-primary text-xs"
                  maxLength={40}
                  autoFocus
                />
              </div>

              {/* Text Controls: Position & Color */}
              {stickerText.trim() && (
                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  {/* Position Toggle */}
                  <div className="flex items-center gap-1 bg-base-200 p-1 rounded-lg">
                    {["top", "center", "bottom"].map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setTextPosition(pos)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                          textPosition === pos
                            ? "bg-primary text-primary-content"
                            : "text-base-content/60 hover:text-base-content"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1">
                    {[
                      { color: "#ffffff", label: "White" },
                      { color: "#facc15", label: "Yellow" },
                      { color: "#ef4444", label: "Red" },
                      { color: "#38bdf8", label: "Sky" },
                      { color: "#10b981", label: "Green" },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setTextColor(c.color)}
                        className={`size-5 rounded-full border-2 transition-transform hover:scale-110 ${
                          textColor === c.color ? "border-primary scale-110 shadow-sm" : "border-base-300"
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-3 border-t border-base-300 bg-base-100/60 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveToCustom}
                disabled={isProcessing}
                className="btn btn-ghost btn-sm flex-1 text-xs font-medium"
                title="Save this sticker into My Stickers pack"
              >
                <Plus className="size-3.5" />
                <span>Save to Pack</span>
              </button>

              <button
                type="button"
                onClick={handleSendSticker}
                disabled={isProcessing}
                className="btn btn-primary btn-sm flex-1 text-xs font-semibold gap-1.5 shadow"
              >
                <Send className="size-3.5" />
                <span>{isProcessing ? "Sending..." : "Send Sticker"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StickerPicker;
