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

export default function Home() {
  const [user, setUser]               = useState<any | null>(null);
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [loading, setLoading]         = useState(true);

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
    <div className="min-h-screen flex items-center justify-center bg-(--bg)">
      <span className="text-sm text-(--muted)" style={{ fontFamily: "var(--font-sans)" }}>
        Loading…
      </span>
    </div>
  );

  if (!user) return (
    <LoginScreen onLoginSuccess={handleLoginSuccess} />
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
    <MainLayout user={user} onLogout={handleLogout} activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
      {renderScreen()}
    </MainLayout>
  );
}
