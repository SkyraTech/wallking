"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, LogIn, Eye, EyeOff, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin/stock";

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Invalid password");
      }
    } catch {
      setError("Network error -- please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-5">
        <label className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
          Admin Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
          <input
            id="admin-password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-line bg-void pl-10 pr-10 py-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Enter admin password"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs font-semibold text-rose-500">
          {error}
        </div>
      )}

      <button
        id="admin-login-submit"
        type="submit"
        disabled={loading || !password}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-3 font-display text-sm font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Wall King Admin</h1>
          <p className="mt-1 text-sm text-ink-3">Stock Management Portal</p>
        </div>

        <Suspense fallback={
          <div className="rounded-2xl border border-line bg-panel/90 p-6 text-center text-xs text-ink-3">
            Loading login form...
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-ink-3">
          Wall King internal portal -- authorised personnel only
        </p>
      </div>
    </div>
  );
}
