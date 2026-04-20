import { XIcon, ArrowLeft, Phone, Video } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { handleCallUser } = useCallStore();
  const isOnline = onlineUsers.includes(selectedUser?._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  if (!selectedUser) return null;

  return (
    <div
      className="flex justify-between items-center bg-[#202c33] border-b
   border-white/5 min-h-[70px] px-4"
    >
      <div className="flex items-center space-x-3">
        {/* Mobile Back Button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{selectedUser.fullName}</h3>
          <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Call Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleCallUser(selectedUser._id, "audio")}
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-cyan-500 transition-colors"
            title="Audio Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleCallUser(selectedUser._id, "video")}
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-cyan-500 transition-colors"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
        </div>

        <button onClick={() => setSelectedUser(null)}>
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
