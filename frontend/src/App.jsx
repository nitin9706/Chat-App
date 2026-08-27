import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { forceLogout, setInitialized, setUser } from "./store/authSlice";
import { getCurrentUser } from "./utils/api";
import { connectSocket } from "./utils/socket";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [authPage, setAuthPage] = useState("login");

  useEffect(() => {
    const initialize = async () => {
      let storedUser = null;
      try {
        storedUser = JSON.parse(localStorage.getItem("chat_user"));
      } catch {
        localStorage.removeItem("chat_user");
      }
      if (!storedUser?._id) {
        dispatch(setInitialized(true));
        return;
      }
      try {
        await getCurrentUser();
        connectSocket(storedUser._id);
        dispatch(setUser(storedUser));
      } catch {
        dispatch(forceLogout());
      } finally {
        dispatch(setInitialized(true));
      }
    };
    initialize();
  }, [dispatch]);

  const initialized = useSelector((state) => state.auth.initialized);

  if (!initialized) return null;

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        {authPage === "login" ? (
          <LoginPage onShowRegister={() => setAuthPage("register")} />
        ) : (
          <RegisterPage onShowLogin={() => setAuthPage("login")} />
        )}
      </GoogleOAuthProvider>
    );
  }

  return <ChatPage user={user} />;
}
