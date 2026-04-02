import { Server } from "socket.io";
import { registerSocketHandlers } from "./socketHandler.js";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  const onlineUsers = new Map(); // userId -> socketId

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ✅ attach userId from auth (better than emitting manually)
    const userId = socket.handshake.auth?.userId;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      socket.join(userId);

      io.emit("user_online", {
        userId,
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    }

    // ✅ register all handlers
    registerSocketHandlers(io, socket, onlineUsers);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const userId = socket.data.userId;

      if (userId) {
        onlineUsers.delete(userId);

        io.emit("user_offline", {
          userId,
          onlineUsers: Array.from(onlineUsers.keys()),
        });
      }
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
