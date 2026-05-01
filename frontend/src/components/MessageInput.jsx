import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, isSoundEnabled, sendTypingStatus, selectedUser, theme } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });

    // Reset typing status immediately
    sendTypingStatus(false, selectedUser._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setText("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
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

    // Notify typing
    sendTypingStatus(true, selectedUser._id);

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set new timeout to stop typing status after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false, selectedUser._id);
    }, 2000);
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

      <form onSubmit={handleSendMessage} className="flex items-end gap-2 md:gap-2.5 max-w-5xl mx-auto w-full">
        <div className="flex-1 flex items-center gap-1 md:gap-1.5 min-w-0 bg-[var(--bg-elevated)] rounded-[28px] px-2 py-1.5 md:px-4 min-h-[52px] relative shadow-lg ring-1 ring-[var(--border-color)] focus-within:ring-[var(--accent-color)]/30 transition-all">
          <button
            type="button"
            className={`p-2 rounded-full transition-all duration-300 ${showEmojiPicker ? "text-[var(--accent-color)] scale-110" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}
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

          <button
            type="button"
            className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-full transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="size-6" />
          </button>

          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            className="flex-1 bg-transparent border-none text-[var(--text-main)] placeholder-[var(--text-muted)] focus:ring-0 text-[16px] outline-none py-2"
            placeholder="Type a message..."
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="size-[52px] bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white rounded-full flex items-center justify-center transition-all shadow-xl shadow-[var(--accent-color)]/20 active:scale-90 disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-muted)] disabled:shadow-none shrink-0"
        >
          <SendIcon className={`size-5 ml-0.5 transition-transform ${text.trim() || imagePreview ? "translate-x-0.5 -translate-y-0.5 rotate-[45deg]" : ""}`} />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
