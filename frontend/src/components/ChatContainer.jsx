import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto relative bg-[#0b141a]">
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
                  className={`max-w-[85%] rounded-lg px-3 py-1.5 shadow-md relative ${
                    msg.senderId === authUser._id
                      ? "bg-[#005c4b] text-[#e9edef]"
                      : "bg-[#202c33] text-[#e9edef]"
                  }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-md max-h-60 w-full object-cover mb-1" />
                  )}
                  {msg.text && <p className="text-[14.2px] leading-tight whitespace-pre-wrap pr-10">{msg.text}</p>}
                  <p className="text-[10px] opacity-60 absolute bottom-1 right-2 inline-block">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
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
