import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addMemberToGroup,
  createGroupChat,
  createOneToOneChat,
  deleteChat,
  deleteMessage as apiDeleteMessage,
  getAllMessages,
  getChatById,
  getUserChats,
  leaveGroupChat,
  removeMemberFromGroup,
  renameGroupChat,
  sendMessage as apiSendMessage,
} from "../utils/api";
import { joinChat, leaveChat } from "../utils/socket";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString()
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}
function mapChat(chat, userId) {
  const group = chat.isGroupChat;
  const members = chat.participants || [];
  const other = !group
    ? members.find((p) => p._id?.toString() !== userId?.toString())
    : null;
  return {
    id: chat._id,
    name: group ? chat.name : other?.username || "Unknown",
    avatar: (group ? chat.name || "G" : other?.username || "U")
      .slice(0, 2)
      .toUpperCase(),
    avatarUrl: group ? "" : other?.avatar || "",
    avatarColor: group ? "bg-purple-500" : "bg-violet-400",
    status: other?.status || (group ? "group" : "offline"),
    lastMessage: chat.lastMessage?.content || "",
    lastTime: formatTime(chat.updatedAt),
    unread: chat.unreadCount || 0,
    isGroup: group,
    members,
    raw: chat,
  };
}
function mapMessage(message, userId) {
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
const unwrap = (response) => response?.data || response;

const initialState = {
  chats: [],
  messages: {},
  activeChatId: null,
  activeDetails: null,
  searchQuery: "",
  loadingChats: false,
  loadingMessages: false,
  sendingMessage: false,
  error: "",
};

export const fetchChats = createAsyncThunk("chats/fetch", async (userId) => {
  const raw = unwrap(await getUserChats());
  return (Array.isArray(raw) ? raw : []).map((chat) => mapChat(chat, userId));
});
export const fetchMessages = createAsyncThunk(
  "chats/fetchMessages",
  async ({ chatId, userId }) => {
    const response = await getAllMessages(chatId, 1);
    const raw =
      response?.data?.messages || response?.messages || response?.data || [];
    return {
      chatId,
      messages: (Array.isArray(raw) ? raw : []).map((message) =>
        mapMessage(message, userId),
      ),
    };
  },
);
export const fetchChatDetails = createAsyncThunk(
  "chats/details",
  async ({ chatId, userId }) =>
    mapChat(unwrap(await getChatById(chatId)), userId),
);
export const createChat = createAsyncThunk(
  "chats/create",
  async ({ username, userId }) =>
    mapChat(unwrap(await createOneToOneChat(username)), userId),
);
export const createGroup = createAsyncThunk(
  "chats/createGroup",
  async ({ name, members, userId }) =>
    mapChat(unwrap(await createGroupChat(name, members)), userId),
);
export const sendMessage = createAsyncThunk(
  "chats/sendMessage",
  async ({ content, chatId, attachments, userId }) => {
    const saved = mapMessage(
      unwrap(await apiSendMessage(content, chatId, attachments)),
      userId,
    );
    return { chatId, message: saved, preview: content || "📎 Attachment" };
  },
);
export const deleteMessage = createAsyncThunk(
  "chats/deleteMessage",
  async ({ messageId, chatId }) => {
    await apiDeleteMessage(messageId);
    return { messageId, chatId };
  },
);
export const renameChat = createAsyncThunk(
  "chats/rename",
  async ({ chatId, name }) => {
    await renameGroupChat(chatId, name);
    return { chatId, name };
  },
);
export const addMembers = createAsyncThunk(
  "chats/addMembers",
  async ({ chatId, members, userId }) =>
    mapChat(unwrap(await addMemberToGroup(chatId, members)), userId),
);
export const removeMember = createAsyncThunk(
  "chats/removeMember",
  async ({ chatId, memberId, userId }) =>
    mapChat(unwrap(await removeMemberFromGroup(chatId, memberId)), userId),
);
export const removeChat = createAsyncThunk("chats/remove", async (chatId) => {
  await deleteChat(chatId);
  leaveChat(chatId);
  return chatId;
});
export const leaveChatGroup = createAsyncThunk(
  "chats/leave",
  async (chatId) => {
    await leaveGroupChat(chatId);
    leaveChat(chatId);
    return chatId;
  },
);

const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
      state.activeDetails = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    markRead: (state, action) => {
      const chat = state.chats.find((item) => item.id === action.payload);
      if (chat) chat.unread = 0;
    },
    receiveMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const list = state.messages[chatId] || [];
      if (!list.some((item) => item.id === message.id)) list.push(message);
      const chat = state.chats.find((item) => item.id === chatId);
      if (chat) {
        chat.lastMessage = message.text || "📎";
        chat.lastTime = message.time;
      }
    },
    messageDeleted: (state, action) => {
      const { chatId, messageId } = action.payload;
      state.messages[chatId] = (state.messages[chatId] || []).filter(
        (item) => item.id !== messageId,
      );
    },
    chatReceived: (state, action) => {
      if (!state.chats.some((item) => item.id === action.payload.id))
        state.chats.unshift(action.payload);
    },
    chatUpdated: (state, action) => {
      if (!action.payload) return;
      const index = state.chats.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (index >= 0)
        state.chats[index] = { ...state.chats[index], ...action.payload };
    },
    chatDeleted: (state, action) => {
      state.chats = state.chats.filter((item) => item.id !== action.payload);
      if (state.activeChatId === action.payload) state.activeChatId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (s) => {
        s.loadingChats = true;
        s.error = "";
      })
      .addCase(fetchChats.fulfilled, (s, a) => {
        s.loadingChats = false;
        s.chats = a.payload;
        if (!s.activeChatId) s.activeChatId = a.payload[0]?.id || null;
        a.payload.forEach((c) => joinChat(c.id));
      })
      .addCase(fetchChats.rejected, (s, a) => {
        s.loadingChats = false;
        s.error = a.error.message;
      })
      .addCase(fetchMessages.pending, (s) => {
        s.loadingMessages = true;
      })
      .addCase(fetchMessages.fulfilled, (s, a) => {
        s.loadingMessages = false;
        s.messages[a.payload.chatId] = a.payload.messages;
      })
      .addCase(fetchMessages.rejected, (s, a) => {
        s.loadingMessages = false;
        s.error = a.error.message;
      })
      .addCase(fetchChatDetails.fulfilled, (s, a) => {
        s.activeDetails = a.payload;
      })
      .addCase(sendMessage.pending, (s) => {
        s.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (s, a) => {
        s.sendingMessage = false;
        s.messages[a.payload.chatId] = [
          ...(s.messages[a.payload.chatId] || []).filter(
            (m) => !m.pending && m.id !== a.payload.message.id,
          ),
          a.payload.message,
        ];
        const c = s.chats.find((x) => x.id === a.payload.chatId);
        if (c) {
          c.lastMessage = a.payload.preview;
          c.lastTime = "Just now";
        }
      })
      .addCase(sendMessage.rejected, (s, a) => {
        s.sendingMessage = false;
        s.error = a.error.message;
      })
      .addCase(deleteMessage.fulfilled, (s, a) => {
        s.messages[a.payload.chatId] = (
          s.messages[a.payload.chatId] || []
        ).filter((m) => m.id !== a.payload.messageId);
      })
      .addCase(renameChat.fulfilled, (s, a) => {
        const c = s.chats.find((x) => x.id === a.payload.chatId);
        if (c) c.name = a.payload.name;
      })
      .addCase(addMembers.fulfilled, (s, a) => {
        const i = s.chats.findIndex((x) => x.id === a.payload.id);
        if (i >= 0) s.chats[i] = a.payload;
      })
      .addCase(removeMember.fulfilled, (s, a) => {
        const i = s.chats.findIndex((x) => x.id === a.payload.id);
        if (i >= 0) s.chats[i] = a.payload;
      })
      .addCase(createChat.fulfilled, (s, a) => {
        if (!s.chats.some((x) => x.id === a.payload.id))
          s.chats.unshift(a.payload);
        s.activeChatId = a.payload.id;
        joinChat(a.payload.id);
      })
      .addCase(createGroup.fulfilled, (s, a) => {
        s.chats.unshift(a.payload);
        s.activeChatId = a.payload.id;
        joinChat(a.payload.id);
      })
      .addCase(removeChat.fulfilled, (s, a) => {
        s.chats = s.chats.filter((x) => x.id !== a.payload);
        if (s.activeChatId === a.payload) s.activeChatId = null;
      })
      .addCase(leaveChatGroup.fulfilled, (s, a) => {
        s.chats = s.chats.filter((x) => x.id !== a.payload);
        if (s.activeChatId === a.payload) s.activeChatId = null;
      });
  },
});
export const {
  setActiveChat,
  setSearchQuery,
  setError,
  markRead,
  receiveMessage,
  messageDeleted,
  chatReceived,
  chatUpdated,
  chatDeleted,
} = chatSlice.actions;
export { mapChat, mapMessage };
export default chatSlice.reducer;
