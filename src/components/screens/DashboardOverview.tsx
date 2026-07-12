"use client";

import { useState, useEffect } from "react";

interface DashboardOverviewProps {
  user: any;
  setActiveScreen: (screen: string) => void;
}

export default function DashboardOverview({ user, setActiveScreen }: DashboardOverviewProps) {
  const [stats, setStats] = useState({ available: 0, allocated: 0, maintenance: 0, bookings: 0, overdue: 0 });
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rr, ra, rl] = await Promise.all([
          fetch("/api/reports").then(r => r.json()),
          fetch("/api/assets").then(r => r.json()),
          fetch("/api/logs").then(r => r.json()),
        ]);

        const sc = rr.statusCounts ?? [];
        const count = (status: string) => sc.find((s: any) => s.status === status)?.count ?? 0;

        const now = new Date();
        const overdue: any[] = [];
        (ra.assets ?? []).forEach((asset: any) => {
          (asset.allocations ?? []).forEach((alloc: any) => {
            if (alloc.status === "Active" && alloc.expectedReturnDate) {
              const due = new Date(alloc.expectedReturnDate);
              if (due < now) overdue.push({ ...alloc, assetTag: asset.tag, assetName: asset.name, days: Math.round((now.getTime() - due.getTime()) / 86_400_000) });
            }
          });
        });

        setStats({ available: count("Available"), allocated: count("Allocated"), maintenance: count("UnderMaintenance"), bookings: (rr.resourceBookings ?? []).reduce((a: number, b: any) => a + b.count, 0), overdue: overdue.length });
        setOverdueItems(overdue);
        setRecentLogs((rl.logs ?? []).slice(0, 6));
      } catch { /* silent */ } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-sm text-[var(--muted)]">Loading…</div>
  );

  const isManager = user.role === "Admin" || user.role === "AssetManager";

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-lg font-semibold text-[var(--fg)]">Overview</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Real-time asset counts and recent activity.</p>
      </div>

      {/* Stats strip — not a card grid, a horizontal divider row like Stripe */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-[var(--border)] border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
        {[
          { label: "Available",    value: stats.available,   color: "var(--success)" },
          { label: "Allocated",    value: stats.allocated,   color: "var(--accent)" },
          { label: "In repair",    value: stats.maintenance, color: "var(--warning)" },
          { label: "Bookings",     value: stats.bookings,    color: "var(--fg)" },
          { label: "Overdue",      value: stats.overdue,     color: "var(--danger)", alert: stats.overdue > 0 },
        ].map(s => (
          <div key={s.label} className="px-5 py-4">
            <p className="text-xs text-[var(--muted)] font-medium">{s.label}</p>
            <p className="text-2xl font-semibold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {isManager && (
          <button onClick={() => setActiveScreen("assets")} className="erp-btn-primary text-sm">
            Register asset
          </button>
        )}
        <button onClick={() => setActiveScreen("bookings")}    className="erp-btn-secondary text-sm">Book a resource</button>
        <button onClick={() => setActiveScreen("maintenance")} className="erp-btn-secondary text-sm">Raise maintenance ticket</button>
        {user.role === "Admin" && (
          <button onClick={() => setActiveScreen("org-setup")} className="erp-btn-secondary text-sm">Manage organization</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Overdue table */}
        <div className="lg:col-span-3">
          <div className="ui-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--fg)]">Overdue returns</h2>
              {overdueItems.length > 0 && (
                <span className="badge badge-danger">{overdueItems.length} overdue</span>
              )}
            </div>
            {overdueItems.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-4 text-center">No overdue assets.</p>
            ) : (
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Asset</th>
                    <th>Held by</th>
                    <th>Days overdue</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {overdueItems.map((item, i) => (
                    <tr key={i}>
                      <td><span className="tech-code text-[var(--accent)] font-medium">{item.assetTag}</span></td>
                      <td className="font-medium text-[var(--fg)]">{item.assetName}</td>
                      <td className="text-[var(--muted)]">{item.employee?.name ?? "—"}</td>
                      <td><span className="badge badge-danger">{item.days}d</span></td>
                      <td>
                        <button onClick={() => setActiveScreen("allocations")} className="text-xs text-[var(--accent)] hover:underline font-medium">
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Activity log */}
        <div className="lg:col-span-2">
          <div className="ui-card h-full">
            <h2 className="text-sm font-semibold text-[var(--fg)] mb-4">Recent activity</h2>
            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No recent activity.</p>
              ) : recentLogs.map(log => (
                <div key={log.id} className="pb-3 border-b border-[var(--border-subtle)] last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-[var(--fg)] leading-snug">{log.details}</p>
                    <span className="text-xs text-[var(--muted)] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 tech-code">{log.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
