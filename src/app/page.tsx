"use client";

import { useState, useEffect } from "react";
import LoginScreen          from "@/components/screens/LoginScreen";
import MainLayout           from "@/components/screens/MainLayout";
import DashboardOverview    from "@/components/screens/DashboardOverview";
import OrgSetup             from "@/components/screens/OrgSetup";
import AssetDirectory       from "@/components/screens/AssetDirectory";
import AssetAllocation      from "@/components/screens/AssetAllocation";
import ResourceBooking      from "@/components/screens/ResourceBooking";
import MaintenanceManagement from "@/components/screens/MaintenanceManagement";
import AssetAudit           from "@/components/screens/AssetAudit";
import ReportsAnalytics     from "@/components/screens/ReportsAnalytics";
import ActivityLogs         from "@/components/screens/ActivityLogs";

function ThemeToggle({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="fixed bottom-4 right-4 z-[500] flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow-[var(--shadow-sm)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {theme === "dark" ? (
        /* Sun */
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        /* Moon */
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}

export default function Home() {
  const [user, setUser]               = useState<any | null>(null);
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [loading, setLoading]         = useState(true);
  const [theme, setTheme]             = useState<"light" | "dark">("light");

  /* Persist theme preference and apply to <html> */
  useEffect(() => {
    const saved = localStorage.getItem("af-theme") as "light" | "dark" | null;
    const preferred = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferred);
    document.documentElement.dataset.theme = preferred;
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("af-theme", next);
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLoginSuccess = (u: any) => { setUser(u); setActiveScreen("dashboard"); };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setActiveScreen("dashboard");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <span className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-sans)" }}>
        Loading…
      </span>
    </div>
  );

  if (!user) return (
    <>
      <LoginScreen onLoginSuccess={handleLoginSuccess} />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
    </>
  );

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":   return <DashboardOverview user={user} setActiveScreen={setActiveScreen} />;
      case "org-setup":   return <OrgSetup user={user} />;
      case "assets":      return <AssetDirectory user={user} />;
      case "allocations": return <AssetAllocation user={user} />;
      case "bookings":    return <ResourceBooking user={user} />;
      case "maintenance": return <MaintenanceManagement user={user} />;
      case "audits":      return <AssetAudit user={user} />;
      case "reports":     return <ReportsAnalytics />;
      case "logs":        return <ActivityLogs />;
      default:            return <DashboardOverview user={user} setActiveScreen={setActiveScreen} />;
    }
  };

  return (
    <>
      <MainLayout user={user} onLogout={handleLogout} activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
        {renderScreen()}
      </MainLayout>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
    </>
  );
}
