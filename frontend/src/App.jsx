import { useState, useEffect, useRef } from "react";
import { AlertCircle, FastForward, X } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useChat } from "./hooks/useChat";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import NewChatModal from "./components/NewChatModal";
import CreateGroupModal from "./components/CreateGroupModal";
import LoginPage from "./pages/LoginPage";

// import { refreshAccessToken } from "./utils/api.js";

function ErrorToast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-red-100 text-red-500 text-sm px-4 py-3 rounded-2xl shadow-lg shadow-red-50 max-w-sm w-[calc(100%-2rem)]">
      <AlertCircle className="size-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-red-300 hover:text-red-500 cursor-pointer"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export default function App() {
  const { user, logout } = useAuth();
  const [showNewChat, setShowNewChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const {
    chats,
    activeContact,
    activeMessages,
    activeContactId,
    searchQuery,
    setSearchQuery,
    loadingChats,
    loadingMessages,
    sendingMessage,
    error,
    setError,
    sendMessage,
    deleteMessage,
    selectContact,
    startOneToOneChat,
    startGroupChat,
    renameGroup,
    addMember,
    removeMember,
    leaveGroup,
    removeChat,
  } = useChat(user?._id);

  useRef(() => {
    refreshAccessToken;
  });
  if (!user) return <LoginPage />;
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-sky-50">
      <Sidebar
        chats={chats}
        activeContactId={activeContactId}
        onSelectContact={selectContact}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loadingChats}
        onNewChat={() => setShowNewChat(true)}
        onCreateGroup={() => setShowCreateGroup(true)}
        user={user}
        onLogout={logout}
      />

      <ChatWindow
        contact={activeContact}
        messages={activeMessages}
        loadingMessages={loadingMessages}
        sendingMessage={sendingMessage}
        currentUserId={user?._id}
        onSend={sendMessage}
        onDeleteMessage={deleteMessage}
        onRename={renameGroup}
        onAddMember={addMember}
        onRemoveMember={removeMember}
        onLeave={leaveGroup}
        onDelete={removeChat}
      />

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreate={startOneToOneChat}
        />
      )}

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={startGroupChat}
        />
      )}

      {error && <ErrorToast message={error} onDismiss={() => setError("")} />}
    </div>
  );
}
