"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, TicketIcon, Users, BarChart2, Settings, LogOut } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

type InternStat = { name: string; claimed: number; resolved: number };
type Analytics  = {
  total_tickets: number; open_tickets: number;
  resolved_today: number; critical_open: number;
  priority_breakdown: Record<string, number>;
  intern_stats: InternStat[];
};

const navItems = [
  { icon: LayoutDashboard, label: "Overview",    href: "/supervisor"           },
  { icon: TicketIcon,      label: "All Tickets", href: "/supervisor/tickets"   },
  { icon: Users,           label: "Intern Team", href: "/supervisor/team"      },
  { icon: BarChart2,       label: "Analytics",   href: "/supervisor/analytics" },
  { icon: Settings,        label: "Settings",    href: "/supervisor/settings"  },
];

export default function SupervisorAnalyticsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading,   setLoading]   = useState(true);

  const myName  = user?.name || "Supervisor";
  const initial = myName.charAt(0).toUpperCase();

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.get("/api/analytics/summary/");
      setAnalytics(res.data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  function handleLogout() { logout(); router.push("/login"); }

  const pieData = analytics ? [
    { name: "Low",      value: analytics.priority_breakdown.low,      color: "#1A6B3C" },
    { name: "Medium",   value: analytics.priority_breakdown.medium,   color: "#FF8C00" },
    { name: "High",     value: analytics.priority_breakdown.high,     color: "#CC0000" },
    { name: "Critical", value: analytics.priority_breakdown.critical, color: "#7B0000" },
  ] : [];

  const barData = analytics?.intern_stats.map(i => ({
    name: i.name.split(" ")[0],
    claimed: i.claimed,
    resolved: i.resolved,
    rate: i.claimed > 0 ? Math.round((i.resolved / i.claimed) * 100) : 0,
  })) || [];

  const kpis = [
    { label: "Total Tickets",   value: analytics?.total_tickets  ?? "—", color: "#003399" },
    { label: "Open Tickets",    value: analytics?.open_tickets   ?? "—", color: "#FF8C00" },
    { label: "Resolved Today",  value: analytics?.resolved_today ?? "—", color: "#1A6B3C" },
    { label: "Critical Open",   value: analytics?.critical_open  ?? "—", color: "#CC0000" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#F5F7FA" }}>

      {/* SIDEBAR */}
      <aside style={{ width: 240, minWidth: 240, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#003399" }}>
        <div style={{ padding: 24, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/coat-of-arms.jpg" alt="OPCS" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: 14 }}>OPCS eSupport</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>Supervisor Panel</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item, i) => (
            <button key={i} onClick={() => router.push(item.href)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                backgroundColor: item.href === "/supervisor/analytics" ? "rgba(255,255,255,0.15)" : "transparent",
                color: item.href === "/supervisor/analytics" ? "white" : "rgba(255,255,255,0.55)",
                fontSize: 14, fontWeight: 600, textAlign: "left", width: "100%" }}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#FFCC00", color: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{initial}</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{myName}</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>ICT Director</p>
            </div>
            <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
              <LogOut size={15} color="#93C5FD" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#003399" }}>Analytics</h1>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Performance metrics and KPI overview</p>
          </div>
        </header>

        <div style={{ height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
            {kpis.map((k, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ backgroundColor: "white", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `5px solid ${k.color}` }}>
                <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 8 }}>{k.label}</p>
                <p style={{ fontSize: 36, fontWeight: 900, color: k.color, lineHeight: 1 }}>{loading ? "..." : k.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>

            {/* Priority Breakdown */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ backgroundColor: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399", marginBottom: 16 }}>Tickets by Priority</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: "#64748B" }}>{v}</span>} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Intern Resolution Rate */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ backgroundColor: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399", marginBottom: 16 }}>Intern Resolution Rate (%)</h3>
              {barData.length === 0
                ? <p style={{ color: "#94A3B8", fontSize: 14, padding: 24, textAlign: "center" }}>No data yet.</p>
                : <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} barCategoryGap="40%">
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} formatter={(v: unknown) => [`${v}%`, "Rate"]} />
                      <Bar dataKey="rate" fill="#003399" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
              }
            </motion.div>
          </div>

          {/* Intern Detail Table */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399" }}>Intern Breakdown</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  {["Intern", "Claimed", "Resolved", "Remaining", "Resolution Rate"].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && (analytics?.intern_stats || []).length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No intern activity yet.</td></tr>
                )}
                {(analytics?.intern_stats || []).map((intern, i) => {
                  const score = intern.claimed > 0 ? Math.round((intern.resolved / intern.claimed) * 100) : 0;
                  return (
                    <tr key={i} style={{ borderTop: "1px solid #F1F5F9" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#EBF0FA", color: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>
                            {intern.name.charAt(0)}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{intern.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 700, color: "#003399" }}>{intern.claimed}</td>
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 700, color: "#1A6B3C" }}>{intern.resolved}</td>
                      <td style={{ padding: "14px 20px", fontSize: 14, color: "#FF8C00", fontWeight: 600 }}>{intern.claimed - intern.resolved}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, height: 8, borderRadius: 99, backgroundColor: "#F1F5F9" }}>
                            <div style={{ height: "100%", borderRadius: 99, backgroundColor: score >= 80 ? "#1A6B3C" : score >= 60 ? "#FF8C00" : "#CC0000", width: `${score}%`, transition: "width 0.5s ease" }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", minWidth: 36 }}>{score}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
