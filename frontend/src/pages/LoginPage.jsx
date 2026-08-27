import { useState } from "react";
import { Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthError, setAuthStatus, setUser } from "../store/authSlice";
import { loginUser } from "../utils/api";
import { connectSocket } from "../utils/socket";
import Googlebutton from "../components/auth/Googlebutton";

const inputClass =
  "w-full px-4 py-3 bg-white/15 border border-white/30 rounded-xl text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent transition-all backdrop-blur-sm";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function LoginPage({ onShowRegister }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loading = status === "loading";

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) return;

    try {
      dispatch(setAuthStatus("loading"));
      const response = await loginUser({
        username: username.trim().toLowerCase(),
        password,
      });
      const user =
        response?.data?.user || response?.user || response?.data || response;
      if (!user?._id) throw new Error("Invalid login response");
      connectSocket(user._id);
      dispatch(setUser(user));
    } catch (err) {
      dispatch(setAuthError(err.message || "Authentication failed"));
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to ChatApp">
      <div className="mb-6 flex justify-center">
        <Googlebutton />
      </div>

      {error && <AuthError message={error} />}

      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Username">
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="your_username"
            autoComplete="username"
            required
            className={inputClass}
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </Field>

        <button
          type="submit"
          disabled={loading || !username.trim() || !password}
          className="w-full py-3 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-white/20 disabled:to-white/20 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:text-white/70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-white/70 mt-6">
        Don&apos;t have an account?{" "}
        <button
          onClick={onShowRegister}
          className="text-white font-semibold hover:underline cursor-pointer"
        >
          Register here
        </button>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="h-screen px-4 py-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(145,92,255,0.28),transparent_40%),radial-gradient(circle_at_70%_65%,rgba(88,177,255,0.20),transparent_45%)] pointer-events-none" />
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white/15 border border-white/20 backdrop-blur-xl rounded-3xl shadow-[0_20px_48px_rgba(0,0,0,0.35)] p-8 text-white">
          <div className="flex flex-col items-center mb-7">
            <div className="size-14 bg-linear-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30">
              <MessageSquare className="size-7 text-white" strokeWidth={2.5} />
            </div>
            <h1
              className="text-2xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h1>
            <p className="text-sm text-white/80 mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthError({ message }) {
  return (
    <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-300/40 rounded-xl text-sm text-red-100">
      {message}
    </div>
  );
}
