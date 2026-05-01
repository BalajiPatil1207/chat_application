import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { CheckCheck } from "lucide-react";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    markMessagesAsSeen,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    markMessagesAsSeen(selectedUser._id);
  }, [selectedUser, getMessagesByUserId, markMessagesAsSeen]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto min-h-0 relative bg-[#0b141a]">
        {/* WhatsApp Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
            backgroundRepeat: "repeat",
            backgroundSize: "400px",
          }}
        />

        <div className="relative z-10 p-4 min-h-full flex flex-col">
          {messages.length > 0 && !isMessagesLoading ? (
            <div className="flex flex-col space-y-2">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex w-full ${msg.senderId === authUser._id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-1.5 shadow-sm relative ${
                    msg.senderId === authUser._id
                      ? "bg-[var(--accent-color)] text-white"
                      : "bg-[var(--bg-elevated)] text-[var(--text-main)]"
                  }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-md max-h-60 w-full object-cover mb-1" />
                  )}
                  {msg.text && <p className="text-[14.2px] leading-tight whitespace-pre-wrap pr-16">{msg.text}</p>}
                  
                  <div className="flex items-center gap-1 absolute bottom-1 right-2">
                    <p className="text-[10px] opacity-60">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    {msg.senderId === authUser._id && (
                      <CheckCheck 
                        className={`size-3.5 ${msg.isSeen ? "text-[#53bdeb]" : "text-slate-400 opacity-60"}`} 
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
        </div>
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
