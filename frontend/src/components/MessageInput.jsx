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

  const { sendMessage, isSoundEnabled, sendTypingStatus, selectedUser } = useChatStore();

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
    <div className="px-4 py-3 bg-[#0b141a]">
      {imagePreview && (
        <div className="mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-[#202c33]"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#111b21] flex items-center justify-center text-[#e9edef] hover:bg-[#202c33]"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#202c33] rounded-[24px] px-4 py-1.5 min-h-[48px] relative">
          <button
            type="button"
            className={`transition-colors ${showEmojiPicker ? "text-[#00a884]" : "text-[#8696a0] hover:text-[#e9edef]"}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="size-6" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-[100%] left-0 mb-4 z-50">
              <EmojiPicker 
                onEmojiClick={onEmojiClick} 
                theme="dark"
                skinTonesDisabled
                searchDisabled={false}
                width={300}
                height={400}
              />
            </div>
          )}

          <button
            type="button"
            className="text-[#8696a0] hover:text-[#e9edef] p-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="size-6" />
          </button>

          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            className="flex-1 bg-transparent border-none text-[#e9edef] placeholder-[#8696a0] focus:ring-0 text-[15px] outline-none"
            placeholder="Type a message"
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
          className="size-[48px] bg-[#00a884] hover:bg-[#06cf9c] text-white rounded-full flex items-center justify-center transition-all shadow-md disabled:bg-[#3b4a54] disabled:text-[#8696a0] shrink-0"
        >
          <SendIcon className="size-5 fill-current" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
