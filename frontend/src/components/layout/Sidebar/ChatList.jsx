import { Loader2, MessageSquare } from "lucide-react";

import ContactItem from "../ContactItem";

export default function ChatList({
  chats,
  activeContactId,
  onSelectContact,
  loading,
}) {
  return (
    <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-1 space-y-0.5">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 text-sky-300 animate-spin" />
        </div>
      ) : chats.length > 0 ? (
        chats.map((chat) => (
          <ContactItem
            key={chat.id}
            contact={chat}
            isActive={chat.id === activeContactId}
            onClick={onSelectContact}
          />
        ))
      ) : (
        <div className="flex flex-col items-center py-12 gap-3 text-center px-4">
          <div className="size-10 bg-sky-50 rounded-xl flex items-center justify-center">
            <MessageSquare className="size-5 text-sky-300" />
          </div>
          <p className="text-sm text-gray-500 font-medium">No chats yet</p>
          <p className="text-xs text-sky-300 leading-relaxed">
            Press <span className="font-semibold">👤+</span> to start a direct
            message or <span className="font-semibold">+</span> to create a
            group
          </p>
        </div>
      )}
    </nav>
  );
}
