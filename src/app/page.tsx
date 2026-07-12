"use client";

import { useState, useEffect } from "react";
import LoginScreen from "@/components/screens/LoginScreen";
import MainLayout from "@/components/screens/MainLayout";
import DashboardOverview from "@/components/screens/DashboardOverview";
import OrgSetup from "@/components/screens/OrgSetup";
import AssetDirectory from "@/components/screens/AssetDirectory";
import AssetAllocation from "@/components/screens/AssetAllocation";
import ResourceBooking from "@/components/screens/ResourceBooking";
import MaintenanceManagement from "@/components/screens/MaintenanceManagement";
import AssetAudit from "@/components/screens/AssetAudit";
import ReportsAnalytics from "@/components/screens/ReportsAnalytics";
import ActivityLogs from "@/components/screens/ActivityLogs";

export default function Home() {
  const [user, setUser] = useState<any | null>(null);
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    setActiveScreen("dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setActiveScreen("dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Initializing AssetFlow...
        </div>
      </div>
    );
  }

  // Redirect to Login if unauthenticated
  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardOverview user={user} setActiveScreen={setActiveScreen} />;
      case "org-setup":
        return <OrgSetup user={user} />;
      case "assets":
        return <AssetDirectory user={user} />;
      case "allocations":
        return <AssetAllocation user={user} />;
      case "bookings":
        return <ResourceBooking user={user} />;
      case "maintenance":
        return <MaintenanceManagement user={user} />;
      case "audits":
        return <AssetAudit user={user} />;
      case "reports":
        return <ReportsAnalytics />;
      case "logs":
        return <ActivityLogs />;
      default:
        return <DashboardOverview user={user} setActiveScreen={setActiveScreen} />;
    }
  };

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      activeScreen={activeScreen}
      setActiveScreen={setActiveScreen}
    >
      {renderActiveScreen()}
    </MainLayout>
  );
}
