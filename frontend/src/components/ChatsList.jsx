import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, unreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between border border-transparent ${
            selectedUser?._id === chat._id ? "bg-[#2a3942] border-white/5" : "hover:bg-[#202c33]"
          }`}
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
          </div>

          {/* Unread Count Badge */}
          {unreadCounts[chat._id] > 0 && (
            <div className="bg-[#00a884] text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-sm">
              {unreadCounts[chat._id]}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
export default ChatsList;
