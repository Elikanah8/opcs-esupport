"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, TicketIcon, Users, BarChart2, Settings, LogOut, User, Mail, Building, Key, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",    href: "/supervisor"           },
  { icon: TicketIcon,      label: "All Tickets", href: "/supervisor/tickets"   },
  { icon: Users,           label: "Intern Team", href: "/supervisor/team"      },
  { icon: BarChart2,       label: "Analytics",   href: "/supervisor/analytics" },
  { icon: Settings,        label: "Settings",    href: "/supervisor/settings"  },
];

export default function SupervisorSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const myName  = user?.name || "Supervisor";
  const initial = myName.charAt(0).toUpperCase();

  function handleLogout() { logout(); router.push("/login"); }

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
              <p style={{ color: "#93C5FD", fontSize: 11 }}>Supervisor Panel</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item, i) => (
            <button key={i} onClick={() => { router.push(item.href); setSidebarOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                backgroundColor: item.href === "/supervisor/settings" ? "rgba(255,255,255,0.15)" : "transparent",
                color: item.href === "/supervisor/settings" ? "white" : "rgba(255,255,255,0.55)",
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
      <div className="dash-main">
        <header className="dash-header">
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="mob-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#003399" }}>Settings</h1>
              <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Manage supervisor profile details</p>
            </div>
          </div>
        </header>

        <div style={{ height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        <main className="dash-content">
          <div style={{ maxWidth: 580 }}>

            {/* Profile info card */}
            <div style={{ backgroundColor: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "#003399", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 28 }}>
                  {initial}
                </div>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#1E293B" }}>{myName}</p>
                  <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>ICT Director — OPCS eSupport</p>
                  <span style={{ display: "inline-block", marginTop: 8, padding: "3px 10px", borderRadius: 99, backgroundColor: "#E8F5EE", color: "#1A6B3C", fontSize: 12, fontWeight: 700 }}>Authorized</span>
                </div>
              </div>

              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Supervisor Information</h3>
              {[
                { icon: User,     label: "Full Name",   value: myName },
                { icon: Mail,     label: "Email Address", value: user?.email || "—" },
                { icon: Key,      label: "Username",    value: user?.username || "—" },
                { icon: Building, label: "Department",  value: user?.department || "—" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < 3 ? "1px solid #F1F5F9" : "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#EBF0FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <row.icon size={18} color="#003399" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                    <p style={{ fontSize: 14, color: "#1E293B", fontWeight: 600, marginTop: 2 }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Logout button */}
            <button onClick={handleLogout}
              style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "2px solid #CC0000", backgroundColor: "white", color: "#CC0000", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <LogOut size={18} /> Sign Out of OPCS eSupport
            </button>

          </div>
        </main>
      </div>
    </div>
  );
}