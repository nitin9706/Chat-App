import { GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { googleLogin } from "../../store/authSlice";

export default function Googlebutton() {
  const dispatch = useDispatch();

  const handleSuccess = async (response) => {
    try {
      const token = response.credential;
      await dispatch(googleLogin(token)).unwrap();
    } catch (err) {
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
