import { useState, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const SearchMessagesBar = ({ onNavigateMatch }) => {
  const { messages, isSearchInChatOpen, setIsSearchInChatOpen, inChatSearchQuery, setInChatSearchQuery } = useChatStore();
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);

  // Compute matched message IDs
  const matchedMessageIds = inChatSearchQuery.trim()
    ? messages
        .filter((m) =>
          (m.text || "").toLowerCase().includes(inChatSearchQuery.toLowerCase().trim())
        )
        .map((m) => m._id)
    : [];

  useEffect(() => {
    if (matchedMessageIds.length > 0) {
      setCurrentMatchIdx(1);
      onNavigateMatch?.(matchedMessageIds[0]);
    } else {
      setCurrentMatchIdx(0);
    }
  }, [inChatSearchQuery]);

  if (!isSearchInChatOpen) return null;

  const handleNext = () => {
    if (matchedMessageIds.length === 0) return;
    const nextIdx = currentMatchIdx >= matchedMessageIds.length ? 1 : currentMatchIdx + 1;
    setCurrentMatchIdx(nextIdx);
    onNavigateMatch?.(matchedMessageIds[nextIdx - 1]);
  };

  const handlePrev = () => {
    if (matchedMessageIds.length === 0) return;
    const prevIdx = currentMatchIdx <= 1 ? matchedMessageIds.length : currentMatchIdx - 1;
    setCurrentMatchIdx(prevIdx);
    onNavigateMatch?.(matchedMessageIds[prevIdx - 1]);
  };

  const handleClose = () => {
    setInChatSearchQuery("");
    setIsSearchInChatOpen(false);
  };

  return (
    <div className="bg-base-100 border-b border-base-300 p-2.5 px-4 flex items-center gap-2 shadow-sm z-20 animate-in slide-in-from-top duration-200">
      <div className="relative flex-1 flex items-center">
        <Search className="size-4 text-base-content/40 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={inChatSearchQuery}
          onChange={(e) => setInChatSearchQuery(e.target.value)}
          placeholder="Search in conversation..."
          className="input input-bordered input-sm w-full pl-9 pr-20 text-base-content bg-base-100 placeholder:text-base-content/40 focus:outline-none focus:border-primary"
          autoFocus
        />
        {inChatSearchQuery.trim() && (
          <span className="absolute right-3 text-xs text-base-content/50 pointer-events-none">
            {matchedMessageIds.length > 0
              ? `${currentMatchIdx} of ${matchedMessageIds.length}`
              : "0 results"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handlePrev}
          disabled={matchedMessageIds.length === 0}
          className="btn btn-ghost btn-xs btn-square"
          title="Previous match"
        >
          <ChevronUp className="size-4" />
        </button>
        <button
          onClick={handleNext}
          disabled={matchedMessageIds.length === 0}
          className="btn btn-ghost btn-xs btn-square"
          title="Next match"
        >
          <ChevronDown className="size-4" />
        </button>
        <button
          onClick={handleClose}
          className="btn btn-ghost btn-xs btn-square hover:bg-error hover:text-error-content"
          title="Close search"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default SearchMessagesBar;

