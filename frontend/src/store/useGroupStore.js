import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  groupTypingUsers: {}, // { groupId: { userId: bool } }
  groupUnreadCounts: {}, // { groupId: count }

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      set((state) => ({ groups: [res.data, ...state.groups] }));
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      return null;
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
      // Clear unread
      set((state) => ({
        groupUnreadCounts: { ...state.groupUnreadCounts, [groupId]: 0 },
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/send`, messageData);
      set((state) => ({ groupMessages: [...state.groupMessages, res.data] }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const { selectedGroup } = get();

    socket.off("newGroupMessage");
    socket.on("newGroupMessage", ({ message, groupId }) => {
      const { selectedGroup: currentGroup } = get();
      if (currentGroup && String(currentGroup._id) === String(groupId)) {
        set((state) => ({ groupMessages: [...state.groupMessages, message] }));
      } else {
        set((state) => ({
          groupUnreadCounts: {
            ...state.groupUnreadCounts,
            [groupId]: (state.groupUnreadCounts[groupId] || 0) + 1,
          },
        }));
        toast(`New group message`, { icon: "👥" });
      }
    });

    socket.off("newGroup");
    socket.on("newGroup", (group) => {
      set((state) => ({
        groups: [group, ...state.groups.filter((g) => g._id !== group._id)],
      }));
      toast.success(`You were added to group: ${group.name}`);
    });

    // Join socket rooms for all groups
    if (selectedGroup) {
      socket.emit("joinGroup", selectedGroup._id);
    }
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newGroupMessage");
    socket?.off("newGroup");
  },

  setSelectedGroup: (group) => {
    const socket = useAuthStore.getState().socket;
    const { selectedGroup: prevGroup } = get();

    // Leave previous group room
    if (prevGroup && socket) {
      socket.emit("leaveGroup", prevGroup._id);
    }

    set({ selectedGroup: group, groupMessages: [] });

    // Join new group room
    if (group && socket) {
      socket.emit("joinGroup", group._id);
      // Clear unread
      set((state) => ({
        groupUnreadCounts: { ...state.groupUnreadCounts, [group._id]: 0 },
      }));
    }
  },
}));

