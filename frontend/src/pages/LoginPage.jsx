import { useState, useEffect, useRef } from "react";
import { MessageSquare, Eye, EyeOff, Loader2, Camera, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Googlebutton from "../components/Googlebutton";

const inputClass =
  "w-full px-4 py-3 bg-white/15 border border-white/30 rounded-xl text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent transition-all backdrop-blur-sm";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const { login, register, loading, error, clearError } = useAuth();
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef(null);
  // Login fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields — matches schema: username, email, fullname, password, avatar
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regFullname, setRegFullname] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null); // File object
  const [avatarPreview, setAvatarPreview] = useState(""); // object URL for preview

  useEffect(() => {
    clearError();
    setShowPassword(false);
  }, [tab]);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) return;
    try {
      await login(loginUsername.trim().toLowerCase(), loginPassword);
    } catch {
      /* shown via context */
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (
      !regUsername.trim() ||
      !regEmail.trim() ||
      !regFullname.trim() ||
      !regPassword
    )
      return;
    try {
      await register({
        username: regUsername.trim().toLowerCase(),
        email: regEmail.trim().toLowerCase(),
        fullname: regFullname.trim().toLowerCase(),
        password: regPassword,
        avatar: avatarFile || undefined,
      });
    } catch {
      /* shown via context */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-y-auto overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(145,92,255,0.28),transparent_40%),radial-gradient(circle_at_70%_65%,rgba(88,177,255,0.20),transparent_45%)] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/15 border border-white/20 backdrop-blur-xl rounded-3xl shadow-[0_20px_48px_rgba(0,0,0,0.35)] p-8 text-white">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="size-14 bg-linear-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30">
              <MessageSquare className="size-7 text-white" strokeWidth={2.5} />
            </div>
            <h1
              className="text-2xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ChatApp
            </h1>
            <p className="text-sm text-white/80 mt-1">
              {tab === "login"
                ? "Welcome back, sign in to continue"
                : "Create your account"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/15 rounded-xl p-1 mb-6 border border-white/25 backdrop-blur-md">
            {[
              { key: "login", label: "Sign In" },
              { key: "register", label: "Register" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === key
                    ? "bg-white/30 text-white shadow-inner"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="m-4">
            <Googlebutton />
          </div>
          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-300/40 rounded-xl text-sm text-red-100">
              {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Username">
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer"
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
                disabled={loading || !loginUsername.trim() || !loginPassword}
                className="w-full py-3 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-white disabled:to-white text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:bg-white/20 disabled:text-white/70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-2 ">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="avatar preview"
                        className="size-20 rounded-full object-cover ring-4 ring-sky-100"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-1 -right-1 size-5 bg-red-400/90 hover:bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="size-20 bg-white/10 rounded-full flex items-center justify-center border-2 border-dashed border-white/40">
                      <Camera className="size-7 text-white/70" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-white/80 hover:text-white font-medium cursor-pointer transition-colors"
                >
                  {avatarPreview ? "Change photo" : "Upload profile photo"}
                  <span className="text-white/60 font-normal"> (optional)</span>
                </button>
              </div>

              <Field label="Full Name">
                <input
                  type="text"
                  value={regFullname}
                  onChange={(e) => setRegFullname(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Username">
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="john_doe"
                  autoComplete="username"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="john@example.com"
                  autoComplete="email"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer"
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
                disabled={
                  loading ||
                  !regUsername.trim() ||
                  !regEmail.trim() ||
                  !regFullname.trim() ||
                  !regPassword
                }
                className="w-full py-3 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:text-white/60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          {/* Switch hint */}
          <p className="text-center text-xs text-white/70 mt-5">
            {tab === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => setTab(tab === "login" ? "register" : "login")}
              className="text-white font-semibold hover:underline cursor-pointer"
            >
              {tab === "login" ? "Register here" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
