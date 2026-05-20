"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Monitor, Users, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"staff" | "intern">("staff");

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    router.push(role === "intern" ? "/intern" : "/staff");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        backgroundColor: "#003399",
      }}
    >
      {/* ── LEFT BRANDING PANEL ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          width: "50%",
          minWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px",
          backgroundColor: "#003399",
        }}
      >
        {/* Top — Coat of Arms + Title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 48 }}>
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            src="/coat-of-arms.jpg"
            alt="Kenya Coat of Arms"
            style={{ width: 180, height: 180, objectFit: "contain", marginBottom: 36, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}
          />

          <h1 style={{ color: "white", fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>
            Office of the Prime<br />Cabinet Secretary
          </h1>

          <p style={{ color: "#93C5FD", fontSize: 18, marginBottom: 20 }}>Republic of Kenya</p>

          {/* Gold divider */}
          <div style={{ width: 120, height: 5, borderRadius: 99, backgroundColor: "#FFCC00", marginBottom: 28 }} />

          <p style={{ color: "#BFDBFE", fontSize: 15, lineHeight: 1.7, maxWidth: 300 }}>
            Centralized IT Incident Management and Support Platform for OPCS Staff
          </p>
        </div>

        {/* Bottom branding */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 18px", borderRadius: 99,
            backgroundColor: "rgba(255,255,255,0.1)",
          }}>
            <Shield size={15} color="#FACC15" />
            <span style={{ color: "#DBEAFE", fontSize: 13, fontWeight: 600 }}>Secure Government Platform</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Monitor size={13} color="#93C5FD" />
            <span style={{ color: "#93C5FD", fontSize: 12 }}>OPCS eSupport v1.0 — May 2026</span>
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT FORM PANEL ── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 64px",
          backgroundColor: "#F5F7FA",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 520 }}>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: "#003399", marginBottom: 8 }}>
              {activeTab === "login" ? "Welcome back" : "Get started"}
            </h2>
            <p style={{ color: "#64748B", fontSize: 15 }}>
              {activeTab === "login"
                ? "Sign in to your OPCS eSupport account"
                : "Create your account in under 30 seconds"}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", backgroundColor: "#E2E8F0", borderRadius: 14, padding: 6, marginBottom: 36 }}>
            {(["login", "signup"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                  transition: "all 0.25s",
                  backgroundColor: activeTab === tab ? "#003399" : "transparent",
                  color: activeTab === tab ? "white" : "#64748B",
                  boxShadow: activeTab === tab ? "0 4px 14px rgba(0,51,153,0.3)" : "none",
                }}
              >
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: 20,
            boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
            padding: 40,
          }}>
            <form onSubmit={handleSignIn}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 22 }}
              >

                {/* Role selector */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>
                    I am a
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {(["staff", "intern"] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          padding: "12px 16px",
                          borderRadius: 12,
                          border: `2px solid ${role === r ? "#003399" : "#E2E8F0"}`,
                          backgroundColor: role === r ? "#EBF0FA" : "white",
                          color: role === r ? "#003399" : "#64748B",
                          fontSize: 14, fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {r === "staff" ? <Users size={15} /> : <UserCheck size={15} />}
                        {r === "staff" ? "Staff Member" : "IT Intern"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full name — signup only */}
                {activeTab === "signup" && (
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elikanah Njuru"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#003399")}
                      onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>
                    OPCS Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@opcs.go.ke"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#003399")}
                    onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>

                {/* Department — signup only */}
                {activeTab === "signup" && (
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>
                      Department
                    </label>
                    <select
                      style={{ ...inputStyle, backgroundColor: "white" }}
                      onFocus={e => (e.target.style.borderColor = "#003399")}
                      onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                    >
                      <option value="">Select your department</option>
                      <option>Directorate of ICT</option>
                      <option>Directorate of Finance</option>
                      <option>Directorate of Administration</option>
                      <option>Directorate of Legal Services</option>
                      <option>Communications Unit</option>
                    </select>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={activeTab === "login" ? "Enter your password" : "Create a strong password"}
                      style={{ ...inputStyle, paddingRight: 52 }}
                      onFocus={e => (e.target.style.borderColor = "#003399")}
                      onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: "#94A3B8",
                        display: "flex", alignItems: "center",
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 28px rgba(0,51,153,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  style={{
                    width: "100%", padding: "16px 0",
                    borderRadius: 12, border: "none",
                    backgroundColor: "#003399", color: "white",
                    fontSize: 16, fontWeight: 800,
                    cursor: "pointer", marginTop: 4,
                  }}
                >
                  {activeTab === "login" ? "Sign In to OPCS eSupport" : "Create My Account"}
                </motion.button>

              </motion.div>
            </form>

            {/* Gold accent */}
            <div style={{ width: "100%", height: 5, borderRadius: 99, backgroundColor: "#FFCC00", marginTop: 28 }} />
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 28 }}>
            © 2026 Office of the Prime Cabinet Secretary, Republic of Kenya
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Shared input style
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 20px",
  borderRadius: 12,
  border: "2px solid #E2E8F0",
  fontSize: 15,
  color: "#1E293B",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};
