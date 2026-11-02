import { useState } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import { Send, Bell, BellOff, Volume2, VolumeX, Shield, Eye, EyeOff } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just testing the new theme.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  // Notification & Privacy settings (persisted in localStorage)
  const [notifications, setNotifications] = useState(
    localStorage.getItem("chatty-notifications") !== "false"
  );
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("chatty-sound") !== "false"
  );
  const [readReceipts, setReadReceipts] = useState(
    localStorage.getItem("chatty-read-receipts") !== "false"
  );
  const [onlineStatus, setOnlineStatus] = useState(
    localStorage.getItem("chatty-online-status") !== "false"
  );

  const handleToggle = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, String(value));
  };

  return (
    <div className="h-screen container mx-auto px-4 max-w-5xl pt-20 pb-8 overflow-y-auto">
      <div className="space-y-8">
        {/* Theme Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Theme</h2>
            <p className="text-sm text-base-content/70">
              Choose a theme for your chat interface
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${
                  theme === t ? "bg-base-200" : "hover:bg-base-200/50"
                }`}
              >
                <div
                  className="relative h-8 w-full rounded-md overflow-hidden"
                  data-theme={t}
                >
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>

          {/* Preview */}
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div className="rounded-xl border border-base-300 overflow-hidden bg-base-300 shadow-lg">
            <div className="p-4 bg-base-200">
              <div className="max-w-lg mx-auto">
                <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                        J
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">John Doe</h3>
                        <p className="text-xs text-base-content/70">Online</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                            message.isSent
                              ? "bg-primary text-primary-content"
                              : "bg-base-200"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-[10px] mt-1.5 ${
                              message.isSent
                                ? "text-primary-content/70"
                                : "text-base-content/70"
                            }`}
                          >
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-base-300 bg-base-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 text-sm h-10"
                        placeholder="Type a message..."
                        value="This is a preview"
                        readOnly
                      />
                      <button className="btn btn-primary h-10 min-h-0">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-base-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Notification Settings</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Message Notifications</p>
                <p className="text-sm text-base-content/60">Show notifications for new messages</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={notifications}
                onChange={(e) => handleToggle("chatty-notifications", e.target.checked, setNotifications)}
              />
            </div>

            <div className="divider my-0" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="size-4 text-primary" /> : <VolumeX className="size-4 text-base-content/40" />}
                <div>
                  <p className="font-medium">Sound Notifications</p>
                  <p className="text-sm text-base-content/60">Play sound for new messages</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={soundEnabled}
                onChange={(e) => handleToggle("chatty-sound", e.target.checked, setSoundEnabled)}
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-base-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Privacy Settings</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {readReceipts ? <Eye className="size-4 text-primary" /> : <EyeOff className="size-4 text-base-content/40" />}
                <div>
                  <p className="font-medium">Read Receipts</p>
                  <p className="text-sm text-base-content/60">Let others know when you've read their messages</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={readReceipts}
                onChange={(e) => handleToggle("chatty-read-receipts", e.target.checked, setReadReceipts)}
              />
            </div>

            <div className="divider my-0" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Online Status</p>
                <p className="text-sm text-base-content/60">Show when you are online to others</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={onlineStatus}
                onChange={(e) => handleToggle("chatty-online-status", e.target.checked, setOnlineStatus)}
              />
            </div>
          </div>
        </div>

        {/* Chat Preferences */}
        <div className="bg-base-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Chat Preferences</h2>
          <div className="space-y-2 text-sm text-base-content/70">
            <div className="flex items-center justify-between py-2 border-b border-base-300">
              <span>Enter to send message</span>
              <span className="badge badge-primary badge-sm">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-base-300">
              <span>Auto-scroll to latest message</span>
              <span className="badge badge-primary badge-sm">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Show typing indicators</span>
              <span className="badge badge-primary badge-sm">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
