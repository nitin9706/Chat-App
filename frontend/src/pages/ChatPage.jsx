import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../components/layout/Sidebar/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import ErrorToast from "../components/common/ErrorToast";
import NewChatModal from "../components/modals/NewChatModal";
import CreateGroupModal from "../components/modals/CreateGroupModal";

import { setError, setSearchQuery } from "../store/oneToOneChatSlice";

import {
  setActiveDetails as setGroupDetails,
  setGroupError,
} from "../store/groupChatSlice";

import { forceLogout } from "../store/authSlice";

import {
  deleteChat,
  leaveGroupChat,
  logOut,
  renameGroupChat,
  addMemberToGroup,
  removeMemberFromGroup,
  setUnauthorizedHandler,
} from "../utils/api";

import { leaveChat } from "../utils/socket";
import { mapChat } from "../store/chatUtils";

import ChatController from "./ChatController";

export default function ChatPage({ user }) {
  const dispatch = useDispatch();

  const direct = useSelector((state) => state.oneToOneChats);
  const groups = useSelector((state) => state.groupChats);
  const authError = useSelector((state) => state.auth.error);

  const error = direct.error || groups.error;

  const allChats = [...direct.chats, ...groups.chats];
  const messages = {
    ...direct.messages,
    ...groups.messages,
  };

  const activeChatId = direct.activeChatId || groups.activeChatId;

  const activeContact =
    direct.activeDetails ||
    groups.activeDetails ||
    allChats.find((chat) => chat.id === activeChatId) ||
    null;

  const isGroupChat = (chatId) =>
    allChats.find((chat) => chat.id === chatId)?.isGroup;

  const [showNewChat, setShowNewChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chats = allChats.filter((chat) =>
    chat.name?.toLowerCase().includes(direct.searchQuery.toLowerCase()),
  );

  /*
   * ChatController handles:
   * - loading chats
   * - socket listeners
   * - selecting chats
   * - sending/deleting messages
   * - creating chats/groups
   */
  const { selectContact, send, deleteMsg, createDirect, createGroup } =
    ChatController({
      user,
      allChats,
      messages,
      isGroupChat,
      activeChatId,
    });

  useEffect(() => {
    setUnauthorizedHandler(() => dispatch(forceLogout()));

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [dispatch]);

  const handleSelectContact = async (id) => {
    await selectContact(id);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } finally {
      dispatch(forceLogout());
    }
  };

  const handleRename = async (chatId, name) => {
    await renameGroupChat(chatId, name);
    dispatch({
      type: "groupChats/groupChatUpdated",
      payload: { id: chatId, name },
    });
  };

  const handleLeave = async (chatId) => {
    await leaveGroupChat(chatId);
    leaveChat(chatId);
  };

  const handleDelete = async (chatId) => {
    await deleteChat(chatId);
    leaveChat(chatId);
  };

  const handleAddMember = async (chatId, usernames) => {
    const details = mapChat(
      await addMemberToGroup(chatId, usernames),
      user._id,
    );
    dispatch(setGroupDetails(details));
  };

  const handleRemoveMember = async (chatId, memberId) => {
    const details = mapChat(
      await removeMemberFromGroup(chatId, memberId),
      user._id,
    );
    dispatch(setGroupDetails(details));
  };

  return (
    <ChatContent
      user={user}
      chats={chats}
      activeChatId={activeChatId}
      activeContact={activeContact}
      messages={messages}
      searchQuery={direct.searchQuery}
      loading={direct.loadingChats || groups.loadingChats}
      loadingMessages={direct.loadingMessages || groups.loadingMessages}
      sendingMessage={direct.sendingMessage || groups.sendingMessage}
      sidebarOpen={sidebarOpen}
      showNewChat={showNewChat}
      showCreateGroup={showCreateGroup}
      error={error}
      authError={authError}
      onSelectContact={handleSelectContact}
      onSearchChange={(value) => dispatch(setSearchQuery(value))}
      onNewChat={() => {
        setShowNewChat(true);
        setSidebarOpen(false);
      }}
      onCreateGroup={() => {
        setShowCreateGroup(true);
        setSidebarOpen(false);
      }}
      onLogout={handleLogout}
      onCloseSidebar={() => setSidebarOpen(false)}
      onSend={send}
      onDeleteMessage={deleteMsg}
      onRename={handleRename}
      onLeave={handleLeave}
      onDelete={handleDelete}
      onAddMember={handleAddMember}
      onRemoveMember={handleRemoveMember}
      onToggleSidebar={() => setSidebarOpen(true)}
      onCloseNewChat={() => setShowNewChat(false)}
      onCreateDirect={createDirect}
      onCloseCreateGroup={() => setShowCreateGroup(false)}
      onCreateGroupChat={createGroup}
      onDismissError={() => {
        dispatch(setError(""));
        dispatch(setGroupError(""));
      }}
    />
  );
}

function ChatContent({
  user,
  chats,
  activeChatId,
  activeContact,
  messages,
  searchQuery,
  loading,
  loadingMessages,
  sendingMessage,
  sidebarOpen,
  showNewChat,
  showCreateGroup,
  error,
  authError,
  onSelectContact,
  onSearchChange,
  onNewChat,
  onCreateGroup,
  onLogout,
  onCloseSidebar,
  onSend,
  onDeleteMessage,
  onRename,
  onAddMember,
  onRemoveMember,
  onLeave,
  onDelete,
  onToggleSidebar,
  onCloseNewChat,
  onCreateDirect,
  onCloseCreateGroup,
  onCreateGroupChat,
  onDismissError,
}) {
  const visibleError = error || authError;

  return (
    <main className="h-screen flex overflow-hidden bg-sky-50">
      <div
        className={`${sidebarOpen ? "fixed inset-0 z-30 bg-black/20 md:static md:bg-transparent" : "hidden md:block"}`}
        onClick={sidebarOpen ? onCloseSidebar : undefined}
      >
        <div className="h-full" onClick={(event) => event.stopPropagation()}>
          <Sidebar
            chats={chats}
            activeContactId={activeChatId}
            onSelectContact={onSelectContact}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            loading={loading}
            onNewChat={onNewChat}
            onCreateGroup={onCreateGroup}
            user={user}
            onLogout={onLogout}
            onClose={onCloseSidebar}
          />
        </div>
      </div>

      <ChatWindow
        contact={activeContact}
        messages={messages[activeChatId] || []}
        loadingMessages={loadingMessages}
        sendingMessage={sendingMessage}
        currentUserId={user?._id}
        onSend={onSend}
        onDeleteMessage={onDeleteMessage}
        onRename={onRename}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
        onLeave={onLeave}
        onDelete={onDelete}
        onToggleSidebar={onToggleSidebar}
      />

      {showNewChat && (
        <NewChatModal onClose={onCloseNewChat} onCreate={onCreateDirect} />
      )}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={onCloseCreateGroup}
          onCreate={onCreateGroupChat}
        />
      )}
      {visibleError && (
        <ErrorToast message={visibleError} onDismiss={onDismissError} />
      )}
    </main>
  );
}
