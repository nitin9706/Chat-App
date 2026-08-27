import { createSlice } from "@reduxjs/toolkit";
import { joinChat } from "../utils/socket";
import { removeMessage } from "./chatUtils";

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

const oneToOneChatSlice = createSlice({
  name: "oneToOneChats",
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
      action.payload.forEach((chat) => joinChat(chat.id));
      if (!state.activeChatId)
        state.activeChatId = action.payload[0]?.id || null;
    },
    setMessages: (state, action) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
      state.activeDetails = null;
    },
    setActiveDetails: (state, action) => {
      state.activeDetails = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setLoadingChats: (state, action) => {
      state.loadingChats = action.payload;
    },
    setLoadingMessages: (state, action) => {
      state.loadingMessages = action.payload;
    },
    setSendingMessage: (state, action) => {
      state.sendingMessage = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    markRead: (state, action) => {
      const chat = state.chats.find((item) => item.id === action.payload);
      if (chat) chat.unread = 0;
    },
    receiveOneToOneMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const list = state.messages[chatId] || [];
      if (!list.some((item) => item.id === message.id)) list.push(message);
      const chat = state.chats.find((item) => item.id === chatId);
      if (chat) {
        chat.lastMessage = message.text || "📎";
        chat.lastTime = message.time;
      }
    },
    oneToOneMessageDeleted: (state, action) =>
      removeMessage(state, action.payload.chatId, action.payload.messageId),
    oneToOneChatReceived: (state, action) => {
      if (!state.chats.some((item) => item.id === action.payload.id))
        state.chats.unshift(action.payload);
      joinChat(action.payload.id);
    },
    oneToOneChatUpdated: (state, action) => {
      const index = state.chats.findIndex(
        (item) => item.id === action.payload?.id,
      );
      if (index >= 0)
        state.chats[index] = { ...state.chats[index], ...action.payload };
    },
    oneToOneChatDeleted: (state, action) => {
      state.chats = state.chats.filter((item) => item.id !== action.payload);
      if (state.activeChatId === action.payload) state.activeChatId = null;
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      state.messages[chatId] = [...(state.messages[chatId] || []), message];
    },
    replacePendingMessage: (state, action) => {
      const { chatId, temporaryId, message } = action.payload;
      state.messages[chatId] = (state.messages[chatId] || [])
        .filter((item) => item.id !== temporaryId && item.id !== message.id)
        .concat(message);
    },
    markMessageFailed: (state, action) => {
      const { chatId, messageId } = action.payload;
      const message = state.messages[chatId]?.find(
        (item) => item.id === messageId,
      );
      if (message) {
        message.failed = true;
        message.pending = false;
      }
    },
  },
});

export const {
  setChats,
  setMessages,
  setActiveChat,
  setActiveDetails,
  setSearchQuery,
  setLoadingChats,
  setLoadingMessages,
  setSendingMessage,
  setError,
  markRead,
  receiveOneToOneMessage,
  oneToOneMessageDeleted,
  oneToOneChatReceived,
  oneToOneChatUpdated,
  oneToOneChatDeleted,
  addMessage,
  replacePendingMessage,
  markMessageFailed,
} = oneToOneChatSlice.actions;
export default oneToOneChatSlice.reducer;
