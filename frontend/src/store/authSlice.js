import { createSlice } from "@reduxjs/toolkit";
import { disconnectSocket } from "../utils/socket";

function loadUser() {
  try {
    const user = JSON.parse(localStorage.getItem("chat_user"));
    if (user?._id) return user;
  } catch {
    // Ignore invalid persisted user data.
  }
  localStorage.removeItem("chat_user");
  return null;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: loadUser(),
    status: "idle",
    error: "",
    initialized: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = "";
      if (action.payload)
        localStorage.setItem("chat_user", JSON.stringify(action.payload));
      else localStorage.removeItem("chat_user");
    },
    setAuthStatus: (state, action) => {
      state.status = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.status = "failed";
    },
    clearError: (state) => {
      state.error = "";
    },
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
    forceLogout: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = "";
      localStorage.removeItem("chat_user");
      disconnectSocket();
    },
  },
});

export const {
  setUser,
  setAuthStatus,
  setAuthError,
  clearError,
  setInitialized,
  forceLogout,
} = authSlice.actions;
export default authSlice.reducer;
