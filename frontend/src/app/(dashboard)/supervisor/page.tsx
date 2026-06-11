"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TicketIcon, CheckCircle, AlertTriangle,
  LogOut, Bell, LayoutDashboard, Users, BarChart2,
  Settings, MapPin, User, X, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";

type Priority = "low" | "medium" | "high" | "critical";
type Status   = "submitted" | "claimed" | "in_progress" | "awaiting" | "resolved" | "closed";

type TicketItem = {
  id: number; reference: string; title: string;
  priority: Priority; status: Status;
  location: string; submitted_by_name: string;
  claimed_by_name?: string | null; created_at: string;
};

type InternStat = { name: string; claimed: number; resolved: number; status: string };
type Analytics  = {
  total_tickets: number; open_tickets: number;
  resolved_today: number; critical_open: number;
  priority_breakdown: Record<string, number>;
  intern_stats: InternStat[];
};
type Notification = { id: number; message: string; type: string; is_read: boolean; created_at: string };

const priorityStyle: Record<Priority, { bg: string; text: string }> = {
  low:      { bg: "#E8F5EE", text: "#1A6B3C" },
  medium:   { bg: "#FFF4E5", text: "#FF8C00" },
  high:     { bg: "#FFE5E5", text: "#CC0000" },
  critical: { bg: "#3D0000", text: "#FF6B6B" },
};

const statusStyle: Record<Status, { bg: string; text: string; label: string }> = {
  submitted:   { bg: "#EBF0FA", text: "#003399", label: "Submitted"   },
  claimed:     { bg: "#FFF4E5", text: "#FF8C00", label: "Claimed"     },
  in_progress: { bg: "#F3E8FF", text: "#9333EA", label: "In Progress" },
  awaiting:    { bg: "#FFE5E5", text: "#CC0000", label: "Awaiting"    },
  resolved:    { bg: "#E8F5EE", text: "#1A6B3C", label: "Resolved"    },
  closed:      { bg: "#F1F5F9", text: "#64748B", label: "Closed"      },
};

const navItems = [
  { icon: LayoutDashboard, label: "Overview",    href: "/supervisor"           },
  { icon: TicketIcon,      label: "All Tickets", href: "/supervisor/tickets"   },
  { icon: Users,           label: "Intern Team", href: "/supervisor/team"      },
  { icon: BarChart2,       label: "Analytics",   href: "/supervisor/analytics" },
  { icon: Settings,        label: "Settings",    href: "/supervisor/settings"  },
];

export default function SupervisorDashboard() {
  const router = useRouter();
  const { user, logout, rehydrate } = useAuthStore();
  const [tickets,       setTickets]       = useState<TicketItem[]>([]);
  const [analytics,     setAnalytics]     = useState<Analytics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [loading,       setLoading]       = useState(true);

  const myName  = user?.name || "Supervisor";
  const initial = myName.charAt(0).toUpperCase();

  const fetchAll = useCallback(async () => {
    try {
      const [tRes, aRes, nRes] = await Promise.all([
        api.get("/api/tickets/"),
        api.get("/api/analytics/summary/"),
        api.get("/api/notifications/"),
      ]);
      setTickets(tRes.data);
      setAnalytics(aRes.data);
      setNotifications(nRes.data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { rehydrate(); fetchAll(); }, [fetchAll]);

  // Real-time: refresh when any ticket event fires
  useWebSocket("/ws/tickets/", () => { fetchAll(); });

  function handleLogout() { logout(); router.push("/login"); }

  async function markNotifRead(id: number) {
    try {
      await api.patch(`/api/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* silent */ }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Build pie chart data from analytics
  const pieData = analytics ? [
    { name: "Low",      value: analytics.priority_breakdown.low,      color: "#1A6B3C" },
    { name: "Medium",   value: analytics.priority_breakdown.medium,   color: "#FF8C00" },
    { name: "High",     value: analytics.priority_breakdown.high,     color: "#CC0000" },
    { name: "Critical", value: analytics.priority_breakdown.critical, color: "#7B0000" },
  ] : [];

  // Build bar chart from intern stats
  const barData = analytics?.intern_stats.map(i => ({
    name: i.name.split(" ")[0],
    claimed: i.claimed,
    resolved: i.resolved,
  })) || [];

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
                backgroundColor: item.href === "/supervisor" ? "rgba(255,255,255,0.15)" : "transparent",
                color: item.href === "/supervisor" ? "white" : "rgba(255,255,255,0.55)",
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

        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#003399" }}>Supervisor Overview</h1>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{new Date().toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — Real-time dashboard</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, backgroundColor: "#E8F5EE" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1A6B3C" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1A6B3C" }}>Live</span>
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ padding: 8, borderRadius: 10, border: "none", backgroundColor: "transparent", cursor: "pointer", position: "relative" }}>
                <Bell size={20} color="#003399" />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#FFCC00", color: "#003399", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ position: "absolute", right: 0, top: 48, width: 320, backgroundColor: "white", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 50, overflow: "hidden", border: "1px solid #E2E8F0" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#003399" }}>Notifications</p>
                    <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="#94A3B8" /></button>
                  </div>
                  {notifications.length === 0 && <p style={{ padding: 20, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No notifications.</p>}
                  {notifications.slice(0, 10).map(n => (
                    <div key={n.id} onClick={() => markNotifRead(n.id)}
                      style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", cursor: "pointer", backgroundColor: n.is_read ? "white" : "#F0F4FF" }}>
                      <p style={{ fontSize: 13, color: "#374151" }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#003399", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>{initial}</div>
          </div>
        </header>

        <div style={{ height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>

          {/* STAT CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
            {[
              { label: "Open Tickets",    value: analytics?.open_tickets     ?? "—", icon: TicketIcon,    color: "#003399" },
              { label: "Resolved Today",  value: analytics?.resolved_today   ?? "—", icon: CheckCircle,   color: "#1A6B3C" },
              { label: "Critical Open",   value: analytics?.critical_open    ?? "—", icon: AlertTriangle, color: "#CC0000" },
              { label: "Total Tickets",   value: analytics?.total_tickets    ?? "—", icon: TrendingUp,    color: "#FF8C00" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ backgroundColor: "white", borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: stat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <div>
                  <p style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{loading ? "..." : stat.value}</p>
                  <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CHARTS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 32 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ backgroundColor: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399", marginBottom: 16 }}>Intern Performance (Claimed vs Resolved)</h3>
              {barData.length === 0
                ? <p style={{ color: "#94A3B8", fontSize: 14, padding: 24, textAlign: "center" }}>No intern data yet.</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} barCategoryGap="30%">
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} />
                      <Bar dataKey="claimed"  fill="#003399" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="resolved" fill="#FFCC00" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
              }
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ backgroundColor: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399", marginBottom: 16 }}>By Priority</h3>
              {pieData.every(p => p.value === 0)
                ? <p style={{ color: "#94A3B8", fontSize: 14, padding: 24, textAlign: "center" }}>No ticket data yet.</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: "#64748B" }}>{v}</span>} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
              }
            </motion.div>
          </div>

          {/* INTERN PERFORMANCE TABLE */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 32, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399" }}>Intern Performance</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  {["Intern", "Claimed", "Resolved", "Performance"].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && (analytics?.intern_stats || []).length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No interns have claimed tickets yet.</td></tr>
                )}
                {(analytics?.intern_stats || []).map((intern, i) => {
                  const score = intern.claimed > 0 ? Math.round((intern.resolved / intern.claimed) * 100) : 0;
                  return (
                    <tr key={i} style={{ borderTop: "1px solid #F1F5F9" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "#EBF0FA", color: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                            {intern.name.charAt(0)}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{intern.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 700, color: "#003399" }}>{intern.claimed}</td>
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 700, color: "#1A6B3C" }}>{intern.resolved}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

          {/* ALL TICKETS TABLE */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399" }}>All Active Tickets</h3>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{loading ? "Loading..." : `${tickets.length} total`}</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    {["Reference", "Title", "Location", "Submitted By", "Assigned To", "Priority", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!loading && tickets.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>No tickets yet.</td></tr>
                  )}
                  {tickets.map((ticket, i) => (
                    <tr key={ticket.id} style={{ borderTop: "1px solid #F1F5F9" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#003399" }}>{ticket.reference}</span>
                      </td>
                      <td style={{ padding: "14px 20px", maxWidth: 200 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ticket.title}</p>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={12} color="#94A3B8" />
                          <span style={{ fontSize: 13, color: "#64748B" }}>{ticket.location}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <User size={12} color="#94A3B8" />
                          <span style={{ fontSize: 13, color: "#64748B" }}>{ticket.submitted_by_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: 13, color: ticket.claimed_by_name ? "#003399" : "#94A3B8", fontWeight: ticket.claimed_by_name ? 600 : 400 }}>
                          {ticket.claimed_by_name || "Unassigned"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, backgroundColor: priorityStyle[ticket.priority]?.bg, color: priorityStyle[ticket.priority]?.text }}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, backgroundColor: statusStyle[ticket.status]?.bg, color: statusStyle[ticket.status]?.text }}>
                          {statusStyle[ticket.status]?.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </main>
      </div>
    </div>
  );
}