"use client";

import { useState } from "react";

interface MainLayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

export default function MainLayout({
  user,
  onLogout,
  children,
  activeScreen,
  setActiveScreen,
}: MainLayoutProps) {
  // Define nav links with role authorization filters
  const menuItems = [
    { id: "dashboard", label: "Dashboard", roles: ["Admin", "AssetManager", "DeptHead", "Employee"] },
    { id: "org-setup", label: "Organization Setup", roles: ["Admin"] },
    { id: "assets", label: "Asset Directory", roles: ["Admin", "AssetManager", "DeptHead", "Employee"] },
    { id: "allocations", label: "Allocations & Transfers", roles: ["Admin", "AssetManager", "DeptHead", "Employee"] },
    { id: "bookings", label: "Resource Booking", roles: ["Admin", "AssetManager", "DeptHead", "Employee"] },
    { id: "maintenance", label: "Maintenance Board", roles: ["Admin", "AssetManager", "DeptHead", "Employee"] },
    { id: "audits", label: "Asset Audits", roles: ["Admin", "AssetManager", "DeptHead", "Employee"] },
    { id: "reports", label: "Analytics & Reports", roles: ["Admin", "AssetManager", "DeptHead"] },
    { id: "logs", label: "Activity Logs", roles: ["Admin", "AssetManager", "DeptHead", "Employee"] },
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--surface)] flex flex-col h-auto md:h-screen sticky top-0 z-[10]">
        {/* Brand Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo-white.png" alt="AssetFlow" className="h-6 w-auto hidden dark:block" />
            <img src="/logo-black.png" alt="AssetFlow" className="h-6 w-auto block dark:hidden" />
            <span className="text-sm font-bold tracking-tight uppercase">AssetFlow</span>
          </div>
          <span className="tech-code text-[10px] px-2 py-0.5 border border-[var(--border)] uppercase">
            {user.role}
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeScreen === item.id
                  ? "bg-[var(--background)] text-[var(--accent)] border-l-2 border-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--background)] space-y-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold">{user.name}</span>
            <span className="text-[10px] text-[var(--muted)] tech-code">{user.email}</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full erp-btn-secondary text-[10px] font-bold uppercase tracking-wider py-1.5 text-center"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
