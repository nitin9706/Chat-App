export function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString()
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function mapChat(chat, userId) {
  const isGroup = chat.isGroupChat;
  const members = chat.participants || [];
  const other = !isGroup
    ? members.find((member) => member._id?.toString() !== userId?.toString())
    : null;
  return {
    id: chat._id,
    name: isGroup ? chat.name : other?.username || "Unknown",
    avatar: (isGroup ? chat.name || "G" : other?.username || "U")
      .slice(0, 2)
      .toUpperCase(),
    avatarUrl: isGroup ? "" : other?.avatar || "",
    avatarColor: isGroup ? "bg-purple-500" : "bg-violet-400",
    status: other?.status || (isGroup ? "group" : "offline"),
    lastMessage: chat.lastMessage?.content || "",
    lastTime: formatTime(chat.updatedAt),
    unread: chat.unreadCount || 0,
    isGroup,
    members,
    raw: chat,
  };
}

export function mapMessage(message, userId) {
  return {
    id: message._id,
    from:
      message.sender?._id?.toString() === userId?.toString() ? "me" : "them",
    senderName: message.sender?.username || "",
    senderAvatar: message.sender?.avatar || "",
    senderInitials: (message.sender?.username || "?").slice(0, 2).toUpperCase(),
    text: message.content || "",
    attachments: message.attachments || [],
    time: formatTime(message.createdAt),
    raw: message,
  };
}

export const unwrap = (response) => response?.data || response;

export function removeMessage(state, chatId, messageId) {
  state.messages[chatId] = (state.messages[chatId] || []).filter(
    (message) => message.id !== messageId,
  );
}
