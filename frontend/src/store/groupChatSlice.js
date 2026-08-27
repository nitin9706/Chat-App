import { createSlice } from "@reduxjs/toolkit";
import { joinChat } from "../utils/socket";
import { removeMessage } from "./chatUtils";

const initialState = {
  chats: [],
  messages: {},
  activeChatId: null,
  activeDetails: null,
  loadingChats: false,
  loadingMessages: false,
  sendingMessage: false,
  error: "",
};

const groupChatSlice = createSlice({
  name: "groupChats",
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
      action.payload.forEach((chat) => joinChat(chat.id));
    },
    setMessages: (state, action) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    setGroupActiveChat: (state, action) => {
      state.activeChatId = action.payload;
      state.activeDetails = null;
    },
    setActiveDetails: (state, action) => {
      state.activeDetails = action.payload;
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
    setGroupError: (state, action) => {
      state.error = action.payload;
    },
    receiveGroupMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const list = state.messages[chatId] || [];
      if (!list.some((item) => item.id === message.id)) list.push(message);
      const chat = state.chats.find((item) => item.id === chatId);
      if (chat) {
        chat.lastMessage = message.text || "📎";
        chat.lastTime = message.time;
      }
    },
    groupMessageDeleted: (state, action) =>
      removeMessage(state, action.payload.chatId, action.payload.messageId),
    groupChatReceived: (state, action) => {
      if (!state.chats.some((item) => item.id === action.payload.id)) {
        state.chats.unshift(action.payload);
        joinChat(action.payload.id);
      }
    },
    groupChatUpdated: (state, action) => {
      const index = state.chats.findIndex(
        (item) => item.id === action.payload?.id,
      );
      if (index >= 0)
        state.chats[index] = { ...state.chats[index], ...action.payload };
    },
    groupChatDeleted: (state, action) => {
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
      const message = state.messages[action.payload.chatId]?.find(
        (item) => item.id === action.payload.messageId,
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
  setGroupActiveChat,
  setActiveDetails,
  setLoadingChats,
  setLoadingMessages,
  setSendingMessage,
  setGroupError,
  receiveGroupMessage,
  groupMessageDeleted,
  groupChatReceived,
  groupChatUpdated,
  groupChatDeleted,
  addMessage,
  replacePendingMessage,
  markMessageFailed,
} = groupChatSlice.actions;
export default groupChatSlice.reducer;
