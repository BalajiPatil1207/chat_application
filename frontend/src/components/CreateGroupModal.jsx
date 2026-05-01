import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, UserPlus, Image as ImageIcon, Loader2 } from "lucide-react";

const CreateGroupModal = ({ onClose }) => {
  const { allContacts, getAllContacts, createGroup } = useChatStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setGroupAvatar(reader.result);
    };
  };

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectedMembers.length === 0) return;

    setIsSubmitting(true);
    await createGroup({
      name,
      description,
      members: selectedMembers,
      groupAvatar,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-surface)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[var(--border-color)]">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[var(--accent-color)]" />
            <h3 className="font-bold text-lg text-[var(--text-main)]">Create New Group</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors text-[var(--text-muted)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img
                src={groupAvatar || "/avatar.png"}
                alt="Group Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-[var(--accent-color)]/20"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-[var(--accent-color)] rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                <ImageIcon className="w-4 h-4 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Group Profile Picture</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[var(--text-muted)]">Group Name</label>
            <input
              type="text"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all"
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[var(--text-muted)]">Description (Optional)</label>
            <textarea
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 transition-all h-20 resize-none"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[var(--text-muted)]">Select Members ({selectedMembers.length})</label>
            <div className="max-h-40 overflow-y-auto space-y-2 border border-[var(--border-color)] rounded-xl p-2 bg-[var(--bg-elevated)]/50 custom-scrollbar">
              {allContacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => toggleMember(contact._id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    selectedMembers.includes(contact._id) 
                      ? "bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30" 
                      : "hover:bg-[var(--bg-surface)] border border-transparent"
                  }`}
                >
                  <img
                    src={contact.profilePic || "/avatar.png"}
                    alt={contact.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-[var(--border-color)]"
                  />
                  <span className={`text-sm font-medium ${selectedMembers.includes(contact._id) ? "text-[var(--accent-color)]" : "text-[var(--text-main)]"}`}>
                    {contact.fullName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className={`w-full py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-bold shadow-lg shadow-[var(--accent-color)]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={isSubmitting || !name || selectedMembers.length === 0}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
