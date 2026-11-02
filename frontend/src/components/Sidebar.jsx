import { useEffect, useState, useRef, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";
import { Users, UserPlus, Search, X, Plus, MessageSquare, BellOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import AddContactModal from "./AddContactModal";
import CreateGroupModal from "./CreateGroupModal";

// Clamp helper
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadCounts } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const { getGroups, groups, selectedGroup, setSelectedGroup, groupUnreadCounts } = useGroupStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");

  // ─── Draggable sidebar width ─────────────────────────────────────────────
  const MIN_WIDTH = 72;   // collapsed icon-only width (matches w-20 = 80px, use 72 so it's snug)
  const MAX_WIDTH = 420;
  const DEFAULT_WIDTH = 288; // lg:w-72
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);
  const dragHandleRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    if (dragHandleRef.current) dragHandleRef.current.classList.add("dragging");
  }, [sidebarWidth]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      setSidebarWidth(clamp(startWidth.current + delta, MIN_WIDTH, MAX_WIDTH));
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (dragHandleRef.current) dragHandleRef.current.classList.remove("dragging");
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Collapsed = below 140 px  → icon-only mode
  const isCollapsed = sidebarWidth < 140;

  // ─── Load data ───────────────────────────────────────────────────────────
  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  // ─── Filter contacts ─────────────────────────────────────────────────────
  const filteredUsers = users.filter((user) => {
    const name = (user.displayName || user.fullName).toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      name.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.contactNo || "").includes(searchQuery);
    const matchesOnline = !showOnlineOnly || onlineUsers.includes(user._id);
    return matchesSearch && matchesOnline;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="h-full border-r border-base-300 flex flex-col relative shrink-0 w-full md:w-auto"
        style={{
          width: window.innerWidth >= 768 ? sidebarWidth : "100%",
          transition: isDragging.current ? "none" : "width 0.08s ease",
        }}
      >
        {/* ── Drag handle ─────────────────────────────────────────────── */}
        <div
          ref={dragHandleRef}
          className="sidebar-drag-handle hidden md:block"
          onMouseDown={onMouseDown}
          title="Drag to resize"
        />

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="border-b border-base-300 w-full p-4">
          {/* Row 1 – Icon, title, action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="size-6 shrink-0" />
              {!isCollapsed && (
                <span className="font-medium truncate">Contacts</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowAddContact(true)}
                  className="btn btn-ghost btn-xs btn-circle"
                  title="Add Contact"
                >
                  <UserPlus className="size-4" />
                </button>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="btn btn-ghost btn-xs btn-circle"
                  title="Create Group"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* Row 2 – Search bar (hidden when collapsed) */}
          {!isCollapsed && (
            <>
              <div className="mt-3 relative flex items-center">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered input-sm w-full pl-8 pr-8"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="size-3 text-base-content/40 hover:text-base-content transition-colors" />
                  </button>
                )}
              </div>

              {/* Row 3 – Online toggle */}
              <div className="mt-2 flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOnlineOnly}
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="text-sm">Online Only</span>
                </label>
                <span className="text-xs text-zinc-500">
                  ({Math.max(0, onlineUsers.length - 1)}) online
                </span>
              </div>

              {/* Row 4 – Contacts / Groups tabs */}
              <div className="mt-3 flex border border-base-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveTab("contacts")}
                  className={`flex-1 py-1 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                    activeTab === "contacts"
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <Users className="size-3" />
                  Contacts
                </button>
                <button
                  onClick={() => setActiveTab("groups")}
                  className={`flex-1 py-1 text-xs font-medium transition-colors flex items-center justify-center gap-1 relative ${
                    activeTab === "groups"
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <MessageSquare className="size-3" />
                  Groups
                  {Object.values(groupUnreadCounts).some((c) => c > 0) && (
                    <span className="absolute top-0.5 right-1 size-2 bg-error rounded-full" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Contact / Group list ─────────────────────────────────────── */}
        <div className="overflow-y-auto w-full py-3 flex-1">

          {/* ── CONTACTS TAB ── */}
          {activeTab === "contacts" && (
            <>
              {filteredUsers.length === 0 && (
                <div className="text-center text-zinc-500 py-8 px-3 space-y-2">
                  {searchQuery ? (
                    <p className="text-sm">No match for &quot;{searchQuery}&quot;</p>
                  ) : showOnlineOnly ? (
                    <p className="text-sm">No online contacts</p>
                  ) : (
                    <>
                      <p className="text-sm">No contacts yet</p>
                      {!isCollapsed && (
                        <button
                          onClick={() => setShowAddContact(true)}
                          className="btn btn-primary btn-xs gap-1 mx-auto"
                        >
                          <UserPlus className="size-3" /> Add Contact
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {filteredUsers.map((user, idx) => {
                const unread = unreadCounts[user._id] || 0;
                const displayName = user.displayName || user.fullName;
                const isOnline = onlineUsers.includes(user._id);

                return (
                  <button
                    key={user._id}
                    onClick={() => { setSelectedUser(user); setSelectedGroup(null); }}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                      selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
                    }`}
                    style={{
                      animation: `contact-item-in 0.2s ease-out ${idx * 30}ms both`,
                    }}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 mx-auto" style={{ width: isCollapsed ? "auto" : undefined }}>
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={displayName}
                        className="size-12 object-cover rounded-full"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                      )}
                    </div>

                    {/* Text info – only when expanded */}
                    {!isCollapsed && (
                      <div className="flex flex-1 text-left min-w-0 items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-1.5">
                            <span className="truncate">{displayName}</span>
                            {user.isMuted && <BellOff className="size-3 text-zinc-400 shrink-0" title="Muted" />}
                            {user.isBlocked && <span className="badge badge-error badge-xs">Blocked</span>}
                          </div>
                          {user.contactNo ? (
                            <div className="text-xs text-zinc-500 truncate">{user.contactNo}</div>
                          ) : (
                            <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                          )}
                          <div className="text-sm text-zinc-400">
                            {isOnline ? "Online" : "Offline"}
                          </div>
                        </div>
                        {unread > 0 && (
                          <span className="badge badge-primary badge-sm shrink-0 ml-2">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {/* ── GROUPS TAB ── */}
          {activeTab === "groups" && (
            <>
              {groups.length === 0 && (
                <div className="text-center text-zinc-500 py-8 px-3 space-y-2">
                  <p className="text-sm">No groups yet</p>
                  {!isCollapsed && (
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="btn btn-primary btn-xs gap-1 mx-auto"
                    >
                      <Plus className="size-3" /> Create Group
                    </button>
                  )}
                </div>
              )}

              {groups.map((group, idx) => {
                const unread = groupUnreadCounts[group._id] || 0;
                return (
                  <button
                    key={group._id}
                    onClick={() => { setSelectedGroup(group); setSelectedUser(null); }}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                      selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""
                    }`}
                    style={{
                      animation: `contact-item-in 0.2s ease-out ${idx * 30}ms both`,
                    }}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={group.groupPic || "/avatar.png"}
                        alt={group.name}
                        className="size-12 object-cover rounded-full"
                      />
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-1 text-left min-w-0 items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-1">
                            <Users className="size-3 text-primary shrink-0" />
                            {group.name}
                          </div>
                          <div className="text-xs text-zinc-500 truncate">
                            {group.members?.length} members
                          </div>
                          {group.lastMessage && (
                            <div className="text-xs text-zinc-400 truncate">
                              {group.lastMessage}
                            </div>
                          )}
                        </div>
                        {unread > 0 && (
                          <span className="badge badge-primary badge-sm shrink-0 ml-2">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </aside>

      {/* ─── Modals ──────────────────────────────────────────────────────── */}
      {showAddContact && <AddContactModal onClose={() => setShowAddContact(false)} />}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={(newGroup) => {
            setActiveTab("groups");
            setSelectedGroup(newGroup);
            setSelectedUser(null);
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
