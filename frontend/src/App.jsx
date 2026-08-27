import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { forceLogout, setInitialized, setUser } from "./store/authSlice";
import { getCurrentUser } from "./utils/api";
import { connectSocket } from "./utils/socket";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const initialize = async () => {
      const storedUser = JSON.parse(localStorage.getItem("chat_user"));
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

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <LoginPage />
      </GoogleOAuthProvider>
    );
  }

  return <ChatPage user={user} />;
}
