import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  searchQuery: "",
  typingUsers: {}, // { userId: true/false }
  unreadCounts: {}, // { userId: count }
  lastSeenMap: {}, // { userId: Date }

  // ── Reply & In-Chat Search ────────────────────────────────────────────────
  replyingTo: null,
  setReplyingTo: (msg) => set({ replyingTo: msg }),

  isSearchInChatOpen: false,
  setIsSearchInChatOpen: (isOpen) => set({ isSearchInChatOpen: isOpen }),
  inChatSearchQuery: "",
  setInChatSearchQuery: (query) => set({ inChatSearchQuery: query }),

  // ── Wallpapers & Shared Media ─────────────────────────────────────────────
  chatWallpapers: JSON.parse(localStorage.getItem("chatty_wallpapers") || "{}"),
  sharedMedia: [],
  isSharedMediaLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // Clear unread count
      set((state) => ({
        unreadCounts: { ...state.unreadCounts, [userId]: 0 },
      }));
      // Mark messages as read (HTTP + socket)
      try {
        await axiosInstance.put(`/messages/read/${userId}`);
      } catch { /* silent */ }
      const socket = useAuthStore.getState().socket;
      if (socket) socket.emit("markRead", { senderId: userId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    if (!selectedUser) return;
    try {
      const payload = {
        ...messageData,
        replyTo: replyingTo ? {
          messageId: replyingTo._id,
          text: replyingTo.text || (replyingTo.image ? "📷 Image" : replyingTo.fileUrl ? "📎 Attachment" : replyingTo.sticker ? "🎨 Sticker" : ""),
          senderName: replyingTo.senderName || (replyingTo.senderId === selectedUser._id ? (selectedUser.displayName || selectedUser.fullName) : "You"),
        } : null,
      };

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        payload
      );
      set({ messages: [...messages, res.data], replyingTo: null });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return null;
    }
  },

  /** Update a single message's status in the local messages array */
  updateMessageStatus: (messageId, status, extra = {}) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        String(m._id) === String(messageId) ? { ...m, status, ...extra } : m
      ),
    }));
  },

  /** Bulk update status for all messages sent to a specific receiver */
  updateMessagesBulkStatus: (toUserId, status, extra = {}) => {
    const { authUser } = useAuthStore.getState();
    set((state) => ({
      messages: state.messages.map((m) =>
        String(m.senderId) === String(authUser?._id) &&
        String(m.receiverId) === String(toUserId)
          ? { ...m, status, ...extra }
          : m
      ),
    }));
  },

  // ── Delete Actions ────────────────────────────────────────────────────────
  deleteForMe: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete-for-me/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((m) => String(m._id) !== String(messageId)),
      }));
      toast.success("Message deleted for you");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  deleteForEveryone: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/delete-for-everyone/${messageId}`);
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(messageId)
            ? {
                ...m,
                isDeletedForEveryone: true,
                text: "This message was deleted",
                image: "",
                fileUrl: "",
                sticker: "",
              }
            : m
        ),
      }));
      toast.success("Message deleted for everyone");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete for everyone");
    }
  },

  // ── Clear Chat ────────────────────────────────────────────────────────────
  clearChat: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/clear/${userId}`);
      set({ messages: [] });
      toast.success("Chat cleared");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear chat");
    }
  },

  // ── Block / Unblock ───────────────────────────────────────────────────────
  blockUser: async (targetUserId) => {
    try {
      await axiosInstance.put(`/auth/block/${targetUserId}`);
      set((state) => ({
        users: state.users.map((u) =>
          String(u._id) === String(targetUserId) ? { ...u, isBlocked: true } : u
        ),
        selectedUser:
          state.selectedUser && String(state.selectedUser._id) === String(targetUserId)
            ? { ...state.selectedUser, isBlocked: true }
            : state.selectedUser,
      }));
      toast.success("Contact blocked");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block contact");
    }
  },

  unblockUser: async (targetUserId) => {
    try {
      await axiosInstance.put(`/auth/unblock/${targetUserId}`);
      set((state) => ({
        users: state.users.map((u) =>
          String(u._id) === String(targetUserId) ? { ...u, isBlocked: false } : u
        ),
        selectedUser:
          state.selectedUser && String(state.selectedUser._id) === String(targetUserId)
            ? { ...state.selectedUser, isBlocked: false }
            : state.selectedUser,
      }));
      toast.success("Contact unblocked");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock contact");
    }
  },

  // ── Mute / Unmute ─────────────────────────────────────────────────────────
  muteContact: async (contactId, duration) => {
    try {
      await axiosInstance.post(`/auth/mute/${contactId}`, { duration });
      set((state) => ({
        users: state.users.map((u) =>
          String(u._id) === String(contactId) ? { ...u, isMuted: true } : u
        ),
        selectedUser:
          state.selectedUser && String(state.selectedUser._id) === String(contactId)
            ? { ...state.selectedUser, isMuted: true }
            : state.selectedUser,
      }));
      toast.success(`Notifications muted (${duration})`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mute contact");
    }
  },

  unmuteContact: async (contactId) => {
    try {
      await axiosInstance.delete(`/auth/mute/${contactId}`);
      set((state) => ({
        users: state.users.map((u) =>
          String(u._id) === String(contactId) ? { ...u, isMuted: false } : u
        ),
        selectedUser:
          state.selectedUser && String(state.selectedUser._id) === String(contactId)
            ? { ...state.selectedUser, isMuted: false }
            : state.selectedUser,
      }));
      toast.success("Notifications unmuted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unmute contact");
    }
  },

  // ── Wallpaper ─────────────────────────────────────────────────────────────
  setChatWallpaper: async (contactId, wallpaper) => {
    try {
      const res = await axiosInstance.post("/auth/wallpaper", { contactId, wallpaper });
      const updated = { ...get().chatWallpapers, [contactId]: res.data.wallpaper };
      localStorage.setItem("chatty_wallpapers", JSON.stringify(updated));
      set({ chatWallpapers: updated });
      toast.success("Chat wallpaper updated");
    } catch (error) {
      // Fallback to local storage if offline/error
      const updated = { ...get().chatWallpapers, [contactId]: wallpaper };
      localStorage.setItem("chatty_wallpapers", JSON.stringify(updated));
      set({ chatWallpapers: updated });
      toast.success("Chat wallpaper updated locally");
    }
  },

  // ── Shared Media ──────────────────────────────────────────────────────────
  getSharedMedia: async (userId) => {
    set({ isSharedMediaLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/media/${userId}`);
      set({ sharedMedia: res.data });
    } catch {
      set({ sharedMedia: [] });
    } finally {
      set({ isSharedMediaLoading: false });
    }
  },

  // ── Report User ───────────────────────────────────────────────────────────
  reportUser: async (reportedUserId, reason, details) => {
    try {
      const res = await axiosInstance.post("/auth/report", {
        reportedUserId,
        reason,
        details,
      });
      toast.success(res.data.message || "Report submitted successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report");
      return false;
    }
  },

  // ── Socket Subscriptions ──────────────────────────────────────────────────
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      const { selectedUser: current } = get();
      if (String(newMessage.senderId) === String(current?._id)) {
        set({ messages: [...get().messages, newMessage] });
        // Mark as read immediately
        socket.emit("markRead", { senderId: newMessage.senderId });
        axiosInstance.put(`/messages/read/${newMessage.senderId}`).catch(() => {});
      } else {
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [newMessage.senderId]: (state.unreadCounts[newMessage.senderId] || 0) + 1,
          },
        }));
        // Only ring/notify if not muted
        const isMuted = get().users.find((u) => String(u._id) === String(newMessage.senderId))?.isMuted;
        if (!isMuted) {
          toast(`New message`, { icon: "💬" });
        }
      }
    });

    socket.off("messageStatusUpdate");
    socket.on("messageStatusUpdate", ({ messageId, status, deliveredAt }) => {
      get().updateMessageStatus(messageId, status, { deliveredAt });
    });

    socket.off("messagesDelivered");
    socket.on("messagesDelivered", ({ to, deliveredAt }) => {
      get().updateMessagesBulkStatus(to, "delivered", { deliveredAt });
    });

    socket.off("messagesRead");
    socket.on("messagesRead", ({ by, readAt }) => {
      get().updateMessagesBulkStatus(by, "read", { readAt });
    });

    socket.off("messageDeletedForEveryone");
    socket.on("messageDeletedForEveryone", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(messageId)
            ? {
                ...m,
                isDeletedForEveryone: true,
                text: "This message was deleted",
                image: "",
                fileUrl: "",
                sticker: "",
              }
            : m
        ),
      }));
    });

    socket.off("typing");
    socket.on("typing", ({ senderId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: true },
      }));
    });

    socket.off("stopTyping");
    socket.on("stopTyping", ({ senderId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: false },
      }));
    });

    socket.off("userLastSeen");
    socket.on("userLastSeen", ({ userId, lastSeen }) => {
      set((state) => ({
        lastSeenMap: { ...state.lastSeenMap, [userId]: lastSeen },
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("messageStatusUpdate");
    socket?.off("messagesDelivered");
    socket?.off("messagesRead");
    socket?.off("messageDeletedForEveryone");
    socket?.off("typing");
    socket?.off("stopTyping");
    socket?.off("userLastSeen");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser, replyingTo: null, isSearchInChatOpen: false, inChatSearchQuery: "" });
    if (selectedUser) {
      set((state) => ({
        unreadCounts: { ...state.unreadCounts, [selectedUser._id]: 0 },
      }));
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
