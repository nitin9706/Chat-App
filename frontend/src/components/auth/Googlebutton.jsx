import { GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { setAuthError, setAuthStatus, setUser } from "../../store/authSlice";
import { googleLogin as apiGoogleLogin } from "../../utils/api";
import { connectSocket } from "../../utils/socket";

export default function Googlebutton() {
  const dispatch = useDispatch();

  const handleSuccess = async (response) => {
    try {
      const token = response.credential;
      dispatch(setAuthStatus("loading"));
      const response = await apiGoogleLogin({ token });
      const user =
        response?.user || response?.data?.user || response?.data || response;
      if (!user?._id) throw new Error("Invalid Google login response");
      connectSocket(user._id);
      dispatch(setUser(user));
    } catch (err) {
      dispatch(setAuthError(err.message));
      console.error("Google login failed:", err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Login Failed")}
      useOneTap={false}
    />
  );
}
