import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function Googlebutton() {
  const { googleLogin } = useAuth();

  const handleSuccess = async (response) => {
    try {
      const token = response.credential;
      await googleLogin(token);
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
