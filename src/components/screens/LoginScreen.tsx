"use client";

import { useState } from "react";

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

const demoUsers = [
  { name: "Sarah Jenkins",   role: "Admin",         email: "admin@assetflow.com"   },
  { name: "Marcus Vance",    role: "Asset manager", email: "manager@assetflow.com" },
  { name: "Elena Rostova",   role: "IT dept head",  email: "elena.it@assetflow.com"},
  { name: "David Kim",       role: "IT employee",   email: "david@assetflow.com"   },
  { name: "Priya Patel",     role: "HR employee",   email: "priya@assetflow.com"   },
];

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleDevSwitch = async (demoEmail: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: "Demo@123" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url = isSignup ? "/api/auth/signup" : "/api/auth/login";
    const payload = isSignup ? { name, email, password } : { email, password };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      if (isSignup) {
        setIsSignup(false);
        setError("Account created — please sign in.");
      } else {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex bg-[var(--bg)]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Left brand panel — visible md+ */}
      <div className="hidden md:flex flex-col justify-between w-[42%] max-w-md bg-[var(--accent)] px-12 py-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-base leading-none">A</span>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">AssetFlow</span>
        </div>

        {/* Hero text */}
        <div>
          <h1
            className="text-3xl font-semibold text-white leading-snug"
            style={{ textWrap: "balance" }}
          >
            Track, allocate, and audit every corporate asset — in one place.
          </h1>
          <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-xs">
            A modern ERP built for IT, operations, and finance teams that need clarity at every step of an asset's lifecycle.
          </p>
        </div>

        {/* Bottom stat strip */}
        <div className="flex gap-8">
          {[
            { value: "6 modules", label: "Fully integrated" },
            { value: "RBAC",      label: "Role-based access" },
            { value: "SQLite",    label: "Zero config db" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-white font-semibold text-sm">{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="h-7 w-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
              <span className="text-[var(--accent-fg)] font-bold text-sm leading-none">A</span>
            </div>
            <span className="font-semibold text-[var(--fg)] text-sm">AssetFlow</span>
          </div>

          <h2 className="text-xl font-semibold text-[var(--fg)] mb-1">
            {isSignup ? "Create an account" : "Sign in"}
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            {isSignup
              ? "You'll start with the Employee role by default."
              : "Enter your credentials to access the dashboard."}
          </p>

          {error && (
            <div className="mb-4 px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--danger-bg)] border border-[oklch(from_var(--danger)_l_c_h_/_0.2)] text-[var(--danger)] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-[var(--fg)] mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="erp-input"
                  placeholder="Jane Smith"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--fg)] mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="erp-input"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[var(--fg)]">Password</label>
                {!isSignup && (
                  <button type="button" className="text-xs text-[var(--accent)] hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="erp-input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="erp-btn-primary w-full mt-1.5">
              {loading ? "Signing in…" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-[var(--muted)]">
            {isSignup ? "Already have an account? " : "New here? "}
            <button
              onClick={() => { setIsSignup(!isSignup); setError(""); }}
              className="text-[var(--accent)] hover:underline font-medium"
            >
              {isSignup ? "Sign in" : "Create account"}
            </button>
          </p>

          {/* Dev console */}
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <p className="text-xs font-medium text-[var(--muted)] mb-3 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--warning)]"></span>
              Dev console — click to sign in instantly
            </p>
            <div className="space-y-1.5">
              {demoUsers.map(u => (
                <button
                  key={u.email}
                  disabled={loading}
                  onClick={() => handleDevSwitch(u.email)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--accent)] transition-colors duration-[var(--duration-fast)] text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--fg)]">{u.name}</p>
                    <p className="text-xs text-[var(--muted)]">{u.role}</p>
                  </div>
                  <svg className="text-[var(--muted)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
