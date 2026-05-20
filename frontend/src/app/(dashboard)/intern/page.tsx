"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TicketIcon, CheckCircle, AlertTriangle, Clock,
  LogOut, Bell, Wifi, LayoutDashboard,
  ListTodo, Settings, MapPin, User,
} from "lucide-react";

// ── TYPES ──────────────────────────────────────────────────────────────────
type Priority = "low" | "medium" | "high" | "critical";
type Status   = "submitted" | "claimed" | "in_progress" | "awaiting" | "resolved";

type TicketItem = {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  location: string;
  submittedBy: string;
  createdAt: string;
  claimedBy?: string;
};

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const mockTickets: TicketItem[] = [
  { id: "1", reference: "TKT-001", title: "Printer not connecting to network",
    description: "The HP printer on 3rd floor is not showing on the network.",
    priority: "high", status: "submitted", location: "3rd Floor - Finance",
    submittedBy: "Jane Mwangi", createdAt: "2026-05-13 09:00" },
  { id: "2", reference: "TKT-002", title: "Outlook not syncing emails",
    description: "Emails not loading since this morning.",
    priority: "medium", status: "submitted", location: "2nd Floor - Admin",
    submittedBy: "Peter Otieno", createdAt: "2026-05-13 09:30" },
  { id: "3", reference: "TKT-003", title: "Internet down in boardroom",
    description: "No internet connection in the main boardroom.",
    priority: "critical", status: "claimed", location: "1st Floor - Boardroom",
    submittedBy: "Sarah Njeri", createdAt: "2026-05-13 08:00", claimedBy: "Mike Intern" },
  { id: "4", reference: "TKT-004", title: "PDF conversion not working",
    description: "Cannot convert Word documents to PDF.",
    priority: "low", status: "resolved", location: "4th Floor - Legal",
    submittedBy: "David Kamau", createdAt: "2026-05-13 07:00" },
  { id: "5", reference: "TKT-005", title: "VPN not connecting remotely",
    description: "Staff cannot access internal systems from home.",
    priority: "high", status: "submitted", location: "5th Floor - Executive",
    submittedBy: "Grace Wanjiku", createdAt: "2026-05-13 10:00" },
];

// ── BADGE STYLES ───────────────────────────────────────────────────────────
const priorityStyle: Record<Priority, { bg: string; color: string; label: string }> = {
  low:      { bg: "#E8F5EE", color: "#1A6B3C", label: "Low" },
  medium:   { bg: "#FFF4E5", color: "#FF8C00", label: "Medium" },
  high:     { bg: "#FFE5E5", color: "#CC0000", label: "High" },
  critical: { bg: "#3D0000", color: "#FF6B6B", label: "Critical" },
};

const statusStyle: Record<Status, { bg: string; color: string; label: string }> = {
  submitted:   { bg: "#EBF0FA", color: "#003399", label: "Submitted" },
  claimed:     { bg: "#FFF4E5", color: "#FF8C00", label: "Claimed" },
  in_progress: { bg: "#F3E8FF", color: "#9333EA", label: "In Progress" },
  awaiting:    { bg: "#FFE5E5", color: "#CC0000", label: "Awaiting" },
  resolved:    { bg: "#E8F5EE", color: "#1A6B3C", label: "Resolved" },
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",  active: true  },
  { icon: ListTodo,        label: "My Tickets", active: false },
  { icon: CheckCircle,     label: "Resolved",   active: false },
  { icon: Settings,        label: "Settings",   active: false },
];

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function InternDashboard() {
  const [tickets, setTickets]     = useState<TicketItem[]>(mockTickets);
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "resolved">("all");
  const [notifOpen, setNotifOpen] = useState(false);

  const openCount     = tickets.filter(t => t.status === "submitted").length;
  const claimedCount  = tickets.filter(t => t.claimedBy === "You").length;
  const urgentCount   = tickets.filter(t => t.priority === "critical" || t.priority === "high").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  function claimTicket(id: string) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "claimed", claimedBy: "You" } : t));
  }
  function resolveTicket(id: string) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" } : t));
  }

  const filteredTickets = tickets.filter(t => {
    if (activeTab === "all")      return t.status !== "resolved";
    if (activeTab === "mine")     return t.claimedBy === "You";
    if (activeTab === "resolved") return t.status === "resolved";
    return true;
  });

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#F5F7FA" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, minWidth: 240, display: "flex", flexDirection: "column",
        height: "100%", backgroundColor: "#003399",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/coat-of-arms.jpg" alt="OPCS" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>OPCS eSupport</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>Intern Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item, i) => (
            <button key={i} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer",
              backgroundColor: item.active ? "rgba(255,255,255,0.15)" : "transparent",
              color: item.active ? "white" : "rgba(255,255,255,0.55)",
              fontSize: 14, fontWeight: 600, textAlign: "left",
              transition: "background 0.2s",
            }}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Profile */}
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              backgroundColor: "#FFCC00", color: "#003399",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 14,
            }}>E</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Elikanah Njuru
              </p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>ICT Intern</p>
            </div>
            <LogOut size={16} color="#93C5FD" style={{ cursor: "pointer", flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 32px", backgroundColor: "white",
          borderBottom: "1px solid #E2E8F0", flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#003399" }}>Intern Dashboard</h1>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
              Good morning, Elikanah — Sunday, 17 May 2026
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Live indicator */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 99, backgroundColor: "#E8F5EE",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22C55E" }} />
              <Wifi size={13} color="#1A6B3C" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1A6B3C" }}>Live</span>
            </div>

            {/* Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  position: "relative", padding: 8, borderRadius: 10, border: "none",
                  backgroundColor: "transparent", cursor: "pointer",
                }}
              >
                <Bell size={20} color="#003399" />
                <span style={{
                  position: "absolute", top: -2, right: -2,
                  width: 18, height: 18, borderRadius: "50%",
                  backgroundColor: "#FFCC00", color: "#003399",
                  fontSize: 10, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>3</span>
              </button>

              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: "absolute", right: 0, top: 48,
                    width: 320, backgroundColor: "white",
                    borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                    zIndex: 50, overflow: "hidden",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #EBF0FA" }}>
                    <p style={{ fontWeight: 800, fontSize: 13, color: "#003399" }}>Notifications</p>
                  </div>
                  {[
                    { msg: "New critical ticket — Boardroom internet down", time: "2 min ago" },
                    { msg: "TKT-001 has been escalated to supervisor", time: "10 min ago" },
                    { msg: "Supervisor reviewed and closed TKT-004", time: "1 hr ago" },
                  ].map((n, i) => (
                    <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid #F8FAFC", cursor: "pointer" }}>
                      <p style={{ fontSize: 13, color: "#374151" }}>{n.msg}</p>
                      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{n.time}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              backgroundColor: "#003399", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 14, cursor: "pointer",
            }}>E</div>
          </div>
        </header>

        {/* Gold accent line */}
        <div style={{ width: "100%", height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
            {[
              { label: "Open Tickets",    value: openCount,     icon: TicketIcon,    color: "#003399" },
              { label: "My Claimed",      value: claimedCount,  icon: CheckCircle,   color: "#1A6B3C" },
              { label: "Urgent",          value: urgentCount,   icon: AlertTriangle, color: "#CC0000" },
              { label: "Resolved Today",  value: resolvedCount, icon: Clock,         color: "#FF8C00" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                style={{
                  backgroundColor: "white", borderRadius: 16,
                  padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  display: "flex", alignItems: "center", gap: 16,
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  backgroundColor: stat.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <div>
                  <p style={{ fontSize: 30, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Ticket table card */}
          <div style={{
            backgroundColor: "white", borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px", borderBottom: "1px solid #F1F5F9",
            }}>
              <h2 style={{ fontWeight: 900, fontSize: 16, color: "#003399" }}>Support Tickets</h2>

              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { key: "all",      label: "All Open" },
                  { key: "mine",     label: "My Tickets" },
                  { key: "resolved", label: "Resolved" },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as "all" | "mine" | "resolved")}
                    style={{
                      padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                      backgroundColor: activeTab === tab.key ? "#003399" : "#F1F5F9",
                      color: activeTab === tab.key ? "white" : "#64748B",
                      fontSize: 12, fontWeight: 700,
                      transition: "all 0.2s",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    {["Reference", "Title", "Location", "Submitted By", "Priority", "Status", "Actions"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", padding: "12px 20px",
                        fontSize: 11, fontWeight: 800, color: "#94A3B8",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                        No tickets in this category.
                      </td>
                    </tr>
                  )}

                  {filteredTickets.map((ticket, i) => (
                    <motion.tr
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ borderTop: "1px solid #F1F5F9", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FBFF")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: "#003399" }}>
                          {ticket.reference}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", maxWidth: 240 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ticket.title}
                        </p>
                        <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ticket.description}
                        </p>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={12} color="#94A3B8" />
                          <span style={{ fontSize: 13, color: "#475569" }}>{ticket.location}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <User size={12} color="#94A3B8" />
                          <span style={{ fontSize: 13, color: "#475569" }}>{ticket.submittedBy}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800,
                          backgroundColor: priorityStyle[ticket.priority].bg,
                          color: priorityStyle[ticket.priority].color,
                        }}>
                          {priorityStyle[ticket.priority].label}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800,
                          backgroundColor: statusStyle[ticket.status].bg,
                          color: statusStyle[ticket.status].color,
                        }}>
                          {statusStyle[ticket.status].label}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          {ticket.status === "submitted" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => claimTicket(ticket.id)}
                              style={{
                                padding: "6px 16px", borderRadius: 8, border: "none",
                                backgroundColor: "#003399", color: "white",
                                fontSize: 12, fontWeight: 800, cursor: "pointer",
                              }}
                            >Claim</motion.button>
                          )}
                          {ticket.claimedBy === "You" && ticket.status !== "resolved" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => resolveTicket(ticket.id)}
                              style={{
                                padding: "6px 16px", borderRadius: 8, border: "none",
                                backgroundColor: "#1A6B3C", color: "white",
                                fontSize: 12, fontWeight: 800, cursor: "pointer",
                              }}
                            >Resolve</motion.button>
                          )}
                          {ticket.claimedBy && ticket.claimedBy !== "You" && (
                            <span style={{
                              padding: "6px 16px", borderRadius: 8,
                              backgroundColor: "#F1F5F9", color: "#94A3B8",
                              fontSize: 12, fontWeight: 700,
                            }}>Taken</span>
                          )}
                          {ticket.status === "resolved" && (
                            <span style={{
                              padding: "6px 16px", borderRadius: 8,
                              backgroundColor: "#E8F5EE", color: "#1A6B3C",
                              fontSize: 12, fontWeight: 700,
                            }}>Closed</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
