import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import oneToOneChatReducer from "./oneToOneChatSlice";
import groupChatReducer from "./groupChatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    oneToOneChats: oneToOneChatReducer,
    groupChats: groupChatReducer,
  },
});
