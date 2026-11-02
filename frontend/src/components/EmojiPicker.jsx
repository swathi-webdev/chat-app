import { useState } from "react";
import { Search, X, Smile, Heart, Coffee, Activity, Lightbulb, Flag } from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    icon: Smile,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹", "😊", "😇",
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
      "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒",
      "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢",
      "😭", "😮‍💨", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨",
      "😰", "😥", "😓", "🫣", "🤗", "🫡", "🤔", "🫢", "🤫", "🤥", "😶", "😐",
    ],
  },
  {
    name: "Gestures",
    icon: Heart,
    emojis: [
      "👍", "👎", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✌️", "🤞", "🫰", "🤟",
      "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️",
      "🖖", "👋", "🤙", "💪", "🦾", "🖕", "✍️", "💅", "🤳", "❤️", "🧡", "💛",
      "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓",
      "💗", "💖", "💘", "💝", "🔥", "✨", "🌟", "💫", "💥", "💯", "🎉", "🎊",
    ],
  },
  {
    name: "Food & Drink",
    icon: Coffee,
    emojis: [
      "☕", "🍵", "🧋", "🥤", "🧃", "🍺", "🍻", "🍷", "🍸", "🍹", "🍕", "🍔",
      "🍟", "🌭", "🍿", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🥪", "🌮", "🌯",
      "🥗", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🍩", "🍪", "🎂", "🍰",
      "🧁", "🍫", "🍬", "🍭", "🍦", "🍧", "🍨", "🍎", "🍓", "🍉", "🍌", "🥑",
    ],
  },
  {
    name: "Activities",
    icon: Activity,
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥊", "🥋",
      "🥅", "🎯", "⛳", "🎮", "🕹️", "🎲", "🧩", "♟️", "🎭", "🎨", "🎬", "🎤",
      "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🚗", "✈️", "🚀",
    ],
  },
  {
    name: "Objects & Symbols",
    icon: Lightbulb,
    emojis: [
      "💡", "📱", "💻", "⌨️", "🖥️", "📷", "📸", "📹", "⏰", "⏱️", "⏳", "⌛",
      "📡", "🔋", "🔌", "💸", "💵", "💰", "💳", "💎", "📦", "📫", "📬", "💌",
      "🔒", "🔓", "🔑", "🗝️", "🔨", "🪓", "🔔", "🔕", "📢", "📣", "💬", "💭",
      "✔️", "❌", "❓", "❗", "⚠️", "⛔", "🚫", "✅", "🆗", "🆒", "🆕", "🆓",
    ],
  },
];

const EmojiPicker = ({ onSelectEmoji, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");

  const currentCategory = EMOJI_CATEGORIES[activeTab];

  const filteredEmojis = search.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((e) => e.includes(search.trim()))
    : currentCategory.emojis;

  return (
    <div className="absolute bottom-full mb-2 left-0 sm:left-2 w-72 sm:w-80 bg-base-100 text-base-content rounded-2xl shadow-2xl border border-base-300 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-base-300">
        <div className="relative flex-1">
          <Search className="size-3.5 text-base-content/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis..."
            className="input input-bordered input-xs w-full pl-8 text-xs text-base-content bg-base-200/50 focus:outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Category Icons (hidden if searching) */}
      {!search.trim() && (
        <div className="flex justify-between items-center px-1 mb-2">
          {EMOJI_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? "bg-primary text-primary-content" : "text-base-content/60 hover:bg-base-200"
                }`}
                title={cat.name}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1 select-none">
        {filteredEmojis.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="size-8 text-xl flex items-center justify-center rounded-lg hover:bg-base-200 hover:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
        {filteredEmojis.length === 0 && (
          <p className="col-span-8 text-center text-xs text-base-content/40 py-6">
            No emojis found
          </p>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;

