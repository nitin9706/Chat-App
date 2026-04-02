import { useState, useCallback, useEffect, useRef } from "react";
import {
  getUserChats,
  getAllMessages,
  sendMessage as apiSendMessage,
  deleteMessage as apiDeleteMessage,
  createOneToOneChat,
  createGroupChat,
  renameGroupChat as apiRenameGroup,
  addMemberToGroup as apiAddMember,
  removeMemberFromGroup as apiRemoveMember,
  leaveGroupChat as apiLeaveGroup,
  deleteChat as apiDeleteChat,
  getChatById,
} from "../utils/api";
import { getSocket, joinChat, leaveChat } from "../utils/socket";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// Backend uses "participants" not "members"
function mapChat(chat, currentUserId) {
  const isGroup = chat.isGroupChat;
  const participants = chat.participants || [];
  const other = !isGroup
    ? participants.find((p) => p._id?.toString() !== currentUserId?.toString())
    : null;

  return {
    id: chat._id,
    name: isGroup ? chat.name : other?.username || "Unknown",
    avatar: isGroup
      ? (chat.name || "G").slice(0, 2).toUpperCase()
      : (other?.username || "U").slice(0, 2).toUpperCase(),
    avatarUrl: isGroup ? "" : other?.avatar || "",
    avatarColor: isGroup ? "bg-purple-500" : "bg-violet-400",
    status: other?.status || (isGroup ? "group" : "offline"),
    lastMessage: chat.lastMessage?.content || "",
    lastTime: formatTime(chat.updatedAt),
    unread: chat.unreadCount || 0,
    isGroup,
    // keep participants as the raw array for ChatInfoPanel member list
    members: participants,
    raw: chat,
  };
}

function mapMessage(msg, currentUserId) {
  return {
    id: msg._id,
    from:
      msg.sender?._id?.toString() === currentUserId?.toString() ? "me" : "them",
    senderName: msg.sender?.username || "",
    senderAvatar: msg.sender?.avatar || "",
    senderInitials: (msg.sender?.username || "?").slice(0, 2).toUpperCase(),
    text: msg.content || "",
    attachments: msg.attachments || [],
    time: formatTime(msg.createdAt),
    raw: msg,
  };
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useChat(currentUserId) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeContactId, setActiveContactId] = useState(null);
  const [activeContactDetails, setActiveContactDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const activeContactIdRef = useRef(activeContactId);

  useEffect(() => {
    activeContactIdRef.current = activeContactId;
  }, [activeContactId]);

  // ── Fetch all chats ──────────────────────────────────────────────────────
  const fetchChats = useCallback(async () => {
    if (!currentUserId) return;
    setLoadingChats(true);
    setError("");
    try {
      const res = await getUserChats();
      // ApiResponse wrapper: res.data is the array
      const raw = res?.data || res || [];
      const list = (Array.isArray(raw) ? raw : []).map((c) =>
        mapChat(c, currentUserId),
      );
      setChats(list);
      if (list.length > 0) {
        setActiveContactId((prev) => prev || list[0].id);
      }
      // Join all chat rooms on socket
      list.forEach((c) => joinChat(c.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingChats(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) fetchChats();
  }, [currentUserId, fetchChats]);

  // ── Fetch messages ───────────────────────────────────────────────────────
  const fetchMessages = useCallback(
    async (chatId, page = 1) => {
      if (!chatId) return;
      setLoadingMessages(true);
      try {
        const res = await getAllMessages(chatId, page);
        // ApiResponse: res.data = { messages: [], pagination: {} }
        const raw = res?.data?.messages || res?.messages || res?.data || [];
        const list = (Array.isArray(raw) ? raw : []).map((m) =>
          mapMessage(m, currentUserId),
        );
        setMessages((prev) => ({ ...prev, [chatId]: list }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingMessages(false);
      }
    },
    [currentUserId],
  );

  useEffect(() => {
    if (activeContactId && !messages[activeContactId]) {
      fetchMessages(activeContactId);
    }
  }, [activeContactId, fetchMessages]);

  // ── Socket real-time events ──────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const socket = getSocket();
    if (!socket) return;

    // New message received
    const onReceiveMessage = (msg) => {
      const chatId = msg.chatId || msg.chat?._id || msg.chat;
      const mapped = mapMessage(msg, currentUserId);
      setMessages((prev) => {
        const existing = prev[chatId] || [];
        // avoid duplicate if message already exists
        if (existing.some((m) => m.id === mapped.id)) return prev;
        return { ...prev, [chatId]: [...existing, mapped] };
      });
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                lastMessage: msg.content || "📎",
                lastTime: formatTime(msg.createdAt),
              }
            : c,
        ),
      );
    };

    // Message deleted by someone else
    const onMessageDeleted = ({ messageId, chatId }) => {
      setMessages((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).filter((m) => m.id !== messageId),
      }));
    };

    // New chat created (e.g. someone started a chat with current user)
    const onNewChat = (chat) => {
      const mapped = mapChat(chat, currentUserId);
      setChats((prev) => {
        if (prev.find((c) => c.id === mapped.id)) return prev;
        joinChat(mapped.id);
        return [mapped, ...prev];
      });
    };

    // Group updated (rename, add/remove member)
    const onChatUpdated = (updatedChat) => {
      const targetChatId = updatedChat?._id || updatedChat?.chatId;
      if (!targetChatId) return;

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== targetChatId) return c;

          if (!updatedChat.participants && !updatedChat.isGroupChat) {
            return {
              ...c,
              ...(updatedChat.name ? { name: updatedChat.name } : {}),
            };
          }

          return mapChat(updatedChat, currentUserId);
        }),
      );
    };

    // Chat deleted
    const onChatDeleted = ({ chatId }) => {
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeContactIdRef.current === chatId) setActiveContactId(null);
    };

    // User came online/offline
    const onUserOnline = ({ userId }) => {
      setChats((prev) =>
        prev.map((c) => {
          const other = c.members?.find((m) => m._id?.toString() === userId);
          return other && !c.isGroup ? { ...c, status: "online" } : c;
        }),
      );
    };
    const onUserOffline = ({ userId }) => {
      setChats((prev) =>
        prev.map((c) => {
          const other = c.members?.find((m) => m._id?.toString() === userId);
          return other && !c.isGroup ? { ...c, status: "offline" } : c;
        }),
      );
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("message_deleted", onMessageDeleted);
    socket.on("new_chat", onNewChat);
    socket.on("chat_updated", onChatUpdated);
    socket.on("chat_deleted", onChatDeleted);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);

    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("message_deleted", onMessageDeleted);
      socket.off("new_chat", onNewChat);
      socket.off("chat_updated", onChatUpdated);
      socket.off("chat_deleted", onChatDeleted);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
    };
  }, [currentUserId]);

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content, attachments = []) => {
      if (!content?.trim() && attachments.length === 0) return;
      if (!activeContactId) {
        setError("Please select a chat before sending a message");
        return;
      }
      setSendingMessage(true);

      const optimisticId = `tmp_${Date.now()}`;
      const optimistic = {
        id: optimisticId,
        from: "me",
        text: content,
        senderName: "",
        senderAvatar: "",
        senderInitials: "",
        attachments: attachments.map((f) => ({
          url: URL.createObjectURL(f),
          name: f.name,
        })),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        pending: true,
      };

      setMessages((prev) => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), optimistic],
      }));
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                lastMessage: content || "📎 Attachment",
                lastTime: "Just now",
              }
            : c,
        ),
      );

      try {
        const res = await apiSendMessage(content, activeContactId, attachments);
        // res.data is the chatMessageCreated object
        const saved = mapMessage(res?.data || res, currentUserId);
        setMessages((prev) => {
          const existing = prev[activeContactId] || [];
          const updated = existing.filter(
            (m) => m.id !== optimisticId && m.id !== saved.id,
          );
          return {
            ...prev,
            [activeContactId]: [...updated, { ...saved, pending: false }],
          };
        });
      } catch (err) {
        setError(err.message);
        setMessages((prev) => ({
          ...prev,
          [activeContactId]: (prev[activeContactId] || []).map((m) =>
            m.id === optimisticId ? { ...m, failed: true, pending: false } : m,
          ),
        }));
      } finally {
        setSendingMessage(false);
      }
    },
    [activeContactId, currentUserId],
  );

  // ── Delete message ───────────────────────────────────────────────────────
  const deleteMessage = useCallback(
    async (messageId) => {
      // optimistic remove
      setMessages((prev) => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).filter(
          (m) => m.id !== messageId,
        ),
      }));
      try {
        await apiDeleteMessage(messageId);
      } catch (err) {
        setError(err.message);
        fetchMessages(activeContactId); // rollback
      }
    },
    [activeContactId, fetchMessages],
  );

  // ── Fetch chat details ───────────────────────────────────────────────────
  const fetchChatDetails = useCallback(
    async (id) => {
      if (!id) return;
      try {
        const res = await getChatById(id);
        const chat = mapChat(res?.data || res, currentUserId);
        setActiveContactDetails(chat);
      } catch (err) {
        setError("Failed to fetch chat details");
      }
    },
    [currentUserId],
  );

  // ── Select contact ───────────────────────────────────────────────────────
  const selectContact = useCallback(
    (id) => {
      if (!id) return;
      setActiveContactId(id);
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
      );
      if (!messages[id]) fetchMessages(id);
      fetchChatDetails(id);
    },
    [messages, fetchMessages, fetchChatDetails],
  );

  // ── Create 1-to-1 chat (backend expects { username }) ────────────────────
  const startOneToOneChat = useCallback(
    async (username) => {
      try {
        const res = await createOneToOneChat(username);
        const chat = mapChat(res?.data || res, currentUserId);
        setChats((prev) => {
          if (prev.find((c) => c.id === chat.id)) return prev;
          joinChat(chat.id);
          return [chat, ...prev];
        });
        setActiveContactId(chat.id);
        return chat;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [currentUserId],
  );

  // ── Create group chat ────────────────────────────────────────────────────
  const startGroupChat = useCallback(
    async (name, userIds) => {
      try {
        const res = await createGroupChat(name, userIds);
        const chat = mapChat(res?.data || res, currentUserId);
        setChats((prev) => [chat, ...prev]);
        joinChat(chat.id);
        setActiveContactId(chat.id);
        return chat;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [currentUserId],
  );

  // ── Rename group (backend expects { newName }) ───────────────────────────
  const renameGroup = useCallback(async (chatId, newName) => {
    try {
      await apiRenameGroup(chatId, newName);
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, name: newName } : c)),
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ── Add members ──────────────────────────────────────────────────────────
  const addMember = useCallback(
    async (chatId, members) => {
      try {
        const res = await apiAddMember(chatId, members);
        const updated = mapChat(res?.data || res, currentUserId);
        setChats((prev) => prev.map((c) => (c.id === chatId ? updated : c)));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [currentUserId],
  );

  // ── Remove member (backend expects single memberId string) ───────────────
  const removeMember = useCallback(
    async (chatId, memberId) => {
      try {
        const res = await apiRemoveMember(chatId, memberId);
        const updated = mapChat(res?.data || res, currentUserId);
        setChats((prev) => prev.map((c) => (c.id === chatId ? updated : c)));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [currentUserId],
  );

  // ── Leave group ──────────────────────────────────────────────────────────
  const leaveGroup = useCallback(
    async (chatId) => {
      try {
        await apiLeaveGroup(chatId);
        leaveChat(chatId);
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (activeContactId === chatId) setActiveContactId(null);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [activeContactId],
  );

  // ── Delete chat ──────────────────────────────────────────────────────────
  const removeChat = useCallback(
    async (chatId) => {
      try {
        await apiDeleteChat(chatId);
        leaveChat(chatId);
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (activeContactId === chatId) setActiveContactId(null);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [activeContactId],
  );

  return {
    chats: chats.filter((c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    activeContact:
      activeContactDetails ||
      chats.find((c) => c.id === activeContactId) ||
      null,
    activeMessages: messages[activeContactId] || [],
    activeContactId,
    searchQuery,
    setSearchQuery,
    loadingChats,
    loadingMessages,
    sendingMessage,
    error,
    setError,
    fetchChats,
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
  };
}
