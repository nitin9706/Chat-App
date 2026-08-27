import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  addMessage as addDirectMessage,
  markMessageFailed as failDirectMessage,
  oneToOneChatDeleted,
  oneToOneChatReceived,
  oneToOneChatUpdated,
  oneToOneMessageDeleted,
  receiveOneToOneMessage,
  replacePendingMessage as replaceDirectMessage,
  setActiveChat as setDirectActiveChat,
  setActiveDetails as setDirectDetails,
  setChats as setDirectChats,
  setError,
  setLoadingChats as setDirectLoadingChats,
  setLoadingMessages as setDirectLoadingMessages,
  setSendingMessage as setDirectSending,
  setMessages as setDirectMessages,
} from "../store/oneToOneChatSlice";

import {
  addMessage as addGroupMessage,
  groupChatDeleted,
  groupChatReceived,
  groupChatUpdated,
  groupMessageDeleted,
  markMessageFailed as failGroupMessage,
  receiveGroupMessage,
  replacePendingMessage as replaceGroupMessage,
  setActiveDetails as setGroupDetails,
  setChats as setGroupChats,
  setGroupActiveChat,
  setGroupError,
  setLoadingChats as setGroupLoadingChats,
  setLoadingMessages as setGroupLoadingMessages,
  setSendingMessage as setGroupSending,
  setMessages as setGroupMessages,
} from "../store/groupChatSlice";

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

import { getSocket, joinChat, leaveChat } from "../utils/socket";
import { mapChat, mapMessage } from "../store/chatUtils";

const unwrap = (response) => response?.data || response;

export default function ChatController({
  user,
  allChats,
  messages,
  isGroupChat,
  activeChatId,
}) {
  const dispatch = useDispatch();

  /*
   * Load chats + socket listeners
   */
  useEffect(() => {
    let cancelled = false;

    const loadChats = async () => {
      dispatch(setDirectLoadingChats(true));
      dispatch(setGroupLoadingChats(true));

      try {
        const raw = unwrap(await getUserChats());

        if (cancelled) return;

        const mapped = (Array.isArray(raw) ? raw : []).map((chat) =>
          mapChat(chat, user._id),
        );

        dispatch(setDirectChats(mapped.filter((chat) => !chat.isGroup)));

        dispatch(setGroupChats(mapped.filter((chat) => chat.isGroup)));
      } catch (error) {
        dispatch(setError(error.message));
        dispatch(setGroupError(error.message));
      } finally {
        if (!cancelled) {
          dispatch(setDirectLoadingChats(false));
          dispatch(setGroupLoadingChats(false));
        }
      }
    };

    loadChats();

    const socket = getSocket();

    if (!socket) {
      return () => {
        cancelled = true;
      };
    }

    const onMessage = (message) => {
      const chatId = message.chatId || message.chat?._id || message.chat;

      const mapped = mapMessage(message, user._id);

      dispatch(
        isGroupChat(chatId)
          ? receiveGroupMessage({
              chatId,
              message: mapped,
            })
          : receiveOneToOneMessage({
              chatId,
              message: mapped,
            }),
      );
    };

    const onDeleted = ({ messageId, chatId }) => {
      dispatch(
        isGroupChat(chatId)
          ? groupMessageDeleted({
              messageId,
              chatId,
            })
          : oneToOneMessageDeleted({
              messageId,
              chatId,
            }),
      );
    };

    const onNewChat = (chat) => {
      const mapped = mapChat(chat, user._id);

      dispatch(
        mapped.isGroup
          ? groupChatReceived(mapped)
          : oneToOneChatReceived(mapped),
      );

      joinChat(mapped.id);
    };

    const onUpdated = (chat) => {
      dispatch(
        (chat.isGroupChat ? groupChatUpdated : oneToOneChatUpdated)(
          mapChat(chat, user._id),
        ),
      );
    };

    const onDeletedChat = ({ chatId }) => {
      dispatch(oneToOneChatDeleted(chatId));
      dispatch(groupChatDeleted(chatId));
    };

    socket.on("receive_message", onMessage);
    socket.on("message_deleted", onDeleted);
    socket.on("new_chat", onNewChat);
    socket.on("chat_updated", onUpdated);
    socket.on("chat_deleted", onDeletedChat);

    return () => {
      cancelled = true;

      socket.off("receive_message", onMessage);
      socket.off("message_deleted", onDeleted);
      socket.off("new_chat", onNewChat);
      socket.off("chat_updated", onUpdated);
      socket.off("chat_deleted", onDeletedChat);
    };
  }, [dispatch, user._id, isGroupChat]);

  /*
   * Select chat
   */
  const selectContact = async (chatId) => {
    const group = isGroupChat(chatId);

    dispatch(setDirectActiveChat(chatId));
    dispatch(setGroupActiveChat(chatId));
    dispatch(markRead(chatId));

    try {
      const details = mapChat(unwrap(await getChatById(chatId)), user._id);

      dispatch(group ? setGroupDetails(details) : setDirectDetails(details));

      if (messages[chatId]) return;

      dispatch(
        group ? setGroupLoadingMessages(true) : setDirectLoadingMessages(true),
      );

      const response = await getAllMessages(chatId, 1);

      const raw =
        response?.data?.messages || response?.messages || response?.data || [];

      const action = group ? setGroupMessages : setDirectMessages;

      dispatch(
        action({
          chatId,
          messages: (Array.isArray(raw) ? raw : []).map((message) =>
            mapMessage(message, user._id),
          ),
        }),
      );
    } catch (error) {
      dispatch(group ? setGroupError(error.message) : setError(error.message));
    } finally {
      dispatch(
        group
          ? setGroupLoadingMessages(false)
          : setDirectLoadingMessages(false),
      );
    }
  };

  /*
   * Send message
   */
  const send = async (content, attachments) => {
    if (!activeChatId) return;

    const group = isGroupChat(activeChatId);
    const temporaryId = `pending-${Date.now()}`;
    const pendingMessage = {
      id: temporaryId,
      from: "me",
      text: content || "",
      attachments: [],
      time: "Sending...",
      pending: true,
    };
    const add = group ? addGroupMessage : addDirectMessage;
    const setSending = group ? setGroupSending : setDirectSending;
    const replace = group ? replaceGroupMessage : replaceDirectMessage;
    const fail = group ? failGroupMessage : failDirectMessage;
    const setChatError = group ? setGroupError : setError;

    dispatch(add({ chatId: activeChatId, message: pendingMessage }));
    dispatch(setSending(true));

    try {
      const response = await apiSendMessage(content, activeChatId, attachments);
      const raw = unwrap(response)?.message || unwrap(response);
      dispatch(
        replace({
          chatId: activeChatId,
          temporaryId,
          message: mapMessage(raw, user._id),
        }),
      );
    } catch (error) {
      dispatch(fail({ chatId: activeChatId, messageId: temporaryId }));
      dispatch(setChatError(error.message));
    } finally {
      dispatch(setSending(false));
    }
  };

  /*
   * Delete message
   */
  const deleteMsg = async (messageId) => {
    if (!activeChatId) return;
    const group = isGroupChat(activeChatId);
    try {
      await apiDeleteMessage(messageId);
      dispatch(
        group
          ? groupMessageDeleted({ messageId, chatId: activeChatId })
          : oneToOneMessageDeleted({ messageId, chatId: activeChatId }),
      );
    } catch (error) {
      dispatch(group ? setGroupError(error.message) : setError(error.message));
    }
  };

  /*
   * Create direct chat
   */
  const createDirect = async (username) => {
    const chat = mapChat(unwrap(await createOneToOneChat(username)), user._id);

    dispatch(oneToOneChatReceived(chat));
    dispatch(setDirectActiveChat(chat.id));
  };

  /*
   * Create group
   */
  const createGroup = async (name, members) => {
    const chat = mapChat(
      unwrap(await createGroupChat(name, members)),
      user._id,
    );

    dispatch(groupChatReceived(chat));
    dispatch(setGroupActiveChat(chat.id));
  };

  return {
    selectContact,
    send,
    deleteMsg,
    createDirect,
    createGroup,
  };
}
