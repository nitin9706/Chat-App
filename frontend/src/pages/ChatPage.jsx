import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMembers,
  chatDeleted,
  chatReceived,
  chatUpdated,
  createChat,
  createGroup,
  deleteMessage,
  fetchChatDetails,
  fetchChats,
  fetchMessages,
  leaveChatGroup,
  mapChat,
  mapMessage,
  markRead,
  messageDeleted,
  removeChat,
  removeMember,
  receiveMessage,
  renameChat,
  sendMessage,
  setActiveChat,
  setError,
  setSearchQuery,
} from "../store/chatSlice";
import { forceLogout, logout } from "../store/authSlice";
import { getSocket, joinChat } from "../utils/socket";
import { setUnauthorizedHandler } from "../utils/api";
import Sidebar from "../components/layout/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import NewChatModal from "../components/modals/NewChatModal";
import CreateGroupModal from "../components/modals/CreateGroupModal";
import ErrorToast from "../components/common/ErrorToast";

export default function ChatPage({ user }) {
  const dispatch = useDispatch();
  const {
    chats: allChats,
    messages,
    activeChatId,
    activeDetails,
    searchQuery,
    loadingChats,
    loadingMessages,
    sendingMessage,
    error,
  } = useSelector((state) => state.chats);
  const { error: authError } = useSelector((state) => state.auth);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chats = allChats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const activeContact =
    activeDetails || allChats.find((chat) => chat.id === activeChatId) || null;

  useEffect(() => {
    dispatch(fetchChats(user._id));
    const socket = getSocket();
    if (!socket) return undefined;
    const onMessage = (message) =>
      dispatch(
        receiveMessage({
          chatId: message.chatId || message.chat?._id || message.chat,
          message: mapMessage(message, user._id),
        }),
      );
    const onDeleted = ({ messageId, chatId }) =>
      dispatch(messageDeleted({ messageId, chatId }));
    const onNewChat = (chat) => {
      const mapped = mapChat(chat, user._id);
      dispatch(chatReceived(mapped));
      joinChat(mapped.id);
    };
    const onUpdated = (chat) => dispatch(chatUpdated(mapChat(chat, user._id)));
    const onDeletedChat = ({ chatId }) => dispatch(chatDeleted(chatId));
    socket.on("receive_message", onMessage);
    socket.on("message_deleted", onDeleted);
    socket.on("new_chat", onNewChat);
    socket.on("chat_updated", onUpdated);
    socket.on("chat_deleted", onDeletedChat);
    return () => {
      socket.off("receive_message", onMessage);
      socket.off("message_deleted", onDeleted);
      socket.off("new_chat", onNewChat);
      socket.off("chat_updated", onUpdated);
      socket.off("chat_deleted", onDeletedChat);
    };
  }, [dispatch, user._id]);

  useEffect(() => {
    setUnauthorizedHandler(() => dispatch(forceLogout()));
    return () => setUnauthorizedHandler(null);
  }, [dispatch]);
  const selectContact = (id) => {
    dispatch(setActiveChat(id));
    dispatch(markRead(id));
    dispatch(fetchChatDetails({ chatId: id, userId: user._id }));
    if (!messages[id])
      dispatch(fetchMessages({ chatId: id, userId: user._id }));
  };
  const clearErrors = () => {
    dispatch(setError(""));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-sky-50">
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto`}
      >
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar
          chats={chats}
          activeContactId={activeChatId}
          onSelectContact={(id) => {
            selectContact(id);
            setSidebarOpen(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={(value) => dispatch(setSearchQuery(value))}
          loading={loadingChats}
          onNewChat={() => {
            setShowNewChat(true);
            setSidebarOpen(false);
          }}
          onCreateGroup={() => {
            setShowCreateGroup(true);
            setSidebarOpen(false);
          }}
          user={user}
          onLogout={() => dispatch(logout())}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      <ChatWindow
        contact={activeContact}
        messages={messages[activeChatId] || []}
        loadingMessages={loadingMessages}
        sendingMessage={sendingMessage}
        currentUserId={user._id}
        onSend={(content, attachments) =>
          dispatch(
            sendMessage({
              content,
              attachments,
              chatId: activeChatId,
              userId: user._id,
            }),
          )
        }
        onDeleteMessage={(messageId) =>
          dispatch(deleteMessage({ messageId, chatId: activeChatId }))
        }
        onRename={(chatId, name) => dispatch(renameChat({ chatId, name }))}
        onAddMember={(chatId, members) =>
          dispatch(addMembers({ chatId, members, userId: user._id }))
        }
        onRemoveMember={(chatId, memberId) =>
          dispatch(removeMember({ chatId, memberId, userId: user._id }))
        }
        onLeave={(chatId) => dispatch(leaveChatGroup(chatId))}
        onDelete={(chatId) => dispatch(removeChat(chatId))}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreate={(username) =>
            dispatch(createChat({ username, userId: user._id }))
          }
        />
      )}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={(name, members) =>
            dispatch(createGroup({ name, members, userId: user._id }))
          }
        />
      )}
      {(error || authError) && (
        <ErrorToast message={error || authError} onDismiss={clearErrors} />
      )}
    </div>
  );
}
