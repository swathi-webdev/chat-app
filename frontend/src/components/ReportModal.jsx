import { useState } from "react";
import { X, Flag, Loader } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const REPORT_REASONS = [
  "Spam or unsolicited advertising",
  "Harassment or bullying",
  "Inappropriate or graphic content",
  "Impersonation or fake account",
  "Other",
];

const ReportModal = ({ onClose }) => {
  const { selectedUser, reportUser } = useChatStore();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    const success = await reportUser(selectedUser._id, reason, details);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-md modal-panel overflow-hidden border border-base-300">
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <Flag className="size-5 text-warning" />
            <h2 className="text-lg font-semibold text-base-content">Report Contact</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-base-content/60">
            Reporting{" "}
            <span className="font-semibold text-base-content">
              {selectedUser?.displayName || selectedUser?.fullName}
            </span>
            . Recent messages will be forwarded for review.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-base-content">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="select select-bordered select-sm w-full text-base-content bg-base-100"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-base-content">Additional Details (optional)</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what happened..."
              className="textarea textarea-bordered w-full text-xs text-base-content bg-base-100 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-warning flex-1 gap-2">
              {isSubmitting ? <Loader className="size-4 animate-spin" /> : <Flag className="size-4" />}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;

