import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  loginUser,
  registerUser,
  logOut,
  googleLogin,
  setUnauthorizedHandler,
} from "../utils/api";
import { connectSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem("chat_user");
      const parsed = s ? JSON.parse(s) : null;
      if (parsed && parsed._id) return parsed;
      localStorage.removeItem("chat_user");
      return null;
    } catch {
      localStorage.removeItem("chat_user");
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const persist = (userData) => {
    setUser(userData);
    localStorage.setItem("chat_user", JSON.stringify(userData));
  };
  const forceLogout = useCallback(() => {
    disconnectSocket();
    setUser(null);
    localStorage.removeItem("chat_user");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(forceLogout);
    return () => setUnauthorizedHandler(null);
  }, [forceLogout]);
  // Login — POST /users/login
  // Response: ApiResponse { data: { accessToken, user: loggedInUser } }
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError("");
    try {
      const res = await loginUser({ username, password });
      // res is the unwrapped ApiResponse.data = { accessToken, user }
      const userData = res?.data?.user || res?.user || res;
      if (!userData?._id) throw new Error("Invalid login response");
      persist(userData);
      // Connect socket after login
      connectSocket(userData._id);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register — POST /users/register
  // Response: ApiResponse { data: registeredUser }
  const register = useCallback(
    async ({ username, email, fullname, password, avatar }) => {
      setLoading(true);
      setError("");
      try {
        const res = await registerUser({
          username,
          email,
          fullname,
          password,
          avatar,
        });
        const userData = res?.data || res;
        if (!userData?._id) throw new Error("Invalid register response");
        persist(userData);
        connectSocket(userData._id);
        return userData;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Logout — POST /users/logout
  const logout = useCallback(async () => {
    try {
      if (user?._id) await logOut();
    } catch {
      // ignore
    } finally {
      forceLogout();
    }
  }, [user, forceLogout]);

  // Google Login — POST /users/google
  const googleLoginHandler = useCallback(async (token) => {
    setLoading(true);
    setError("");
    try {
      const res = await googleLogin({ token });
      const userData = res?.user || res;
      if (!userData?._id) throw new Error("Invalid Google login response");
      persist(userData);
      connectSocket(userData._id);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(""), []);

  // Reconnect socket on page reload if already logged in
  if (user?._id && !window.__socketInit) {
    window.__socketInit = true;
    connectSocket(user._id);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        clearError,
        login,
        register,
        logout,
        googleLogin: googleLoginHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
