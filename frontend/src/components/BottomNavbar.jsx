import { MessageSquare, Users, User, Contact } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function BottomNavbar() {
  const { activeTab, setActiveTab, selectedUser, setSelectedUser, selectedGroup, setSelectedGroup } = useChatStore();

  const tabs = [
    { id: "chats", label: "Chats", icon: MessageSquare },
    { id: "groups", label: "Groups", icon: Users },
    { id: "contacts", label: "Contacts", icon: Contact },
    { id: "settings", label: "Profile", icon: User },
  ];

  if (selectedUser || selectedGroup) return null; // Hide navbar when a chat/group is open on mobile

  return (
    <div className="md:hidden glass-navbar h-16 flex items-center justify-around px-2 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedUser(null);
              setSelectedGroup(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 ${
              isActive ? "text-[var(--accent-color)]" : "text-[var(--text-muted)]"
            }`}
          >
            <div className={`p-1 rounded-full transition-all duration-300 ${
              isActive ? "bg-[var(--accent-color)]/10 shadow-lg shadow-[var(--accent-color)]/5 scale-110" : ""
            }`}>
              <Icon className={`size-6 ${isActive ? "fill-[var(--accent-color)]/10" : ""}`} />
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
              isActive ? "opacity-100 translate-y-0" : "opacity-60"
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default BottomNavbar;
