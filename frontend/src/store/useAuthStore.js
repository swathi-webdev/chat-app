import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  showLogoutConfirm: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in Successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, showLogoutConfirm: false });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  setShowLogoutConfirm: (val) => set({ showLogoutConfirm: val }),

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile Updated Successfully");
      return true;
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Search users by name or email
  searchUsers: async (query) => {
    try {
      const res = await axiosInstance.get(`/auth/search-users?q=${encodeURIComponent(query)}`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
      return [];
    }
  },

  // Add contact by user ID or username/customName/contactNo
  addContact: async (dataOrId, customName = "", contactNo = "", username = "") => {
    try {
      let payload = {};
      if (typeof dataOrId === "object" && dataOrId !== null) {
        payload = dataOrId;
      } else {
        payload = { contactId: dataOrId, customName, contactNo, username };
      }
      const res = await axiosInstance.post("/auth/add-contact", payload);
      toast.success("Contact added successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add contact");
      return null;
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });
    socket.connect();
    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
