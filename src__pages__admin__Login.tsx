import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLogin() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/admin");
    } catch {
      setError("ایمیل یا رمز عبور اشتباه است.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mist px-5">
      <form onSubmit={handleSubmit} className="bg-white border border-line rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <div className="w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center mb-5">
          <Lock size={18} />
        </div>
        <h1 className="text-xl font-bold mb-1">ورود به پنل مدیریت</h1>
        <p className="text-xs text-neutral-400 mb-6">بابک شاپ</p>

        <input
          type="email"
          required
          placeholder="ایمیل مدیر"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-ink transition-colors mb-3"
        />
        <input
          type="password"
          required
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-ink transition-colors mb-4"
        />

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        <button
          disabled={submitting}
          className="w-full bg-ink text-white text-sm py-3.5 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {submitting ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
}
