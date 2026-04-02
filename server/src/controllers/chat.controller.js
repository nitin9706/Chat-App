import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { getIO } from "../sockets/socket.js";

// 🔥 helper to emit to all participants in chat
const emitToChat = (chatId, event, data) => {
  const io = getIO();
  io.to(chatId.toString()).emit(event, data);
};

const createOneToOneChat = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw new ApiError(400, "username is required");
  }

  const receiverUser = await User.findOne({ username });

  if (!receiverUser) {
    throw new ApiError(404, "User not found");
  }

  const existingChat = await Chat.findOne({
    isGroupChat: false,
    participants: {
      $all: [req.user._id, receiverUser._id],
      $size: 2,
    },
  });

  if (existingChat) {
    const populated = await existingChat.populate(
      "participants",
      "username avatar email",
    );

    return res
      .status(200)
      .json(new ApiResponse(200, populated, "Chat already exists"));
  }

  const chat = await Chat.create({
    isGroupChat: false,
    participants: [req.user._id, receiverUser._id],
    admin: req.user._id,
  });

  const chatCreated = await Chat.findById(chat._id).populate(
    "participants",
    "username avatar email",
  );

  if (!chatCreated) {
    throw new ApiError(500, "error while generating the chat");
  }

  // 🔥 emit new chat
  emitToChat(chat._id, "new_chat", chatCreated);

  res
    .status(201)
    .json(new ApiResponse(201, chatCreated, "Chat Created successfully"));
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { users, usernames, name } = req.body;
  const requestedUsernames = Array.isArray(usernames)
    ? usernames
    : Array.isArray(users)
      ? users
      : [];

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Group name is required");
  }

  if (!requestedUsernames.length) {
    throw new ApiError(400, "usernames array is required");
  }

  for (const username of requestedUsernames) {
    if (typeof username !== "string" || !username.trim()) {
      throw new ApiError(400, "All usernames must be non-empty strings");
    }
  }

  const normalizedUsernames = requestedUsernames.map((u) =>
    u.trim().toLowerCase(),
  );
  const foundUsers = await User.find({ username: { $in: normalizedUsernames } });

  if (foundUsers.length !== normalizedUsernames.length) {
    throw new ApiError(404, "One or more users not found");
  }

  const participantIds = foundUsers.map((u) => u._id.toString());
  const participants = [...new Set([req.user._id.toString(), ...participantIds])];

  if (participants.length < 3) {
    throw new ApiError(400, "Group chat needs at least 3 participants");
  }

  const groupChat = await Chat.create({
    name,
    isGroupChat: true,
    participants,
    admin: req.user._id,
  });

  const groupChatCreated = await Chat.findById(groupChat._id)
    .populate("participants", "username avatar email")
    .populate("admin", "username avatar");

  if (!groupChatCreated) {
    throw new ApiError(500, "error while generating the chat");
  }

  // 🔥 emit new group chat
  emitToChat(groupChat._id, "new_chat", groupChatCreated);

  res
    .status(201)
    .json(new ApiResponse(201, groupChatCreated, "Chat Created successfully"));
});

const getUserChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userChats = await Chat.find({
    participants: userId,
  })
    .populate("participants", "username avatar email")
    .populate("admin", "username avatar")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username avatar",
      },
    })
    .sort({ updatedAt: -1 });

  if (!userChats || userChats.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No chats found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, userChats, "Users Chat Fetched Successfully"));
});

const getChatById = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  if (!chatId) throw new ApiError(404, "chatId is needed");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chatId");
  }

  const chatGot = await Chat.findById(chatId)
    .populate("participants", "name email avatar")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name email avatar",
      },
    });

  if (!chatGot) throw new ApiError(404, "chat not Exist");

  const isUserInChat = chatGot.participants.some((p) => p._id.equals(userId));

  if (!isUserInChat) {
    throw new ApiError(403, "Chat not accessible for this user");
  }

  res
    .status(200)
    .json(new ApiResponse(200, chatGot, "Chat Fetched Successfully"));
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  const { newName } = req.body;

  if (!chatId) throw new ApiError(404, "chatId is needed");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chatId");
  }

  if (!newName || newName.trim() === "") {
    throw new ApiError(400, "New name is required");
  }

  const chatGot = await Chat.findById(chatId);

  if (!chatGot) throw new ApiError(404, "Chat does not exist");

  const isUserInChat = chatGot.participants.some((p) => p._id.equals(userId));

  if (!isUserInChat) {
    throw new ApiError(403, "Chat not accessible for this user");
  }

  if (!chatGot.admin.equals(userId)) {
    throw new ApiError(403, "Only Admin can change the name of the group");
  }

  chatGot.name = newName;
  await chatGot.save({ validateBeforeSave: false });

  // 🔥 emit rename
  emitToChat(chatId, "chat_updated", { chatId, name: newName });

  res
    .status(200)
    .json(new ApiResponse(200, chatGot, "Group name changed successfully"));
});

const addMemberToGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  const { members, usernames } = req.body;
  const requestedUsernames = Array.isArray(usernames)
    ? usernames
    : Array.isArray(members)
      ? members
      : [];

  if (!chatId) throw new ApiError(404, "chatId is needed");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chatId");
  }

  if (!requestedUsernames.length) {
    throw new ApiError(400, "usernames array is required");
  }

  const groupChat = await Chat.findById(chatId);

  if (!groupChat) throw new ApiError(400, "Group chat not exist");

  const isUserInChat = groupChat.participants.some((p) => p.equals(userId));

  if (!isUserInChat) {
    throw new ApiError(403, "You are not part of this group");
  }

  const normalizedUsernames = requestedUsernames.map((u) =>
    typeof u === "string" ? u.trim().toLowerCase() : "",
  );
  if (normalizedUsernames.some((u) => !u)) {
    throw new ApiError(400, "All usernames must be non-empty strings");
  }

  const usersToAdd = await User.find({ username: { $in: normalizedUsernames } });
  if (usersToAdd.length !== normalizedUsernames.length) {
    throw new ApiError(404, "One or more users not found");
  }

  const existingIds = groupChat.participants.map((p) => p.toString());

  const newMembers = usersToAdd.map((u) => u._id.toString()).filter(
    (id) => !existingIds.includes(id.toString()),
  );

  groupChat.participants.push(...newMembers);
  await groupChat.save({ validateBeforeSave: false });

  // 🔥 emit member added
  emitToChat(chatId, "chat_updated", groupChat);

  res
    .status(200)
    .json(new ApiResponse(200, groupChat, "member added to the group"));
});

const removeMemberFromGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  const { memberId } = req.body;

  if (!chatId) throw new ApiError(404, "chatId is needed");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chatId");
  }

  const groupChat = await Chat.findById(chatId);

  if (!groupChat) throw new ApiError(400, "Group chat not exist");

  const isUserInChat = groupChat.participants.some((p) => p.equals(userId));

  if (!isUserInChat) {
    throw new ApiError(403, "You are not part of this group");
  }

  if (!groupChat.admin.equals(userId)) {
    throw new ApiError(403, "Only admin can remove");
  }

  const resultGroup = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { participants: memberId } },
    { new: true },
  );

  // 🔥 emit member removed
  emitToChat(chatId, "chat_updated", resultGroup);

  res
    .status(200)
    .json(new ApiResponse(200, resultGroup, "member removed from the group"));
});

const leaveGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const user = req.user._id;

  if (!chatId) throw new ApiError(404, "chatId is needed");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chatId");
  }

  const groupChat = await Chat.findById(chatId);

  if (!groupChat) throw new ApiError(400, "Group chat not exist");

  if (groupChat.admin.equals(user)) {
    await Chat.findByIdAndDelete(chatId);

    emitToChat(chatId, "chat_deleted", { chatId });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "You/admin left the group and the group is deleted",
        ),
      );
  }

  await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { participants: user } },
    { new: true },
  );

  emitToChat(chatId, "chat_updated", { chatId });

  res.status(200).json(new ApiResponse(200, {}, "You left the group"));
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) throw new ApiError(404, "chatId is needed");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chatId");
  }

  await Chat.findByIdAndDelete(chatId);

  // 🔥 emit delete
  emitToChat(chatId, "chat_deleted", { chatId });

  res.status(200).json(new ApiResponse(200, {}, "chat deleted successfully"));
});

export {
  createOneToOneChat,
  createGroupChat,
  getUserChats,
  getChatById,
  renameGroupChat,
  addMemberToGroup,
  removeMemberFromGroup,
  leaveGroupChat,
  deleteChat,
};
