"use client";

import {
  LayoutDashboard, TicketIcon, Users,
  BarChart2, Settings, LogOut, User, Mail, Building
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",    href: "/supervisor"          },
  { icon: TicketIcon,      label: "All Tickets", href: "/supervisor/tickets"  },
  { icon: Users,           label: "Intern Team", href: "/supervisor/team"     },
  { icon: BarChart2,       label: "Analytics",   href: "/supervisor/analytics"},
  { icon: Settings,        label: "Settings",    href: "/supervisor/settings" },
];

export default function SupervisorSettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

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
            <button
              key={i}
              onClick={() => router.push(item.href)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer", backgroundColor: item.href === "/supervisor/settings" ? "rgba(255,255,255,0.15)" : "transparent", color: item.href === "/supervisor/settings" ? "white" : "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 600, textAlign: "left", width: "100%" }}
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
              <p style={{ color: "white", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Supervisor"}</p>
              <p style={{ color: "#93C5FD", fontSize: 11 }}>ICT Director</p>
            </div>
            <LogOut size={15} style={{ color: "#93C5FD", cursor: "pointer", flexShrink: 0 }} onClick={handleLogout} />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ padding: "16px 32px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#003399" }}>Settings</h1>
          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Manage your account details</p>
        </header>

        <div style={{ height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ backgroundColor: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#003399", marginBottom: 24 }}>Profile Information</h2>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#003399", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24 }}>
                  {user?.name?.charAt(0) || "S"}
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>{user?.name || "Supervisor"}</p>
                  <p style={{ fontSize: 13, color: "#94A3B8" }}>ICT Director / Supervisor</p>
                </div>
              </div>

              {[
                { icon: User,     label: "Full Name",  value: user?.name       || "—" },
                { icon: Mail,     label: "Email",      value: user?.email      || "—" },
                { icon: Building, label: "Department", value: user?.department || "—" },
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