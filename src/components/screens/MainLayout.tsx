"use client";

import { useState } from "react";

interface MainLayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const menuItems = [
  { id: "dashboard",   label: "Dashboard",                roles: ["Admin","AssetManager","DeptHead","Employee"] },
  { id: "org-setup",   label: "Organization",             roles: ["Admin"] },
  { id: "assets",      label: "Asset directory",          roles: ["Admin","AssetManager","DeptHead","Employee"] },
  { id: "allocations", label: "Allocations & transfers",  roles: ["Admin","AssetManager","DeptHead","Employee"] },
  { id: "bookings",    label: "Resource booking",         roles: ["Admin","AssetManager","DeptHead","Employee"] },
  { id: "maintenance", label: "Maintenance",              roles: ["Admin","AssetManager","DeptHead","Employee"] },
  { id: "audits",      label: "Asset audits",             roles: ["Admin","AssetManager","DeptHead","Employee"] },
  { id: "reports",     label: "Reports & analytics",      roles: ["Admin","AssetManager","DeptHead"] },
  { id: "logs",        label: "Activity logs",            roles: ["Admin","AssetManager","DeptHead","Employee"] },
];

const roleLabel: Record<string, string> = {
  Admin:        "Admin",
  AssetManager: "Asset manager",
  DeptHead:     "Department head",
  Employee:     "Employee",
};

export default function MainLayout({
  user,
  onLogout,
  children,
  activeScreen,
  setActiveScreen,
}: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const filtered = menuItems.filter(m => m.roles.includes(user.role));

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--accent-fg)] font-bold text-sm leading-none">A</span>
          </div>
          <span className="font-semibold text-[var(--fg)] text-sm tracking-tight">AssetFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {filtered.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveScreen(item.id); setMobileOpen(false); }}
            className={[
              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors duration-[var(--duration-fast)] text-left",
              activeScreen === item.id
                ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* User / logout */}
      <div className="px-3 py-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] bg-[var(--surface-2)]">
          <div className="h-7 w-7 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--accent)] font-semibold text-xs leading-none">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--fg)] truncate">{user.name}</p>
            <p className="text-xs text-[var(--muted)] truncate">{roleLabel[user.role] ?? user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-1.5 w-full text-left px-2.5 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--danger)] rounded-[var(--radius-sm)] hover:bg-[var(--danger-bg)] transition-colors duration-[var(--duration-fast)]"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--fg)]">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 z-[300] h-screen w-56 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col transition-transform duration-200",
          "md:translate-x-0 md:static md:z-auto md:flex",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <NavContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface-2)] text-[var(--muted)]"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="text-sm font-semibold text-[var(--fg)]">AssetFlow</span>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
