"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send, Paperclip, Bot, Shield,
  AlertCircle, LayoutDashboard, ListTodo,
  LogOut, Settings, Clock, X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

type NavTab = "report" | "my_tickets" | "history" | "settings";

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const priorities = [
  { value: "low",      label: "Low",      color: "#1A6B3C", bg: "#E8F5EE", desc: "Minor issue, not urgent" },
  { value: "medium",   label: "Medium",   color: "#FF8C00", bg: "#FFF4E5", desc: "Affecting productivity" },
  { value: "high",     label: "High",     color: "#CC0000", bg: "#FFE5E5", desc: "Significant disruption" },
  { value: "critical", label: "Critical", color: "#7B0000", bg: "#FFD0D0", desc: "Complete loss of service" },
];

const departments = [
  "Directorate of ICT",
  "Directorate of Finance",
  "Directorate of Administration",
  "Directorate of Legal Services",
  "Communications Unit",
  "Office of the Cabinet Secretary",
  "Human Resource Directorate",
];

const locations = [
  "1st Floor - Boardroom",
  "1st Floor - Reception",
  "2nd Floor - Administration",
  "3rd Floor - Finance",
  "4th Floor - Legal",
  "5th Floor - Executive",
  "Server Room - Basement",
];

// ── TYPES ──────────────────────────────────────────────────────────────────
type AIMessage = { role: "user" | "ai"; text: string };
type FormState = { title: string; description: string; priority: string; location: string; department: string };

// ── SHARED STYLES ──────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: 12,
  border: "2px solid #E2E8F0",
  fontSize: 14,
  color: "#1E293B",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  backgroundColor: "white",
};

const navItems = [
  { icon: LayoutDashboard, label: "Report Issue",   active: true,  href: "/staff"          },
  { icon: ListTodo,        label: "My Tickets",     active: false, href: "/staff/tickets"  },
  { icon: Clock,           label: "Ticket History", active: false, href: "/staff/history"  },
  { icon: Settings,        label: "Settings",       active: false, href: "/staff/settings" },
];

// ── SIDEBAR ────────────────────────────────────────────────────────────────
function Sidebar({ activeNav, setActiveNav, userName, onLogout }: {
  activeNav: NavTab;
  setActiveNav: (t: NavTab) => void;
  userName: string;
  onLogout: () => void;
}) {
  const router = useRouter();
  const initial = userName.charAt(0).toUpperCase();
  return (
    <aside style={{ width: 240, minWidth: 240, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#003399" }}>
      <div style={{ padding: 24, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/coat-of-arms.jpg" alt="OPCS" style={{ width: 40, height: 40, objectFit: "contain" }} />
          <div>
            <p style={{ color: "white", fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>OPCS eSupport</p>
            <p style={{ color: "#93C5FD", fontSize: 11 }}>Staff Portal</p>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item, i) => (
          <button
            key={i}
            onClick={() => router.push(item.href)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12, border: "none",
              cursor: "pointer",
              backgroundColor: item.active ? "rgba(255,255,255,0.15)" : "transparent",
              color: item.active ? "white" : "rgba(255,255,255,0.55)",
              fontSize: 14, fontWeight: 600, textAlign: "left", width: "100%",
            }}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, backgroundColor: "#FFCC00", color: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14 }}>
            {initial}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ color: "white", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
            <p style={{ color: "#93C5FD", fontSize: 11 }}>OPCS Staff</p>
          </div>
          <button onClick={onLogout} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
            <LogOut size={15} color="#93C5FD" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function StaffPortal() {
  const { user, logout, rehydrate } = useAuthStore();
  const router = useRouter();
  const userName = user?.name || "Staff Member";
  const initial  = userName.charAt(0).toUpperCase();

  const [activeNav, setActiveNav] = useState<NavTab>("report");

  useEffect(() => {
    rehydrate();
  }, []);
  const [form, setForm] = useState<FormState>({
    title: "", description: "", priority: "medium", location: "", department: "",
  });
  const [aiQuery,    setAiQuery]    = useState("");
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([{
    role: "ai",
    text: "Hello! I am the OPCS IT Assistant. Describe your issue and I will try to help you resolve it before you submit a ticket.",
  }]);
  const [aiLoading, setAiLoading] = useState(false);
  const [file,      setFile]      = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState("");

  function handleLogout() { logout(); router.push("/login"); }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTicketRef("TKT-" + Math.floor(Math.random() * 9000 + 1000));
    setSubmitted(true);
  }

  async function handleAiSend() {
    if (!aiQuery.trim()) return;
    const userMsg = aiQuery.trim();

    // Add user message to chat immediately
    setAiMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setAiQuery("");
    setAiLoading(true);

    try {
      // Call our Next.js API route which connects to Grok
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add AI response to chat
      setAiMessages(prev => [...prev, {
        role: "ai",
        text: data.reply,
      }]);

    } catch (error) {
      // Show error message in chat if API call fails
      setAiMessages(prev => [...prev, {
        role: "ai",
        text: "I am currently unavailable. Please try again or submit a ticket directly.",
      }]);
    } finally {
      setAiLoading(false);
    }
  }

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#F5F7FA" }}>
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} userName={userName} onLogout={handleLogout} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              backgroundColor: "white", borderRadius: 20,
              boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
              padding: 56, textAlign: "center", maxWidth: 460, width: "100%",
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: "50%", backgroundColor: "#E8F5EE",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <AlertCircle size={40} color="#1A6B3C" />
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#003399", marginBottom: 8 }}>
              Ticket Submitted!
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, marginBottom: 32 }}>
              Your request has been received. An ICT technician will be assigned shortly.
            </p>

            <div style={{
              padding: "20px 24px", borderRadius: 16, backgroundColor: "#EBF0FA", marginBottom: 28,
            }}>
              <p style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Your Reference Number</p>
              <p style={{ fontSize: 34, fontWeight: 900, fontFamily: "monospace", color: "#003399" }}>
                {ticketRef}
              </p>
              <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>
                Save this number to track your request status
              </p>
            </div>

            <div style={{ width: 60, height: 5, borderRadius: 99, backgroundColor: "#FFCC00", margin: "0 auto 28px" }} />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSubmitted(false);
                setForm({ title: "", description: "", priority: "medium", location: "", department: "" });
                setFile(null);
              }}
              style={{
                width: "100%", padding: "16px 0", borderRadius: 12, border: "none",
                backgroundColor: "#003399", color: "white",
                fontSize: 16, fontWeight: 800, cursor: "pointer",
              }}
            >
              Submit Another Issue
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── MAIN PORTAL ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#F5F7FA" }}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} userName={userName} onLogout={handleLogout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 32px", backgroundColor: "white",
          borderBottom: "1px solid #E2E8F0", flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#003399" }}>
              {activeNav === "report"     && "Report an IT Issue"}
              {activeNav === "my_tickets" && "My Submitted Tickets"}
              {activeNav === "history"    && "Ticket History"}
              {activeNav === "settings"   && "Settings"}
            </h1>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
              {activeNav === "report" ? "Fill in the form — a technician will be assigned to your request" : `Welcome, ${userName}`}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={16} color="#EAB308" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#64748B" }}>Secure Platform</span>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#003399", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, marginLeft: 8 }}>{initial}</div>
          </div>
        </header>

        {/* Gold accent */}
        <div style={{ width: "100%", height: 4, backgroundColor: "#FFCC00", flexShrink: 0 }} />

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>

          {/* Settings view */}
          {activeNav === "settings" && (
            <div style={{ backgroundColor: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", maxWidth: 600 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#003399", marginBottom: 24 }}>Account Settings</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Full Name",   value: userName },
                  { label: "Email",       value: user?.email || "—" },
                  { label: "Username",    value: user?.username || "—" },
                  { label: "Department",  value: user?.department || "—" },
                  { label: "Role",        value: "OPCS Staff Member" },
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

          {/* My Tickets / History placeholder */}
          {(activeNav === "my_tickets" || activeNav === "history") && (
            <div style={{ backgroundColor: "white", borderRadius: 16, padding: 48, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#003399", marginBottom: 8 }}>
                {activeNav === "my_tickets" ? "My Submitted Tickets" : "Ticket History"}
              </h3>
              <p style={{ color: "#94A3B8", fontSize: 14 }}>
                {activeNav === "my_tickets"
                  ? "Tickets you submit will appear here so you can track their status."
                  : "Your full ticket history will be shown here once the backend is connected."}
              </p>
            </div>
          )}

          {/* Report Issue form */}
          {activeNav === "report" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, maxWidth: 1400, margin: "0 auto" }}>

            {/* ── TICKET FORM ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={handleSubmit} style={{
                backgroundColor: "white", borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: 32, display: "flex", flexDirection: "column", gap: 22,
              }}>

                {/* Title */}
                <div>
                  <label style={labelStyle}>Issue Title *</label>
                  <input
                    name="title" value={form.title} onChange={handleChange}
                    required type="text"
                    placeholder="e.g. Printer not connecting to network"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#003399")}
                    onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Issue Description *</label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange}
                    required rows={5}
                    placeholder="Describe the problem in detail. When did it start? What were you doing?"
                    style={{ ...inputStyle, resize: "none" }}
                    onFocus={e => (e.target.style.borderColor = "#003399")}
                    onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>

                {/* Department + Location */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Department *</label>
                    <select
                      name="department" value={form.department} onChange={handleChange} required
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#003399")}
                      onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                    >
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Office Location *</label>
                    <select
                      name="location" value={form.location} onChange={handleChange} required
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#003399")}
                      onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                    >
                      <option value="">Select location</option>
                      {locations.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label style={labelStyle}>Priority Level *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {priorities.map(p => (
                      <button
                        key={p.value} type="button"
                        onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                        style={{
                          padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                          border: `2px solid ${form.priority === p.value ? p.color : "#E2E8F0"}`,
                          backgroundColor: form.priority === p.value ? p.bg : "white",
                          color: form.priority === p.value ? p.color : "#64748B",
                          textAlign: "left", transition: "all 0.2s",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{p.label}</div>
                        <div style={{ fontSize: 11, marginTop: 2, opacity: 0.75 }}>{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File attachment */}
                <div>
                  <label style={labelStyle}>Attach Screenshot (Optional)</label>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 18px", borderRadius: 12,
                    border: "2px dashed #003399", backgroundColor: "#EBF0FA",
                    cursor: "pointer",
                  }}>
                    <Paperclip size={18} color="#003399" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#003399" }}>
                      {file ? file.name : "Click to upload a screenshot or file"}
                    </span>
                    <input
                      type="file" style={{ display: "none" }} accept="image/*,.pdf"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 28px rgba(0,51,153,0.35)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  style={{
                    width: "100%", padding: "16px 0", borderRadius: 12, border: "none",
                    backgroundColor: "#003399", color: "white",
                    fontSize: 16, fontWeight: 800, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}
                >
                  <Send size={18} />
                  Submit IT Support Request
                </motion.button>

                {/* Gold accent */}
                <div style={{ width: "100%", height: 5, borderRadius: 99, backgroundColor: "#FFCC00" }} />
              </form>
            </motion.div>

            {/* ── AI ASSISTANT ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div style={{
                backgroundColor: "white", borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                overflow: "hidden", position: "sticky", top: 0,
              }}>
                {/* AI header */}
                <div style={{
                  padding: "18px 20px", backgroundColor: "#003399",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    backgroundColor: "#FFCC00",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Bot size={20} color="#003399" />
                  </div>
                  <div>
                    <p style={{ color: "white", fontWeight: 800, fontSize: 14 }}>OPCS IT Assistant</p>
                    <p style={{ color: "#93C5FD", fontSize: 11 }}>Powered by Claude AI</p>
                  </div>
                </div>

                {/* Chat messages */}
                <div style={{ padding: 16, height: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                  {aiMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                    >
                      <div style={{
                        maxWidth: "85%", padding: "10px 14px", borderRadius: 12,
                        fontSize: 13, lineHeight: 1.6,
                        backgroundColor: msg.role === "user" ? "#003399" : "#EBF0FA",
                        color: msg.role === "user" ? "white" : "#1E293B",
                      }}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {aiLoading && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{
                        padding: "10px 14px", borderRadius: 12,
                        backgroundColor: "#EBF0FA", color: "#64748B", fontSize: 13,
                      }}>
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* AI input */}
                <div style={{ padding: 16, borderTop: "1px solid #F1F5F9" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={aiQuery}
                      onChange={e => setAiQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAiSend()}
                      placeholder="Ask about your issue..."
                      style={{ ...inputStyle, flex: 1, padding: "10px 14px", fontSize: 13 }}
                      onFocus={e => (e.target.style.borderColor = "#003399")}
                      onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAiSend}
                      style={{
                        padding: "10px 14px", borderRadius: 10, border: "none",
                        backgroundColor: "#003399", color: "white",
                        cursor: "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center",
                      }}
                    >
                      <Send size={15} />
                    </motion.button>
                  </div>
                  <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>
                    Try AI first before submitting a ticket
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
          )} {/* end activeNav === "report" */}
        </main>
      </div>
    </div>
  );
}

// Shared label style
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#1E293B",
  marginBottom: 8,
};
