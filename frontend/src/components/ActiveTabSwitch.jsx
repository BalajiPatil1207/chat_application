import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="flex bg-[#202c33]/50 p-1.5 m-3 rounded-xl gap-2 shadow-inner">
      <button
        onClick={() => setActiveTab("chats")}
        className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all ${
          activeTab === "chats" ? "bg-[#00a884]/20 text-[#00a884]" : "text-[#8696a0]"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all ${
          activeTab === "contacts" ? "bg-[#00a884]/20 text-[#00a884]" : "text-[#8696a0]"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
