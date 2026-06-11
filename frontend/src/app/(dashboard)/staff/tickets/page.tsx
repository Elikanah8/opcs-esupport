"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ListTodo, Clock,
  Settings, LogOut, MapPin, Menu
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

type Priority = "low" | "medium" | "high" | "critical";
type Status = "submitted" | "claimed" | "in_progress" | "awaiting" | "resolved" | "closed";

type TicketItem = {
  id: number;
  reference: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  location: string;
  claimed_by_name: string | null;
  created_at: string;
};

const priorityStyle: Record<Priority, { bg: string; text: string }> = {
  low:      { bg: "#E8F5EE", text: "#1A6B3C" },
  medium:   { bg: "#FFF4E5", text: "#FF8C00" },
  high:     { bg: "#FFE5E5", text: "#CC0000" },
  critical: { bg: "#3D0000", text: "#FF6B6B" },
};

const statusStyle: Record<Status, { bg: string; text: string; label: string }> = {
  submitted:   { bg: "#EBF0FA", text: "#003399", label: "Submitted"    },
  claimed:     { bg: "#FFF4E5", text: "#FF8C00", label: "Claimed"      },
  in_progress: { bg: "#F3E8FF", text: "#9333EA", label: "In Progress"  },
  awaiting:    { bg: "#FFE5E5", text: "#CC0000", label: "Awaiting"     },
  resolved:    { bg: "#E8F5EE", text: "#1A6B3C", label: "Resolved"     },
  closed:      { bg: "#F1F5F9", text: "#64748B", label: "Closed"       },
};

const navItems = [
  { icon: LayoutDashboard, label: "Report Issue",   href: "/staff"          },
  { icon: ListTodo,        label: "My Tickets",     href: "/staff/tickets"  },
  { icon: Clock,           label: "Ticket History", href: "/staff/history"  },
  { icon: Settings,        label: "Settings",       href: "/staff/settings" },
];

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchMyTickets() {
      try {
        const response = await api.get("/api/tickets/");
        setTickets(response.data);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTickets();
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

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
              <p style={{ color: "#93C5FD", fontSize: 11 }}>Staff Portal</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => { router.push(item.href); setSidebarOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer", backgroundColor: item.href === "/staff/tickets" ? "rgba(255,255,255,0.15)" : "transparent", color: item.href === "/staff/tickets" ? "white" : "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 600, textAlign: "left", width: "100%" }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#FFCC00", color: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              {user?.name?.charAt(0) || "S"}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Staff"}</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>OPCS Staff</p>
            </div>
            <LogOut size={15} style={{ color: "#93C5FD", cursor: "pointer", flexShrink: 0 }} onClick={handleLogout} />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="dash-main">
        <header className="dash-header">
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="mob-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#003399" }}>My Tickets</h1>
              <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>All IT issues you have reported</p>
            </div>
          </div>
        </header>

        <div style={{ height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        <main className="dash-content">
          <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              {loading ? (
                <div style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>Loading your tickets...</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC" }}>
                      {["Reference", "Title", "Location", "Assigned To", "Priority", "Status", "Date"].map(h => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                          You have not submitted any tickets yet.
                        </td>
                      </tr>
                    )}
                    {tickets.map((ticket, i) => (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ borderTop: "1px solid #F1F5F9" }}
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
                          <span style={{ fontSize: 13, color: ticket.claimed_by_name ? "#003399" : "#94A3B8", fontWeight: ticket.claimed_by_name ? 600 : 400 }}>
                            {ticket.claimed_by_name || "Unassigned"}
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
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: 12, color: "#94A3B8" }}>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}