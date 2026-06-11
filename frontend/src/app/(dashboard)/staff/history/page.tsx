"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ListTodo, Clock, Settings, LogOut, MapPin, Calendar, Filter } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

type Priority = "low" | "medium" | "high" | "critical";
type Status   = "submitted" | "claimed" | "in_progress" | "awaiting" | "resolved" | "closed";

type TicketItem = {
  id: number; reference: string; title: string;
  description: string; priority: Priority; status: Status;
  location: string; claimed_by_name: string | null; created_at: string;
};

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
  { icon: LayoutDashboard, label: "Report Issue",   href: "/staff"          },
  { icon: ListTodo,        label: "My Tickets",     href: "/staff/tickets"  },
  { icon: Clock,           label: "Ticket History", href: "/staff/history"  },
  { icon: Settings,        label: "Settings",       href: "/staff/settings" },
];

export default function StaffHistoryPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [tickets,  setTickets]  = useState<TicketItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<"all" | Status>("all");

  const myName = user?.name || "Staff";
  const initial = myName.charAt(0).toUpperCase();

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get("/api/tickets/");
      // History = all tickets submitted by this staff member
      setTickets(res.data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  function handleLogout() { logout(); router.push("/login"); }

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  const sel: React.CSSProperties = {
    padding: "8px 14px", borderRadius: 10, border: "2px solid #E2E8F0",
    fontSize: 13, fontWeight: 600, color: "#1E293B", backgroundColor: "white",
    cursor: "pointer", outline: "none",
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#F5F7FA" }}>

      {/* SIDEBAR */}
      <aside style={{ width: 240, minWidth: 240, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#003399" }}>
        <div style={{ padding: 24, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/coat-of-arms.jpg" alt="OPCS" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: 14 }}>OPCS eSupport</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>Staff Portal</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item, i) => (
            <button key={i} onClick={() => router.push(item.href)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                backgroundColor: item.href === "/staff/history" ? "rgba(255,255,255,0.15)" : "transparent",
                color: item.href === "/staff/history" ? "white" : "rgba(255,255,255,0.55)",
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
              <p style={{ color: "#93C5FD", fontSize: 11 }}>OPCS Staff</p>
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
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#003399" }}>Ticket History</h1>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>All IT support requests you have submitted</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Filter size={15} color="#94A3B8" />
            <select value={filter} onChange={e => setFilter(e.target.value as "all" | Status)} style={sel}>
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="claimed">Claimed</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting">Awaiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </header>

        <div style={{ height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>

          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Submitted", value: tickets.length,                                          color: "#003399" },
              { label: "In Progress",     value: tickets.filter(t => t.status === "in_progress" || t.status === "claimed").length, color: "#9333EA" },
              { label: "Resolved",        value: tickets.filter(t => t.status === "resolved" || t.status === "closed").length,     color: "#1A6B3C" },
              { label: "Pending",         value: tickets.filter(t => t.status === "submitted").length,     color: "#FF8C00" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                style={{ backgroundColor: "white", borderRadius: 14, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{loading ? "..." : s.value}</p>
                <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tickets table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "14px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>
                {loading ? "Loading..." : `${filtered.length} ticket(s)`}
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    {["Reference", "Title", "Location", "Assigned To", "Priority", "Status", "Date"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                      {filter === "all" ? "You have not submitted any tickets yet." : `No tickets with status "${filter}".`}
                    </td></tr>
                  )}
                  {filtered.map((ticket, i) => (
                    <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      style={{ borderTop: "1px solid #F1F5F9" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#003399" }}>{ticket.reference}</span>
                      </td>
                      <td style={{ padding: "14px 20px", maxWidth: 220 }}>
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
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={12} color="#94A3B8" />
                          <span style={{ fontSize: 12, color: "#94A3B8" }}>{new Date(ticket.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                      </td>
                    </motion.tr>
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
