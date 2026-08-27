import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCurrentUser,
  googleLogin as apiGoogleLogin,
  logOut,
  loginUser,
  registerUser,
} from "../utils/api";
import { connectSocket, disconnectSocket } from "../utils/socket";

function loadUser() {
  try {
    const stored = localStorage.getItem("chat_user");
    const user = stored ? JSON.parse(stored) : null;
    if (user?._id) return user;
  } catch {
    // Ignore malformed persisted state.
  }
  localStorage.removeItem("chat_user");
  return null;
}

function getUser(response) {
  return response?.data?.user || response?.user || response?.data || response;
}

const initialState = {
  user: loadUser(),
  status: "idle",
  error: "",
  initialized: false,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }) => {
    const user = getUser(await loginUser({ username, password }));
    if (!user?._id) throw new Error("Invalid login response");
    connectSocket(user._id);
    return user;
  },
);

export const register = createAsyncThunk("auth/register", async (details) => {
  const response = await registerUser(details);
  const user = response?.data || response;
  if (!user?._id) throw new Error("Invalid register response");
  connectSocket(user._id);
  return user;
});

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (token) => {
    const user = getUser(await apiGoogleLogin({ token }));
    if (!user?._id) throw new Error("Invalid Google login response");
    connectSocket(user._id);
    return user;
  },
);

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { getState, dispatch }) => {
    const user = getState().auth.user;
    if (!user?._id) return null;
    try {
      await getCurrentUser();
      connectSocket(user._id);
      return user;
    } catch {
      dispatch(forceLogout());
      return null;
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    try {
      if (getState().auth.user?._id) await logOut();
    } finally {
      disconnectSocket();
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = "";
    },
    forceLogout: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = "";
      localStorage.removeItem("chat_user");
      disconnectSocket();
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = "loading";
      state.error = "";
    };
    const fulfilled = (state, action) => {
      state.status = "succeeded";
      state.user = action.payload;
      if (action.payload)
        localStorage.setItem("chat_user", JSON.stringify(action.payload));
    };
    const rejected = (state, action) => {
      state.status = "failed";
      state.error = action.error.message || "Authentication failed";
    };
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected)
      .addCase(googleLogin.pending, pending)
      .addCase(googleLogin.fulfilled, fulfilled)
      .addCase(googleLogin.rejected, rejected)
      .addCase(initializeAuth.fulfilled, (state) => {
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.initialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.error = "";
        localStorage.removeItem("chat_user");
      });
  },
});

export const { clearError, forceLogout } = authSlice.actions;
export default authSlice.reducer;
