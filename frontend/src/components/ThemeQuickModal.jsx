import { X, Sun, Moon, Laptop, Palette } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const THEME_OPTIONS = [
  { id: "light", label: "Light Mode", icon: Sun, desc: "Clean and bright look" },
  { id: "dark", label: "Dark Mode", icon: Moon, desc: "Easy on the eyes in low light" },
  { id: "coffee", label: "Coffee (Classic)", icon: Palette, desc: "Default warm aesthetic" },
  { id: "corporate", label: "Corporate", icon: Laptop, desc: "Professional and crisp" },
];

const ThemeQuickModal = ({ onClose }) => {
  const { theme, setTheme } = useThemeStore();

  const handleSelect = (t) => {
    setTheme(t);
  };

  return (
    <div className="fixed inset-0 bg-black/60 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 text-base-content rounded-xl shadow-2xl w-full max-w-sm modal-panel overflow-hidden border border-base-300">
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-base-content">Change Theme</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-base-300 text-base-content hover:bg-error hover:text-error-content flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-base-300 hover:bg-base-200 text-base-content"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs opacity-60 truncate">{opt.desc}</p>
                </div>
                {isSelected && <span className="size-2 rounded-full bg-primary shrink-0" />}
              </button>
            );
          })}

          <div className="pt-2">
            <button onClick={onClose} className="btn btn-primary btn-sm w-full">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeQuickModal;

