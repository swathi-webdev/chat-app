/**
 * WhatsApp-style message status ticks:
 *   sent      → single grey check  ✓
 *   delivered → double grey check  ✓✓
 *   read      → double blue check  ✓✓ (blue)
 */
const MessageTick = ({ status }) => {
  if (!status || status === "sent") {
    // Single grey tick
    return (
      <svg
        className="inline-block ml-1 text-base-content/40"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }

  if (status === "delivered") {
    // Double grey tick
    return (
      <svg
        className="inline-block ml-1 text-base-content/40"
        width="16"
        height="14"
        viewBox="0 0 28 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 6 11 17 6 12" />
        <polyline points="16 6 5 17 0 12" />
      </svg>
    );
  }

  if (status === "read") {
    // Double blue tick
    return (
      <svg
        className="inline-block ml-1 text-blue-400"
        width="16"
        height="14"
        viewBox="0 0 28 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 6 11 17 6 12" />
        <polyline points="16 6 5 17 0 12" />
      </svg>
    );
  }

  return null;
};

export default MessageTick;

