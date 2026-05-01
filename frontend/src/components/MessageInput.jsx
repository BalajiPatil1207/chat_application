import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, Smile, Mic, Paperclip, FileText } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import VoiceRecorder from "./VoiceRecorder";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, sendGroupMessage, isSoundEnabled, sendTypingStatus, selectedUser, selectedGroup, theme } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (selectedUser) {
      sendMessage({
        text: text.trim(),
        image: imagePreview,
      });
      // Reset typing status immediately
      sendTypingStatus(false, selectedUser._id);
    } else if (selectedGroup) {
      sendGroupMessage(selectedGroup._id, {
        text: text.trim(),
        image: imagePreview,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setText("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const handleVoiceSend = (base64Audio) => {
    if (selectedUser) {
      sendMessage({
        audio: base64Audio,
      });
    } else if (selectedGroup) {
      sendGroupMessage(selectedGroup._id, {
        audio: base64Audio,
      });
    }
    setShowVoiceRecorder(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const messageData = {
        file: reader.result,
        fileType: file.type,
        text: file.name, // Send filename as text
      };

      if (selectedUser) sendMessage(messageData);
      else if (selectedGroup) sendGroupMessage(selectedGroup._id, messageData);
    };
    reader.readAsDataURL(file);
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (isSoundEnabled) playRandomKeyStrokeSound();

    // Notify typing (Only for individual chats for now)
    if (selectedUser) {
        sendTypingStatus(true, selectedUser._id);

        // Clear previous timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set new timeout to stop typing status after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false, selectedUser._id);
        }, 2000);
    }
  };

  return (
    <div className="px-2 py-3 md:px-4 md:py-4 glass-navbar bg-transparent border-none">
      {imagePreview && (
        <div className="mb-4 flex items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative glass-card p-1.5 rounded-2xl shadow-2xl">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl"
            />
            <button
              onClick={removeImage}
              className="absolute -top-3 -right-3 size-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-90 transition-all"
              type="button"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>
      )}

      {showVoiceRecorder ? (
        <div className="max-w-5xl mx-auto w-full">
          <VoiceRecorder 
            onSend={handleVoiceSend} 
            onCancel={() => setShowVoiceRecorder(false)} 
          />
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 md:gap-2.5 max-w-5xl mx-auto w-full">
          <div className="flex-1 flex items-center gap-1 md:gap-1.5 min-w-0 bg-[var(--bg-elevated)] rounded-[28px] px-2 py-1.5 md:px-4 min-h-[52px] relative shadow-lg ring-1 ring-[var(--border-color)] focus-within:ring-[var(--accent-color)]/30 transition-all">
            <button
              type="button"
              className={`p-2 shrink-0 transition-all duration-300 ${showEmojiPicker ? "text-[var(--accent-color)] scale-110" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="size-6" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-[110%] left-0 z-50 animate-in fade-in zoom-in-95 duration-200 origin-bottom-left">
                <div className="shadow-2xl rounded-2xl overflow-hidden glass-card border-none">
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick} 
                    theme={theme === "dark" ? "dark" : "light"}
                    skinTonesDisabled
                    searchDisabled={false}
                    width={320}
                    height={400}
                  />
                </div>
              </div>
            )}

            <input
              type="text"
              value={text}
              onChange={handleInputChange}
              className="flex-1 bg-transparent border-none text-[var(--text-main)] placeholder-[var(--text-muted)] focus:ring-0 text-[16px] outline-none py-2 min-w-0"
              placeholder="Type a message..."
            />

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              ref={docInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Attachment Icons Group - Hide on mobile when typing */}
            <div className={`flex items-center gap-0.5 md:gap-1 ${text.trim() ? "hidden md:flex" : "flex"}`}>
              <button
                type="button"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-full transition-all shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="size-5 md:size-6" />
              </button>

              <button
                type="button"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-full transition-all shrink-0"
                onClick={() => docInputRef.current?.click()}
              >
                <Paperclip className="size-5 md:size-6" />
              </button>
            </div>
          </div>

          {text.trim() || imagePreview ? (
            <button
              type="submit"
              className="size-[52px] bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white rounded-full flex items-center justify-center transition-all shadow-xl shadow-[var(--accent-color)]/20 active:scale-90 shrink-0"
            >
              <SendIcon className="size-5 ml-0.5 rotate-[45deg] translate-x-0.5 -translate-y-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(true)}
              className="size-[52px] bg-[var(--bg-elevated)] hover:bg-[var(--accent-color)]/10 text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-full flex items-center justify-center transition-all ring-1 ring-[var(--border-color)] active:scale-90 shrink-0"
            >
              <Mic className="size-6" />
            </button>
          )}
        </form>
      )}
    </div>
  );
}
export default MessageInput;
