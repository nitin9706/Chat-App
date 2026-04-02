import { asyncHandler } from "../utils/asyncHandler.js";
import { ChatMessage } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { getIO } from "../sockets/socket.js";
import { Chat } from "../models/chat.model.js";
import mongoose from "mongoose";

const getAllMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chatId");
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const chat = await Chat.findById(chatId);
  if (!chat) throw new ApiError(404, "Chat not found");

  const isMember = chat.participants.some((p) => p.equals(req.user._id));
  if (!isMember) throw new ApiError(403, "You are not a member");

  const messages = await ChatMessage.find({ chat: chatId })
    .populate("sender", "username avatar email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalMessages = await ChatMessage.countDocuments({ chat: chatId });
  const totalPages = Math.ceil(totalMessages / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        messages: messages.reverse(),
        pagination: {
          totalMessages,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
      "Messages fetched successfully",
    ),
  );
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const senderId = req.user._id;
  const { chatId } = req.params;

  if (!senderId) throw new ApiError(400, "senderId is required");
  if (!chatId) throw new ApiError(400, "chatId is required");
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chatId");
  }
  if (!content && !req.files)
    throw new ApiError(400, "content or attachment required");

  const chat = await Chat.findById(chatId);
  if (!chat) throw new ApiError(404, "Chat not found");

  const isMember = chat.participants.some((p) => p.equals(senderId));
  if (!isMember) throw new ApiError(403, "Not part of chat");

  let attachmentData = [];
  const uploadedResources = req.files?.resource || req.files?.attachments || [];

  if (uploadedResources.length) {
    const uploads = await Promise.all(
      uploadedResources.map((file) => uploadToCloudinary(file.path)),
    );

    attachmentData = uploads.map((file) => ({
      url: file.secure_url,
      publicId: file.public_id,
    }));
  }

  const chatMessage = await ChatMessage.create({
    sender: senderId,
    content,
    chat: chatId,
    attachments: attachmentData,
  });

  const chatMessageCreated = await ChatMessage.findById(chatMessage._id)
    .populate("sender", "username avatar email")
    .populate("chat");

  if (!chatMessageCreated) {
    throw new ApiError(500, "Message was not stored");
  }

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: chatMessageCreated._id,
  });

  // 🔥 SOCKET EMIT
  const io = getIO();
  io.to(chatId.toString()).emit("receive_message", {
    ...chatMessageCreated.toObject(),
    chatId: chatId.toString(),
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, chatMessageCreated, "Message sent successfully"),
    );
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await ChatMessage.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  await ChatMessage.deleteOne({ _id: messageId });

  // 🔥 SOCKET EMIT DELETE
  const io = getIO();
  io.to(message.chat.toString()).emit("message_deleted", {
    messageId,
    chatId: message.chat.toString(),
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "message deleted successfully"));
});

export { getAllMessage, sendMessage, deleteMessage };
