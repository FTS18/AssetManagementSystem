"use client";

import { useState, useEffect } from "react";

interface DashboardOverviewProps {
  user: any;
  setActiveScreen: (screen: string) => void;
}

export default function DashboardOverview({ user, setActiveScreen }: DashboardOverviewProps) {
  const [stats, setStats] = useState<any>({
    available: 0,
    allocated: 0,
    maintenance: 0,
    bookings: 0,
    transfers: 0,
    overdue: 0,
  });
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resReports, resAssets, resLogs] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/assets"),
        fetch("/api/logs"),
      ]);

      const dataReports = await resReports.json();
      const dataAssets = await resAssets.json();
      const dataLogs = await resLogs.json();

      // Aggregate counts from reports
      const statusCounts = dataReports.statusCounts || [];
      const available = statusCounts.find((s: any) => s.status === "Available")?.count || 0;
      const allocated = statusCounts.find((s: any) => s.status === "Allocated")?.count || 0;
      const maintenance = statusCounts.find((s: any) => s.status === "UnderMaintenance")?.count || 0;
      
      // Calculate bookings
      const bookingsCount = (dataReports.resourceBookings || []).reduce((acc: number, item: any) => acc + item.count, 0);

      // Check overdue allocations
      const overdueList: any[] = [];
      const now = new Date();
      (dataAssets.assets || []).forEach((asset: any) => {
        if (asset.allocations) {
          asset.allocations.forEach((alloc: any) => {
            if (alloc.status === "Active" && alloc.expectedReturnDate) {
              const returnDate = new Date(alloc.expectedReturnDate);
              if (returnDate < now) {
                overdueList.push({
                  ...alloc,
                  assetTag: asset.tag,
                  assetName: asset.name,
                  overdueDays: Math.round((now.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24)),
                });
              }
            }
          });
        }
      });

      setOverdueItems(overdueList);
      setRecentLogs((dataLogs.logs || []).slice(0, 5));

      setStats({
        available,
        allocated,
        maintenance,
        bookings: bookingsCount,
        transfers: (dataReports.transfers || []).filter((t: any) => t.status === "Pending").length,
        overdue: overdueList.length,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div className="text-xs text-[var(--muted)]">Loading dashboard dashboard overview...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-1">Operational Overview</h1>
        <p className="text-xs text-[var(--muted)]">Real-time indicators, alert warnings, and recent activity logs.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="erp-card bg-[var(--surface)] p-4 flex flex-col justify-between h-24">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Available</span>
          <span className="text-2xl font-bold text-[var(--success-text)]">{stats.available}</span>
        </div>
        <div className="erp-card bg-[var(--surface)] p-4 flex flex-col justify-between h-24">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Allocated</span>
          <span className="text-2xl font-bold text-[var(--accent)]">{stats.allocated}</span>
        </div>
        <div className="erp-card bg-[var(--surface)] p-4 flex flex-col justify-between h-24">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)]">In Repair</span>
          <span className="text-2xl font-bold text-[var(--warning-text)]">{stats.maintenance}</span>
        </div>
        <div className="erp-card bg-[var(--surface)] p-4 flex flex-col justify-between h-24">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Bookings</span>
          <span className="text-2xl font-bold">{stats.bookings}</span>
        </div>
        <div className="erp-card bg-[var(--surface)] p-4 flex flex-col justify-between h-24">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Transfers</span>
          <span className="text-2xl font-bold">{stats.transfers}</span>
        </div>
        <div className="erp-card bg-[var(--surface)] p-4 flex flex-col justify-between h-24 border-[var(--danger-text)] bg-red-950/5">
          <span className="text-[10px] uppercase font-bold text-[var(--danger-text)]">Overdue Returns</span>
          <span className="text-2xl font-bold text-[var(--danger-text)]">{stats.overdue}</span>
        </div>
      </div>

      {/* Quick Action triggers */}
      <div className="erp-card space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {(user.role === "Admin" || user.role === "AssetManager") && (
            <button onClick={() => setActiveScreen("assets")} className="erp-btn-primary text-xs">
              Register Asset
            </button>
          )}
          <button onClick={() => setActiveScreen("bookings")} className="erp-btn-secondary text-xs">
            Book Shared Resource
          </button>
          <button onClick={() => setActiveScreen("maintenance")} className="erp-btn-secondary text-xs">
            Raise Maintenance Ticket
          </button>
          {user.role === "Admin" && (
            <button onClick={() => setActiveScreen("org-setup")} className="erp-btn-secondary text-xs">
              Manage Employee Directory
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue alerts workspace */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Overdue Returns Alert</h2>
          <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Asset Name</th>
                  <th>Held By</th>
                  <th>Days Overdue</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {overdueItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-xs text-[var(--muted)]">
                      No overdue assets flagged.
                    </td>
                  </tr>
                ) : (
                  overdueItems.map((item, idx) => (
                    <tr key={idx} className="border-l-2 border-[var(--danger-text)]">
                      <td className="tech-code font-bold text-[var(--danger-text)]">{item.assetTag}</td>
                      <td className="font-semibold">{item.assetName}</td>
                      <td className="text-xs">{item.employee?.name || "Unassigned"}</td>
                      <td className="tech-code text-xs text-[var(--danger-text)] font-semibold">{item.overdueDays} days</td>
                      <td>
                        <button
                          onClick={() => setActiveScreen("allocations")}
                          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] underline font-semibold"
                        >
                          Resolve Handover
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent logs */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Recent Action Logs</h2>
          <div className="erp-card bg-[var(--surface)] p-4 space-y-4 h-[350px] overflow-y-auto">
            {recentLogs.map((log) => (
              <div key={log.id} className="border-b border-[var(--border)] pb-2 last:border-b-0">
                <div className="flex justify-between items-center text-[10px] text-[var(--muted)] tech-code">
                  <span>{log.action}</span>
                  <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-xs mt-1 font-medium leading-tight">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
