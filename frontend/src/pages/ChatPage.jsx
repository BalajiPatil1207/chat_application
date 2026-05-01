import { useChatStore } from "../store/useChatStore";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import BottomNavbar from "../components/BottomNavbar";

import { useEffect } from "react";

function ChatPage() {
  const { activeTab, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="h-[100dvh] md:h-[calc(100vh-4rem)] w-full max-w-6xl mx-auto overflow-hidden overflow-x-hidden bg-[var(--bg-main)] md:rounded-2xl shadow-2xl flex flex-col md:flex-row border border-[var(--border-color)]">
      {/* SIDEBAR / MOBILE LIST */}
      <div className={`flex-1 md:flex-none md:w-[380px] flex-col border-r border-[var(--border-color)] bg-[var(--bg-surface)] transition-all duration-300 ${selectedUser ? "hidden md:flex" : "flex"}`}>
        
        {/* DESKTOP HEADER & TABS */}
        <div className="hidden md:block">
          <ProfileHeader />
          <ActiveTabSwitch />
        </div>

        {/* MOBILE HEADER (Conditional based on tab) */}
        <div className="md:hidden">
          {activeTab !== "settings" && <ProfileHeader />}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {activeTab === "settings" ? (
            <div className="md:hidden h-full">
              <ProfileHeader isFullView />
            </div>
          ) : activeTab === "chats" ? (
            <div className="p-2 md:p-4 space-y-1">
              <ChatsList />
            </div>
          ) : (
            <div className="p-2 md:p-4 space-y-1">
              <ContactList />
            </div>
          )}
        </div>

        {/* MOBILE NAVIGATION */}
        <BottomNavbar />
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 flex flex-col bg-[var(--bg-main)] relative min-h-0 ${!selectedUser ? "hidden md:flex" : "flex"}`}>
        {selectedUser ? (
          <ChatContainer />
        ) : (
          <div className="hidden md:flex flex-1 min-h-0">
            <NoConversationPlaceholder />
          </div>
        )}
      </div>
    </div>
  );
}
export default ChatPage;
