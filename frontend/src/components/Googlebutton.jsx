import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";

export default function Googlebutton() {
  const { googleLogin } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return;
    initialized.current = true;
  }, []);

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
