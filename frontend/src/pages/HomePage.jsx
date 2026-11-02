import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();

  const hasActiveChat = Boolean(selectedUser || selectedGroup);

  const renderMain = () => {
    if (selectedUser) return <ChatContainer />;
    if (selectedGroup) return <GroupChatContainer />;
    return <NoChatSelected />;
  };

  return (
    <div className="h-[100dvh] bg-base-200 flex flex-col pt-16">
      <div className="flex-1 w-full h-[calc(100dvh-4rem)] bg-base-100 overflow-hidden border-t border-base-300">
        <div className="flex h-full w-full overflow-hidden">
          {/* Sidebar: Always visible on desktop (md+); hidden on mobile if a chat is open */}
          <div
            className={`h-full ${
              hasActiveChat ? "hidden md:flex" : "flex w-full md:w-auto"
            }`}
          >
            <Sidebar />
          </div>

          {/* Main Chat Window: Always visible on desktop (md+); on mobile only if a chat is open */}
          <div
            className={`flex-1 h-full flex flex-col ${
              !hasActiveChat ? "hidden md:flex" : "flex w-full"
            }`}
          >
            {renderMain()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
