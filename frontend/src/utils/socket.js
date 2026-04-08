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
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"],
    auth: { userId },
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket error:", err.message);
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
  socket?.emit("join_chat", chatId);
}

// Leave a chat room
export function leaveChat(chatId) {
  socket?.emit("leave_chat", chatId);
}
