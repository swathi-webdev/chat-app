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
    const { selectedUser, messages } = get();
    if (!selectedUser) return;
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  /** Update a single message's status in the local messages array */
  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        String(m._id) === String(messageId) ? { ...m, status } : m
      ),
    }));
  },

  /** Bulk update status for all messages sent to a specific receiver */
  updateMessagesBulkStatus: (toUserId, status) => {
    const { authUser } = useAuthStore.getState();
    set((state) => ({
      messages: state.messages.map((m) =>
        String(m.senderId) === String(authUser?._id) &&
        String(m.receiverId) === String(toUserId)
          ? { ...m, status }
          : m
      ),
    }));
  },

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
        toast(`New message`, { icon: "💬" });
      }
    });

    // ── Status updates ────────────────────────────────────────────────────
    socket.off("messageStatusUpdate");
    socket.on("messageStatusUpdate", ({ messageId, status }) => {
      get().updateMessageStatus(messageId, status);
    });

    socket.off("messagesDelivered");
    socket.on("messagesDelivered", ({ to }) => {
      // All my messages to 'to' user are now delivered
      get().updateMessagesBulkStatus(to, "delivered");
    });

    socket.off("messagesRead");
    socket.on("messagesRead", ({ by }) => {
      // All my messages to 'by' user are now read
      get().updateMessagesBulkStatus(by, "read");
    });

    // ── Typing ────────────────────────────────────────────────────────────
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

    // ── Last seen ─────────────────────────────────────────────────────────
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
    socket?.off("typing");
    socket?.off("stopTyping");
    socket?.off("userLastSeen");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      set((state) => ({
        unreadCounts: { ...state.unreadCounts, [selectedUser._id]: 0 },
      }));
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
