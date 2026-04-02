import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachment: {
      type: [
        {
          url: String,
          localPath: String,
        },
      ],
      default: [],
    },

    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  { timestamps: true },
);

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
