"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TicketIcon, CheckCircle, AlertTriangle, Clock,
  LogOut, Bell, Wifi, LayoutDashboard,
  ListTodo, Settings, MapPin, User, X, Menu,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";

type Priority = "low" | "medium" | "high" | "critical";
type Status   = "submitted" | "claimed" | "in_progress" | "awaiting" | "resolved" | "closed";

type TicketItem = {
  id: number; reference: string; title: string; description: string;
  priority: Priority; status: Status; location: string;
  submitted_by_name: string; created_at: string; claimed_by_name?: string | null;
};

type Notification = { id: number; message: string; type: string; is_read: boolean; created_at: string };

const priorityStyle: Record<Priority, { bg: string; color: string; label: string }> = {
  low:      { bg: "#E8F5EE", color: "#1A6B3C", label: "Low"      },
  medium:   { bg: "#FFF4E5", color: "#FF8C00", label: "Medium"   },
  high:     { bg: "#FFE5E5", color: "#CC0000", label: "High"     },
  critical: { bg: "#3D0000", color: "#FF6B6B", label: "Critical" },
};

const statusStyle: Record<Status, { bg: string; color: string; label: string }> = {
  submitted:   { bg: "#EBF0FA", color: "#003399", label: "Submitted"   },
  claimed:     { bg: "#FFF4E5", color: "#FF8C00", label: "Claimed"     },
  in_progress: { bg: "#F3E8FF", color: "#9333EA", label: "In Progress" },
  awaiting:    { bg: "#FFE5E5", color: "#CC0000", label: "Awaiting"    },
  resolved:    { bg: "#E8F5EE", color: "#1A6B3C", label: "Resolved"    },
  closed:      { bg: "#F1F5F9", color: "#64748B", label: "Closed"      },
};

type NavTab = "dashboard" | "my_tickets" | "resolved" | "settings";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/intern"          },
  { icon: ListTodo,        label: "My Tickets", href: "/intern/tickets"  },
  { icon: CheckCircle,     label: "Resolved",   href: "/intern/resolved" },
  { icon: Settings,        label: "Settings",   href: "/intern/settings" },
];

export default function InternDashboard() {
  const { user, logout, rehydrate } = useAuthStore();
  const router = useRouter();
  const [tickets,       setTickets]       = useState<TicketItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [activeNav,     setActiveNav]     = useState<NavTab>("dashboard");
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [viewTicket,    setViewTicket]    = useState<TicketItem | null>(null);
  const [actionError,   setActionError]   = useState("");
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  const myName = user?.name || "Intern";
  const initial = myName.charAt(0).toUpperCase();

  const fetchTickets = useCallback(async () => {
    try {
      const res = await api.get("/api/tickets/");
      setTickets(res.data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/api/notifications/");
      setNotifications(res.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    rehydrate();
    fetchTickets();
    fetchNotifications();
  }, [fetchTickets, fetchNotifications]);

  useWebSocket("/ws/tickets/", () => { fetchTickets(); fetchNotifications(); });

  function handleLogout() { logout(); router.push("/login"); }

  async function claimTicket(id: number) {
    setActionError("");
    try {
      await api.post(`/api/tickets/${id}/claim/`);
      await fetchTickets();
      await fetchNotifications();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Could not claim ticket.";
      setActionError(msg);
    }
  }

  async function resolveTicket(id: number) {
    setActionError("");
    try {
      await api.post(`/api/tickets/${id}/resolve/`);
      await fetchTickets();
      setViewTicket(null);
    } catch {
      setActionError("Could not resolve ticket.");
    }
  }

  async function markNotifRead(id: number) {
    try {
      await api.patch(`/api/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* silent */ }
  }

  const openCount     = tickets.filter(t => t.status === "submitted").length;
  const claimedCount  = tickets.filter(t => t.claimed_by_name === myName).length;
  const urgentCount   = tickets.filter(t => t.priority === "critical" || t.priority === "high").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;
  const unreadCount   = notifications.filter(n => !n.is_read).length;

  const visibleTickets = (() => {
    if (activeNav === "my_tickets") return tickets.filter(t => t.claimed_by_name === myName);
    if (activeNav === "resolved")   return tickets.filter(t => t.status === "resolved");
    return tickets.filter(t => t.status !== "resolved" && t.status !== "closed");
  })();

  return (
    <div className="dash-layout">

      {/* Overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* SIDEBAR */}
      <aside className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>
        <div style={{ padding: 24, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/coat-of-arms.jpg" alt="OPCS" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: 14 }}>OPCS eSupport</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>Intern Portal</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item, i) => (
            <button key={i} onClick={() => { router.push(item.href); setSidebarOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                backgroundColor: item.href === "/intern" ? "rgba(255,255,255,0.15)" : "transparent",
                color: item.href === "/intern" ? "white" : "rgba(255,255,255,0.55)",
                fontSize: 14, fontWeight: 600, textAlign: "left", width: "100%" }}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#FFCC00", color: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{myName}</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>ICT Intern</p>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
              <LogOut size={15} color="#93C5FD" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="dash-main">

        {/* Header */}
        <header className="dash-header">
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="mob-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#003399" }}>
                {activeNav === "dashboard"  && "Intern Dashboard"}
                {activeNav === "my_tickets" && "My Claimed Tickets"}
                {activeNav === "resolved"   && "Resolved Tickets"}
                {activeNav === "settings"   && "Settings"}
              </h1>
              <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Welcome, {myName}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, backgroundColor: "#E8F5EE" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22C55E" }} />
              <Wifi size={13} color="#1A6B3C" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1A6B3C" }}>Live</span>
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ padding: 8, borderRadius: 10, border: "none", backgroundColor: "transparent", cursor: "pointer", position: "relative" }}>
                <Bell size={20} color="#003399" />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#FFCC00", color: "#003399", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ position: "absolute", right: 0, top: 48, width: 300, backgroundColor: "white", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 50, overflow: "hidden", border: "1px solid #E2E8F0" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#003399" }}>Notifications</p>
                    <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="#94A3B8" /></button>
                  </div>
                  {notifications.length === 0 && (
                    <p style={{ padding: 20, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No notifications yet.</p>
                  )}
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
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#003399", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14 }}>{initial}</div>
          </div>
        </header>

        <div style={{ height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        <main className="dash-content">

          {actionError && (
            <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "#FFE5E5", color: "#CC0000", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
              ⚠ {actionError}
            </div>
          )}

          {/* Settings */}
          {activeNav === "settings" && (
            <div style={{ backgroundColor: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", maxWidth: 600 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#003399", marginBottom: 24 }}>Account Settings</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Full Name",   value: myName },
                  { label: "Email",       value: user?.email || "—" },
                  { label: "Username",    value: user?.username || "—" },
                  { label: "Department",  value: user?.department || "—" },
                  { label: "Role",        value: "ICT Intern" },
                ].map(row => (
                  <div key={row.label} style={{ padding: 20, borderRadius: 12, backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>{row.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{row.value}</p>
                  </div>
                ))}
                <button onClick={handleLogout} style={{ padding: "14px 0", borderRadius: 12, border: "none", backgroundColor: "#FFE5E5", color: "#CC0000", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Stats — dashboard only */}
          {activeNav === "dashboard" && (
            <div className="stat-grid-4">
              {[
                { label: "Open Tickets",   value: openCount,     icon: TicketIcon,    color: "#003399" },
                { label: "My Claimed",     value: claimedCount,  icon: CheckCircle,   color: "#1A6B3C" },
                { label: "Urgent",         value: urgentCount,   icon: AlertTriangle, color: "#CC0000" },
                { label: "Resolved Today", value: resolvedCount, icon: Clock,         color: "#FF8C00" },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  style={{ backgroundColor: "white", borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: stat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <stat.icon size={24} color={stat.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 32, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Ticket table */}
          {activeNav !== "settings" && (
            <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#003399" }}>
                  {activeNav === "dashboard"  && "All Open Tickets"}
                  {activeNav === "my_tickets" && "Tickets I've Claimed"}
                  {activeNav === "resolved"   && "Resolved Tickets"}
                </h2>
                <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{loading ? "Loading..." : `${visibleTickets.length} ticket(s)`}</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC" }}>
                      {["Reference", "Title", "Location", "Submitted By", "Priority", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && visibleTickets.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>No tickets here.</td></tr>
                    )}
                    {visibleTickets.map((ticket, i) => (
                      <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        style={{ borderTop: "1px solid #F1F5F9" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#003399" }}>{ticket.reference}</span>
                        </td>
                        <td style={{ padding: "14px 20px", maxWidth: 200 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ticket.title}</p>
                          <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ticket.description}</p>
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
                          <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, backgroundColor: priorityStyle[ticket.priority]?.bg, color: priorityStyle[ticket.priority]?.color }}>
                            {priorityStyle[ticket.priority]?.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, backgroundColor: statusStyle[ticket.status]?.bg, color: statusStyle[ticket.status]?.color }}>
                            {statusStyle[ticket.status]?.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button onClick={() => setViewTicket(ticket)}
                              style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "white", color: "#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              View
                            </button>
                            {ticket.status === "submitted" && (
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => claimTicket(ticket.id)}
                                style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "#003399", color: "white", fontSize: 12, fontWeight: 700 }}>
                                Claim
                              </motion.button>
                            )}
                            {ticket.claimed_by_name === myName && ticket.status !== "resolved" && ticket.status !== "closed" && (
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => resolveTicket(ticket.id)}
                                style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: "#1A6B3C", color: "white", fontSize: 12, fontWeight: 700 }}>
                                Resolve
                              </motion.button>
                            )}
                            {ticket.claimed_by_name && ticket.claimed_by_name !== myName && ticket.status !== "resolved" && (
                              <span style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#94A3B8", backgroundColor: "#F1F5F9" }}>Taken</span>
                            )}
                            {(ticket.status === "resolved" || ticket.status === "closed") && (
                              <span style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#1A6B3C", backgroundColor: "#E8F5EE" }}>Closed</span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* TICKET DETAIL MODAL */}
      {viewTicket && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setViewTicket(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ backgroundColor: "white", borderRadius: 20, padding: 36, maxWidth: 520, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#003399" }}>{viewTicket.reference}</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginTop: 4 }}>{viewTicket.title}</h3>
              </div>
              <button onClick={() => setViewTicket(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color="#94A3B8" /></button>
            </div>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 20 }}>{viewTicket.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Location",     value: viewTicket.location },
                { label: "Submitted By", value: viewTicket.submitted_by_name },
                { label: "Priority",     value: priorityStyle[viewTicket.priority]?.label },
                { label: "Status",       value: statusStyle[viewTicket.status]?.label },
                { label: "Created",      value: new Date(viewTicket.created_at).toLocaleString() },
                { label: "Claimed By",   value: viewTicket.claimed_by_name || "Unclaimed" },
              ].map(row => (
                <div key={row.label} style={{ padding: 14, borderRadius: 10, backgroundColor: "#F8FAFC" }}>
                  <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{row.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{row.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {viewTicket.status === "submitted" && (
                <button onClick={() => { claimTicket(viewTicket.id); setViewTicket(null); }}
                  style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "none", backgroundColor: "#003399", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Claim This Ticket
                </button>
              )}
              {viewTicket.claimed_by_name === myName && viewTicket.status !== "resolved" && viewTicket.status !== "closed" && (
                <button onClick={() => resolveTicket(viewTicket.id)}
                  style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "none", backgroundColor: "#1A6B3C", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Mark as Resolved
                </button>
              )}
              <button onClick={() => setViewTicket(null)}
                style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "1px solid #E2E8F0", backgroundColor: "white", color: "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
