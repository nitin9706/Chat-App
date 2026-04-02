export const registerSocketHandlers = (io, socket, onlineUsers) => {
  // ── 1. CHAT ROOM JOIN/LEAVE (use chatId) ──────────────────────
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
  });

  // ── 2. TYPING INDICATOR ───────────────────────────────────────
  socket.on("typing:start", ({ chatId, userId, username }) => {
    socket.to(chatId).emit("typing:start", { userId, username });
  });

  socket.on("typing:stop", ({ chatId, userId }) => {
    socket.to(chatId).emit("typing:stop", { userId });
  });

  // ── 3. READ RECEIPTS ──────────────────────────────────────────
  socket.on("message:read", ({ chatId, userId, messageId }) => {
    socket.to(chatId).emit("message:read", { userId, messageId });
  });

  // ── 4. DISCONNECT HANDLING ────────────────────────────────────
  socket.on("disconnect", () => {
    const userId = socket.data.userId;

    if (userId) {
      onlineUsers.delete(userId);

      io.emit("user_offline", {
        userId,
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    }
  });
};
