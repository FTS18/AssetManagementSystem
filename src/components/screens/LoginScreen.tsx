"use client";

import { useState } from "react";

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoUsers = [
    { name: "Sarah Jenkins", role: "Admin", email: "admin@assetflow.com" },
    { name: "Marcus Vance", role: "Asset Manager", email: "manager@assetflow.com" },
    { name: "Elena Rostova", role: "IT Dept Head", email: "elena.it@assetflow.com" },
    { name: "David Kim", role: "IT Employee", email: "david@assetflow.com" },
    { name: "Priya Patel", role: "HR Employee", email: "priya@assetflow.com" },
  ];

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
        setError("Account created. Please log in.");
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)] text-[var(--foreground)]">
      {/* Brand Intro Column */}
      <div className="flex-1 flex flex-col justify-center px-8 py-16 md:px-16 border-b md:border-b-0 md:border-r border-[var(--border)]">
        <div className="max-w-md">
          <div className="flex items-center space-x-3 mb-6">
            <img src="/logo-white.png" alt="AssetFlow" className="h-8 w-auto hidden dark:block" />
            <img src="/logo-black.png" alt="AssetFlow" className="h-8 w-auto block dark:hidden" />
            <span className="text-xl font-bold tracking-tight">AssetFlow</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4">
            Enterprise Asset & Resource Management
          </h1>
          <p className="text-[var(--muted)] leading-relaxed text-sm">
            Simplify and digitize how your organization tracks physical equipment, registers lifecycle transitions, manages maintenance requests, and schedules shared spaces without conflict.
          </p>
        </div>
      </div>

      {/* Login Form and Dev Switcher Column */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-16 max-w-xl mx-auto w-full">
        <div className="erp-card w-full">
          <h2 className="text-lg font-bold mb-6">
            {isSignup ? "Create New Employee Account" : "Access Central Portal"}
          </h2>

          {error && (
            <div className="p-3 mb-4 text-xs font-medium border border-red-950/20 bg-red-950/10 text-[var(--danger-text)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-[var(--muted)] font-medium">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="erp-input"
                  placeholder="e.g. John Doe"
                />
              </div>
            )}

            <div className="flex flex-col space-y-1">
              <label className="text-xs text-[var(--muted)] font-medium">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="erp-input"
                placeholder="name@company.com"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-[var(--muted)] font-medium">Password</label>
                {!isSignup && (
                  <button type="button" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="erp-input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="erp-btn-primary w-full text-center">
              {loading ? "Authenticating..." : isSignup ? "Create Account" : "Log In"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {isSignup ? "Already have an account? Log in" : "New employee? Register here (default role)"}
            </button>
          </div>
        </div>

        {/* Judging Dev Console Switcher */}
        <div className="mt-8 erp-card border-dashed">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-[var(--warning-text)]"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Dev Console / Switch User</span>
          </div>
          <p className="text-xs text-[var(--muted)] mb-4">
            Click any demo profile to authenticate instantly using seeded credentials.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoUsers.map((demo) => (
              <button
                key={demo.email}
                disabled={loading}
                onClick={() => handleDevSwitch(demo.email)}
                className="flex flex-col items-start p-2 border border-[var(--border)] hover:border-[var(--accent)] text-left bg-[var(--background)] transition-colors"
              >
                <span className="text-xs font-medium">{demo.name}</span>
                <span className="text-[10px] text-[var(--muted)]">{demo.role} ({demo.email})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
