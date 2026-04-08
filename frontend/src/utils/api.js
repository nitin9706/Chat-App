import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API || "/api/v1",
  timeout: 120000,
  withCredentials: true,
});

const requireChatId = (chatId) => {
  if (!chatId || chatId === "undefined" || chatId === "null") {
    throw new Error("Invalid chatId");
  }
};

// Authorization handler for global state (e.g. logout on 401/403)
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// Unwrap the ApiResponse wrapper: { statusCode, data, message }
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      if (typeof onUnauthorized === "function") {
        onUnauthorized();
      }
      return Promise.reject(
        new Error("Authentication failed. Please login again."),
      );
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── USER ─────────────────────────────────────────────────────────────────────

// POST /users/register  — multipart: fullname, username, email, password, avatar(file)
export const registerUser = ({
  username,
  email,
  fullname,
  password,
  avatar,
}) => {
  const form = new FormData();
  form.append("username", username);
  form.append("email", email);
  form.append("fullname", fullname);
  form.append("password", password);
  if (avatar) form.append("avatar", avatar);
  return apiClient.post("/users/register", form);
};

// POST /users/login  — body: { username, password }
export const loginUser = ({ username, password }) =>
  apiClient.post("/users/login", { username, password });

// POST /users/google  — body: { token }
export const googleLogin = ({ token }) =>
  apiClient.post("/users/google", { token });

// POST /users/logout/:id
export const logOut = () => apiClient.post("/users/logout");

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

// GET /message/:chatId?page=1&limit=20
export const getAllMessages = (chatId, page = 1, limit = 20) => (
  requireChatId(chatId),
  apiClient.get(`/message/${chatId}`, { params: { page, limit } })
);

// POST /message/:chatId/message  — multipart: content, resource[]
export const sendMessage = (content, chatId, attachments = []) => {
  requireChatId(chatId);
  const form = new FormData();
  if (content) form.append("content", content);
  attachments.forEach((file) => form.append("resource", file));
  return apiClient.post(`/message/${chatId}/message`, form);
};

// DELETE /message/:messageId
export const deleteMessage = (messageId) =>
  apiClient.delete(`/message/${messageId}`);

// ─── CHATS ────────────────────────────────────────────────────────────────────

// POST /chat/one-to-one  — body: { username }   ← controller expects username not userId
export const createOneToOneChat = (username) =>
  apiClient.post("/chat/one-to-one", { username });

// POST /chat/group  — body: { name, usernames: [username, ...] }
export const createGroupChat = (name, usernames) =>
  apiClient.post("/chat/group", { name, usernames });

// GET /chat/
export const getUserChats = () => apiClient.get("/chat/");

// GET /chat/:chatId
export const getChatById = (chatId) => {
  requireChatId(chatId);
  return apiClient.get(`/chat/${chatId}`);
};

// PATCH /chat/:chatId/rename  — body: { newName }   ← controller reads req.body.newName
export const renameGroupChat = (chatId, newName) => (
  requireChatId(chatId),
  apiClient.patch(`/chat/${chatId}/rename`, { newName })
);

// PATCH /chat/:chatId/add-member  — body: { usernames: [username, ...] }
export const addMemberToGroup = (chatId, usernames) => (
  requireChatId(chatId),
  apiClient.patch(`/chat/${chatId}/add-member`, { usernames })
);

// PATCH /chat/:chatId/remove-member  — body: { memberId }  ← single string
export const removeMemberFromGroup = (chatId, memberId) => (
  requireChatId(chatId),
  apiClient.patch(`/chat/${chatId}/remove-member`, { memberId })
);

// PATCH /chat/:chatId/leave
export const leaveGroupChat = (chatId) => (
  requireChatId(chatId),
  apiClient.patch(`/chat/${chatId}/leave`)
);

// DELETE /chat/:chatId
export const deleteChat = (chatId) => (
  requireChatId(chatId),
  apiClient.delete(`/chat/${chatId}`)
);
