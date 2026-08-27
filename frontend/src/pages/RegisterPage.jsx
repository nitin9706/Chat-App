import { useState } from "react";
import { Camera, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthError, setAuthStatus, setUser } from "../store/authSlice";
import { registerUser } from "../utils/api";
import { connectSocket } from "../utils/socket";
import { AuthError, AuthShell } from "./LoginPage";

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

export default function RegisterPage({ onShowLogin }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const loading = status === "loading";

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const handleAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    event.target.value = "";
  };
  const removeAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (
      !form.fullname.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password
    )
      return;
    try {
      dispatch(setAuthStatus("loading"));
      const response = await registerUser({
        ...form,
        fullname: form.fullname.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        avatar: avatarFile || undefined,
      });
      const user =
        response?.data?.user || response?.user || response?.data || response;
      if (!user?._id) throw new Error("Invalid registration response");
      connectSocket(user._id);
      dispatch(setUser(user));
    } catch (err) {
      dispatch(setAuthError(err.message || "Registration failed"));
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join ChatApp and start chatting"
    >
      {error && <AuthError message={error} />}
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <input
            id="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatar}
          />
          <div className="relative">
            {avatarPreview ? (
              <>
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="size-20 rounded-full object-cover ring-4 ring-white/20"
                />
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 size-5 bg-red-400 rounded-full flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </>
            ) : (
              <div className="size-20 bg-white/10 rounded-full flex items-center justify-center border-2 border-dashed border-white/40">
                <Camera className="size-7 text-white/70" />
              </div>
            )}
          </div>
          <label
            htmlFor="avatar"
            className="text-xs text-white/80 hover:text-white font-medium cursor-pointer"
          >
            {avatarPreview ? "Change photo" : "Upload profile photo"}{" "}
            <span className="text-white/60 font-normal">(optional)</span>
          </label>
        </div>
        <Field label="Full Name">
          <input
            value={form.fullname}
            onChange={(e) => update("fullname", e.target.value)}
            placeholder="John Doe"
            autoComplete="name"
            required
            className={inputClass}
          />
        </Field>
        <Field label="Username">
          <input
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            placeholder="john_doe"
            autoComplete="username"
            required
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
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
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Create a strong password"
              autoComplete="new-password"
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
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-white/20 disabled:to-white/20 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
      <p className="text-center text-xs text-white/70 mt-6">
        Already have an account?{" "}
        <button
          onClick={onShowLogin}
          className="text-white font-semibold hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </AuthShell>
  );
}
