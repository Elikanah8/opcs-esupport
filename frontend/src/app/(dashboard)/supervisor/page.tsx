"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TicketIcon, CheckCircle, AlertTriangle, Clock,
  LogOut, Bell, LayoutDashboard, Users, BarChart2,
  Settings, ChevronDown, TrendingUp, MapPin, User
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

// --- TYPE DEFINITIONS ---
type Priority = "low" | "medium" | "high" | "critical";
type Status   = "submitted" | "claimed" | "in_progress" | "awaiting" | "resolved";

type TicketItem = {
  id: string; reference: string; title: string;
  priority: Priority; status: Status;
  location: string; submittedBy: string;
  claimedBy?: string; createdAt: string;
};

type InternStat = {
  name: string; claimed: number; resolved: number; avgTime: string; status: "active" | "away";
};

// --- MOCK TICKET DATA ---
const mockTickets: TicketItem[] = [
  { id: "1", reference: "TKT-001", title: "Printer not connecting to network",      priority: "high",     status: "submitted",   location: "3rd Floor - Finance",    submittedBy: "Jane Mwangi",  createdAt: "09:00" },
  { id: "2", reference: "TKT-002", title: "Outlook not syncing emails",             priority: "medium",   status: "in_progress", location: "2nd Floor - Admin",      submittedBy: "Peter Otieno", claimedBy: "Elikanah", createdAt: "09:30" },
  { id: "3", reference: "TKT-003", title: "Internet down in boardroom",             priority: "critical", status: "claimed",     location: "1st Floor - Boardroom",  submittedBy: "Sarah Njeri",  claimedBy: "Mike",     createdAt: "08:00" },
  { id: "4", reference: "TKT-004", title: "PDF conversion not working",             priority: "low",      status: "resolved",    location: "4th Floor - Legal",      submittedBy: "David Kamau",  claimedBy: "Elikanah", createdAt: "07:00" },
  { id: "5", reference: "TKT-005", title: "VPN not connecting remotely",            priority: "high",     status: "submitted",   location: "5th Floor - Executive",  submittedBy: "Grace Wanjiku",               createdAt: "10:00" },
  { id: "6", reference: "TKT-006", title: "Monitor displaying wrong resolution",   priority: "low",      status: "resolved",    location: "3rd Floor - Finance",    submittedBy: "Tom Kariuki",  claimedBy: "Mike",     createdAt: "06:30" },
];

// --- MOCK INTERN PERFORMANCE DATA ---
const internStats: InternStat[] = [
  { name: "Elikanah Njuru", claimed: 5, resolved: 4, avgTime: "38 min", status: "active" },
  { name: "Mike Ochieng",   claimed: 4, resolved: 3, avgTime: "52 min", status: "active" },
  { name: "Faith Akinyi",   claimed: 3, resolved: 3, avgTime: "29 min", status: "away"   },
  { name: "Brian Mutua",    claimed: 2, resolved: 1, avgTime: "61 min", status: "active" },
];

// --- CHART DATA ---
const weeklyData = [
  { day: "Mon", tickets: 8,  resolved: 7  },
  { day: "Tue", tickets: 12, resolved: 10 },
  { day: "Wed", tickets: 6,  resolved: 6  },
  { day: "Thu", tickets: 14, resolved: 11 },
  { day: "Fri", tickets: 9,  resolved: 8  },
  { day: "Sat", tickets: 3,  resolved: 3  },
];

const pieData = [
  { name: "Low",      value: 3, color: "#1A6B3C" },
  { name: "Medium",   value: 5, color: "#FF8C00" },
  { name: "High",     value: 4, color: "#CC0000" },
  { name: "Critical", value: 2, color: "#7B0000" },
];

// Badge styles
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
};

// Sidebar nav
const navItems = [
  { icon: LayoutDashboard, label: "Overview",    href: "/supervisor"           },
  { icon: TicketIcon,      label: "All Tickets", href: "/supervisor/tickets"   },
  { icon: Users,           label: "Intern Team", href: "/supervisor/team"      },
  { icon: BarChart2,       label: "Analytics",   href: "/supervisor/analytics" },
  { icon: Settings,        label: "Settings",    href: "/supervisor/settings"  },
];

export default function SupervisorDashboard() {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  // Summary stats
  const totalOpen     = mockTickets.filter(t => t.status !== "resolved").length;
  const totalResolved = mockTickets.filter(t => t.status === "resolved").length;
  const criticalOpen  = mockTickets.filter(t => t.priority === "critical" && t.status !== "resolved").length;
  const activeInterns = internStats.filter(i => i.status === "active").length;

  return (
    <div
      style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#F5F7FA" }}
    >

      {/* ===================== LEFT SIDEBAR ===================== */}
      <aside style={{ width: 240, minWidth: 240, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#003399" }}>

        {/* Logo */}
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/coat-of-arms.jpg" alt="OPCS" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>OPCS eSupport</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>Supervisor Panel</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => router.push(item.href)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer", backgroundColor: item.href === "/supervisor" ? "rgba(255,255,255,0.15)" : "transparent", color: item.href === "/supervisor" ? "white" : "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 600, textAlign: "left", width: "100%" }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Supervisor profile */}
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#FFCC00", color: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              S
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Supervisor</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>ICT Director</p>
            </div>
            <LogOut size={15} style={{ color: "#93C5FD", cursor: "pointer", flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#003399" }}>Supervisor Overview</h1>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
              Thursday, 15 May 2026 — Real-time dashboard
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, backgroundColor: "#E8F5EE" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1A6B3C" }} className="animate-pulse" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1A6B3C" }}>Live</span>
            </div>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{ padding: 8, borderRadius: 10, border: "none", backgroundColor: "transparent", cursor: "pointer" }}
              >
                <Bell size={20} style={{ color: "#003399" }} />
                <span style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#FFCC00", color: "#003399", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  4
                </span>
              </button>

              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ position: "absolute", right: 0, top: 48, width: 320, backgroundColor: "white", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 50, overflow: "hidden", border: "1px solid #E2E8F0" }}
                >
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#003399" }}>Notifications</p>
                  </div>
                  {[
                    { msg: "Critical ticket — Boardroom internet still unresolved", time: "5 min ago", urgent: true  },
                    { msg: "TKT-002 claimed by Elikanah",                           time: "12 min ago", urgent: false },
                    { msg: "Faith Akinyi marked as away",                           time: "30 min ago", urgent: false },
                    { msg: "Weekly report is ready for review",                     time: "1 hr ago",   urgent: false },
                  ].map((n, i) => (
                    <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", cursor: "pointer", backgroundColor: n.urgent ? "#FFF4F4" : "white" }}>
                      <p style={{ fontSize: 13, color: n.urgent ? "#CC0000" : "#374151", fontWeight: n.urgent ? 600 : 400 }}>{n.msg}</p>
                      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{n.time}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Avatar */}
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#003399", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              S
            </div>
          </div>
        </header>

        {/* Gold bar */}
        <div style={{ height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        {/* Scrollable page body */}
        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>

          {/* ---- STAT CARDS ---- */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
            {[
              { label: "Open Tickets",    value: totalOpen,     icon: TicketIcon,    color: "#003399" },
              { label: "Resolved Today",  value: totalResolved, icon: CheckCircle,   color: "#1A6B3C" },
              { label: "Critical Open",   value: criticalOpen,  icon: AlertTriangle, color: "#CC0000" },
              { label: "Active Interns",  value: activeInterns, icon: Users,         color: "#FF8C00" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ backgroundColor: "white", borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: stat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ---- CHARTS ROW ---- */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 32 }}>

            {/* Weekly bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ backgroundColor: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399" }}>Weekly Ticket Volume</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#003399" }} />
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>Submitted</span>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#FFCC00" }} />
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>Resolved</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} barCategoryGap="30%">
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
                  />
                  <Bar dataKey="tickets"  fill="#003399" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" fill="#FFCC00" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Priority breakdown pie chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ backgroundColor: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399", marginBottom: 16 }}>
                By Priority
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 12, color: "#64748B" }}>{value}</span>}
                  />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* ---- INTERN PERFORMANCE TABLE ---- */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 32, overflow: "hidden" }}
          >
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399" }}>Intern Performance</h3>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>Today</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC" }}>
                  {["Intern", "Status", "Claimed", "Resolved", "Avg. Time", "Performance"].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {internStats.map((intern, i) => {
                  // Calculate performance score as percentage of resolved vs claimed
                  const score = intern.claimed > 0 ? Math.round((intern.resolved / intern.claimed) * 100) : 0;
                  return (
                    <tr key={i} style={{ borderTop: "1px solid #F1F5F9" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Name */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "#EBF0FA", color: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                            {intern.name.charAt(0)}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{intern.name}</span>
                        </div>
                      </td>

                      {/* Online status */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, backgroundColor: intern.status === "active" ? "#E8F5EE" : "#F1F5F9", color: intern.status === "active" ? "#1A6B3C" : "#94A3B8", fontSize: 12, fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: intern.status === "active" ? "#1A6B3C" : "#CBD5E1" }} />
                          {intern.status === "active" ? "Active" : "Away"}
                        </span>
                      </td>

                      {/* Claimed count */}
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 700, color: "#003399" }}>{intern.claimed}</td>

                      {/* Resolved count */}
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 700, color: "#1A6B3C" }}>{intern.resolved}</td>

                      {/* Average resolution time */}
                      <td style={{ padding: "14px 20px", fontSize: 14, color: "#64748B" }}>{intern.avgTime}</td>

                      {/* Performance progress bar */}
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

          {/* ---- ALL TICKETS TABLE ---- */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}
          >
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#003399" }}>All Active Tickets</h3>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{mockTickets.length} total</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    {["Reference", "Title", "Location", "Submitted By", "Assigned To", "Priority", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockTickets.map((ticket, i) => (
                    <tr
                      key={ticket.id}
                      style={{ borderTop: "1px solid #F1F5F9", cursor: "default" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#003399" }}>{ticket.reference}</span>
                      </td>
                      <td style={{ padding: "14px 20px", maxWidth: 200 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ticket.title}</p>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={12} style={{ color: "#94A3B8" }} />
                          <span style={{ fontSize: 13, color: "#64748B" }}>{ticket.location}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <User size={12} style={{ color: "#94A3B8" }} />
                          <span style={{ fontSize: 13, color: "#64748B" }}>{ticket.submittedBy}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: 13, color: ticket.claimedBy ? "#003399" : "#94A3B8", fontWeight: ticket.claimedBy ? 600 : 400 }}>
                          {ticket.claimedBy || "Unassigned"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, backgroundColor: priorityStyle[ticket.priority].bg, color: priorityStyle[ticket.priority].text }}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, backgroundColor: statusStyle[ticket.status].bg, color: statusStyle[ticket.status].text }}>
                          {statusStyle[ticket.status].label}
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