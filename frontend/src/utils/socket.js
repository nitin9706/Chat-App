import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : (import.meta.env.VITE_SERVER_API || "http://localhost:8000").replace(
        /\/api\/.*$/,
        "",
      ));

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(userId) {
  if (!userId) {
    console.warn("Cannot connect socket: userId is required");
    return null;
  }

  if (socket?.connected) {
    console.log("Socket already connected");
    return socket;
  }

  // Disconnect existing socket if it exists
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"],
    auth: { userId },
  });

  socket.on("connect", () => {
    if (socket) {
      console.log("🟢 Socket connected:", socket.id);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connection error:", err.message);
    // Don't throw error, just log it
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Join a chat room
export function joinChat(chatId) {
  if (socket?.connected) {
    socket.emit("join_chat", chatId);
  }
}

// Leave a chat room
export function leaveChat(chatId) {
  if (socket?.connected) {
    socket.emit("leave_chat", chatId);
  }
}
