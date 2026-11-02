const TypingIndicator = () => {
  return (
    <div className="chat chat-start">
      <div className="chat-bubble chat-bubble-base-300 py-3 px-4">
        <div className="flex items-center gap-1">
          <span
            className="size-2 bg-base-content/50 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="size-2 bg-base-content/50 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="size-2 bg-base-content/50 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

