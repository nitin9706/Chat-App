import { useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatInfoPanel from "./ChatInfoPanel";

export default function ChatWindow({
  contact,
  messages,
  loadingMessages,
  sendingMessage,
  currentUserId,
  onSend,
  onDeleteMessage,
  onRename,
  onAddMember,
  onRemoveMember,
  onLeave,
  onDelete,
  onToggleSidebar,
}) {
  const [showInfo, setShowInfo] = useState(false);

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="size-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm border border-sky-100">
            💬
          </div>
          <p className="text-gray-600 font-medium">Select a conversation</p>
          <p className="text-sky-400 text-sm mt-1">
            Choose from your contacts on the left
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-w-0 relative">
      {/* Main chat */}
      <div className="flex flex-1 flex-col bg-sky-50 min-w-0">
        <ChatHeader
          contact={contact}
          onToggleInfo={() => setShowInfo((p) => !p)}
          onToggleSidebar={onToggleSidebar}
        />
        <MessageList
          messages={messages}
          loading={loadingMessages}
          onDelete={onDeleteMessage}
          isGroup={contact.isGroup}
        />
        <MessageInput onSend={onSend} sending={sendingMessage} />
      </div>

      {/* Info panel - overlay on mobile */}
      {showInfo && (
        <div className="fixed inset-y-0 right-0 z-40 transform md:relative md:translate-x-0 md:z-auto">
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowInfo(false)}
          />
          <ChatInfoPanel
            contact={contact}
            currentUserId={currentUserId}
            onClose={() => setShowInfo(false)}
            onRename={onRename}
            onAddMember={onAddMember}
            onRemoveMember={onRemoveMember}
            onLeave={onLeave}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}
