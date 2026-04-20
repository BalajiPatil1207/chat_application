import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

import { useEffect } from "react";

function ChatPage() {
  const { activeTab, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="h-[calc(100vh-2rem)] w-full max-w-6xl mx-auto overflow-hidden bg-[#0b141a] md:rounded-xl shadow-2xl flex">
      {/* SIDEBAR - Visible always on desktop, visible on mobile only if no user selected */}
      <div className={`w-full md:w-80 flex-col border-r border-white/5 bg-[#111b21] ${selectedUser ? "hidden md:flex" : "flex"}`}>
        <ProfileHeader />
        <ActiveTabSwitch />

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === "chats" ? <ChatsList /> : <ContactList />}
        </div>
      </div>

      {/* CHAT AREA - Visible always on desktop, visible on mobile only if user selected */}
      <div className={`flex-1 flex flex-col bg-[#0b141a] ${!selectedUser ? "hidden md:flex" : "flex"}`}>
        {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
      </div>
    </div>
  );
}
export default ChatPage;
