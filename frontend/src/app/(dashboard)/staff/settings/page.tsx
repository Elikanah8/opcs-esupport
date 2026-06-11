"use client";

import { useState } from "react";
import { LayoutDashboard, ListTodo, Clock, Settings, LogOut, User, Mail, Building, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { icon: LayoutDashboard, label: "Report Issue",   href: "/staff"          },
  { icon: ListTodo,        label: "My Tickets",     href: "/staff/tickets"  },
  { icon: Clock,           label: "Ticket History", href: "/staff/history"  },
  { icon: Settings,        label: "Settings",       href: "/staff/settings" },
];

export default function StaffSettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer", backgroundColor: item.href === "/staff/settings" ? "rgba(255,255,255,0.15)" : "transparent", color: item.href === "/staff/settings" ? "white" : "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 600, textAlign: "left", width: "100%" }}
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
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#003399" }}>Settings</h1>
              <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Manage your account details</p>
            </div>
          </div>
        </header>

        <div style={{ height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        <main className="dash-content">
          <div style={{ maxWidth: 600 }}>

            {/* Profile card */}
            <div style={{ backgroundColor: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#003399", marginBottom: 24 }}>Profile Information</h2>

              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#003399", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24 }}>
                  {user?.name?.charAt(0) || "S"}
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>{user?.name || "Staff Member"}</p>
                  <p style={{ fontSize: 13, color: "#94A3B8" }}>OPCS Staff</p>
                </div>
              </div>

              {/* Info rows */}
              {[
                { icon: User,     label: "Full Name",   value: user?.name       || "—" },
                { icon: Mail,     label: "Email",       value: user?.email      || "—" },
                { icon: Building, label: "Department",  value: user?.department || "—" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: i < 2 ? "1px solid #F1F5F9" : "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#EBF0FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <item.icon size={18} style={{ color: "#003399" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                    <p style={{ fontSize: 14, color: "#1E293B", fontWeight: 600, marginTop: 2 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{ width: "100%", padding: "14px 24px", borderRadius: 12, border: "2px solid #CC0000", backgroundColor: "white", color: "#CC0000", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <LogOut size={18} />
              Sign Out of OPCS eSupport
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}