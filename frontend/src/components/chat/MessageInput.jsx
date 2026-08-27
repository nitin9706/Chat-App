import { useState, useRef } from "react";
import { Send, Paperclip, Smile, X, Loader2 } from "lucide-react";

export default function MessageInput({ onSend, sending }) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  const handleSend = () => {
    if ((!value.trim() && attachments.length === 0) || sending) return;
    onSend(value, attachments);
    setValue("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "24px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (idx) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="px-6 py-4 bg-white border-t border-sky-100">
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-lg text-xs text-sky-700"
            >
              <Paperclip className="size-3 text-sky-400" />
              <span className="max-w-30 truncate">{f.name}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="text-sky-400 hover:text-sky-700 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3 bg-sky-50 border border-sky-100 rounded-2xl px-4 py-2.5 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="text-sky-400 hover:text-sky-600 transition-colors pb-0.5 shrink-0 cursor-pointer"
          title="Attach files"
        >
          <Paperclip className="size-4" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-sky-300 resize-none focus:outline-none leading-relaxed max-h-28 scrollbar-thin"
          style={{ height: "24px" }}
        />

        <div className="flex items-center gap-2 shrink-0 pb-0.5">
          <button className="text-sky-400 hover:text-sky-600 transition-colors cursor-pointer">
            <Smile className="size-4" />
          </button>
          <button
            onClick={handleSend}
            disabled={(!value.trim() && attachments.length === 0) || sending}
            className="size-8 bg-sky-500 disabled:bg-sky-200 rounded-xl flex items-center justify-center text-white transition-all hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed cursor-pointer"
          >
            {sending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-sky-300 mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
