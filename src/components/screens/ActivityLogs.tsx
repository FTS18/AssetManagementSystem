"use client";

import { useState, useEffect } from "react";

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetch("/api/logs");
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  if (loading) {
    return <div className="text-xs text-[var(--muted)]">Loading activity log registry...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-1">System Activity Logs</h1>
        <p className="text-xs text-[var(--muted)]">Review audit trails, administrative state changes, and hardware tracking histories.</p>
      </div>

      {/* Logs list */}
      <div className="erp-card bg-[var(--surface)] space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Append-Only Audit Stream</h2>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">No logs recorded in this session.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 border border-[var(--border)] bg-[var(--background)] flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="tech-code text-xs font-bold text-[var(--accent)]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      by {log.employee?.name || "System"} ({log.employee?.email || "automated"})
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{log.details}</p>
                </div>
                <div className="text-[10px] text-[var(--muted)] tech-code whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
