import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, User, Mail, Save, Info } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [status, setStatus] = useState(authUser?.status || "Hey there! I am using Chatty");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      const success = await updateProfile({ profilePic: base64Image });
      if (success) {
        setSelectedImg(base64Image);
      }
    };
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    const success = await updateProfile({ fullName: fullName.trim(), status });
    if (success) {
      setIsEditingName(false);
      setIsEditingStatus(false);
    }
  };

  const hasChanges =
    fullName !== authUser?.fullName || status !== (authUser?.status || "Hey there! I am using Chatty");

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto py-8 p-4">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Profile upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Editable fields */}
          <div className="space-y-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              {isEditingName ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input input-bordered w-full"
                  maxLength={50}
                  autoFocus
                  onBlur={() => {
                    if (!fullName.trim()) setFullName(authUser?.fullName || "");
                  }}
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="w-full text-left px-4 py-2.5 bg-base-200 rounded-lg border hover:border-primary transition-colors"
                >
                  {fullName || authUser?.fullName}
                </button>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border text-base-content/70">
                {authUser?.email}
              </p>
            </div>

            {/* Status / About */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Status / About
              </div>
              {isEditingStatus ? (
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input input-bordered w-full"
                  maxLength={100}
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="w-full text-left px-4 py-2.5 bg-base-200 rounded-lg border hover:border-primary transition-colors text-base-content/70"
                >
                  {status}
                </button>
              )}
            </div>

            {/* Save button */}
            {hasChanges && (
              <button
                onClick={handleSaveProfile}
                disabled={isUpdatingProfile}
                className="btn btn-primary w-full gap-2"
              >
                {isUpdatingProfile ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            )}
          </div>

          {/* Account Information */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
