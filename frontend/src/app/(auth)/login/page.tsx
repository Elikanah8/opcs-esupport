"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Monitor, Users, UserCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const departments = [
  "Directorate of ICT",
  "Directorate of Finance",
  "Directorate of Administration",
  "Directorate of Legal Services",
  "Communications Unit",
  "Office of the Cabinet Secretary",
  "Human Resource Directorate",
];

export default function LoginPage() {
  const router = useRouter();
  const { login, register, rehydrate, error, setError } = useAuthStore();

  const [activeTab,    setActiveTab]    = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [localError,   setLocalError]   = useState("");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", department: "", password: "", confirmPassword: "",
    role: "staff" as "staff" | "intern",
  });

  // Rehydrate session on mount — if already logged in, redirect
  useEffect(() => {
    rehydrate();
    const saved = localStorage.getItem("opcs_current_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        router.replace(u.role === "intern" ? "/intern" : "/staff");
      } catch { /* ignore */ }
    }
  }, []);

  function clearErrors() {
    setLocalError("");
    setError("");
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();
    const result = login(loginForm.username, loginForm.password);
    if (result.success && result.role) {
      router.push(result.role === "intern" ? "/intern" : "/staff");
    } else {
      setLocalError(result.message || "Incorrect username or password.");
    }
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    if (!signupForm.firstName.trim() || !signupForm.lastName.trim()) {
      setLocalError("Please enter your full name."); return;
    }
    if (!signupForm.username.trim()) {
      setLocalError("Please choose a username."); return;
    }
    if (!signupForm.department) {
      setLocalError("Please select your department."); return;
    }
    if (signupForm.password.length < 6) {
      setLocalError("Password must be at least 6 characters."); return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setLocalError("Passwords do not match."); return;
    }

    const result = register({
      name:       `${signupForm.firstName.trim()} ${signupForm.lastName.trim()}`,
      email:      signupForm.email.trim(),
      username:   signupForm.username.trim(),
      role:       signupForm.role,
      department: signupForm.department,
      password:   signupForm.password,
    });

    if (!result.success) { setLocalError(result.message); return; }

    const loginResult = login(signupForm.username.trim(), signupForm.password);
    if (loginResult.success && loginResult.role) {
      router.push(loginResult.role === "intern" ? "/intern" : "/staff");
    }
  }

  const displayError = localError || error;

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", backgroundColor: "#003399" }}>

      {/* LEFT — branding */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
        style={{ width: "50%", minWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: 64, backgroundColor: "#003399" }}>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 48 }}>
          <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
            src="/coat-of-arms.jpg" alt="Kenya Coat of Arms"
            style={{ width: 180, height: 180, objectFit: "contain", marginBottom: 32, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }} />
          <h1 style={{ color: "white", fontSize: 34, fontWeight: 900, lineHeight: 1.25, marginBottom: 12 }}>
            Office of the Prime<br />Cabinet Secretary
          </h1>
          <p style={{ color: "#93C5FD", fontSize: 17, marginBottom: 20 }}>Republic of Kenya</p>
          <div style={{ width: 120, height: 5, borderRadius: 99, backgroundColor: "#FFCC00", marginBottom: 24 }} />
          <p style={{ color: "#BFDBFE", fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
            Centralized IT Incident Management and Support Platform for OPCS Staff
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 99, backgroundColor: "rgba(255,255,255,0.1)" }}>
            <Shield size={15} color="#FACC15" />
            <span style={{ color: "#DBEAFE", fontSize: 13, fontWeight: 600 }}>Secure Government Platform</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Monitor size={13} color="#93C5FD" />
            <span style={{ color: "#93C5FD", fontSize: 12 }}>OPCS eSupport v1.0 — May 2026</span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT — form */}
      <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 64px", backgroundColor: "#F5F7FA", overflowY: "auto" }}>

        <div style={{ width: "100%", maxWidth: 520 }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "#003399", marginBottom: 8 }}>
              {activeTab === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p style={{ color: "#64748B", fontSize: 15 }}>
              {activeTab === "login" ? "Sign in to your OPCS eSupport account" : "Register with your OPCS credentials"}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", backgroundColor: "#E2E8F0", borderRadius: 14, padding: 6, marginBottom: 28 }}>
            {(["login", "signup"] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); clearErrors(); }}
                style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, transition: "all 0.25s",
                  backgroundColor: activeTab === tab ? "#003399" : "transparent",
                  color: activeTab === tab ? "white" : "#64748B",
                  boxShadow: activeTab === tab ? "0 4px 14px rgba(0,51,153,0.3)" : "none" }}>
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Card */}
          <div style={{ backgroundColor: "white", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.10)", padding: 36 }}>

            {displayError && (
              <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "#FFE5E5", color: "#CC0000", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
                ⚠ {displayError}
              </div>
            )}

            {/* LOGIN */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={lbl}>Username</label>
                  <input type="text" required placeholder="Enter your username"
                    value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                    style={inp} onFocus={e => (e.target.style.borderColor = "#003399")} onBlur={e => (e.target.style.borderColor = "#E2E8F0")} />
                </div>
                <div>
                  <label style={lbl}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} required placeholder="Enter your password"
                      value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      style={{ ...inp, paddingRight: 52 }}
                      onFocus={e => (e.target.style.borderColor = "#003399")} onBlur={e => (e.target.style.borderColor = "#E2E8F0")} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", color: "#94A3B8" }}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button type="submit" style={btn}>Sign In to OPCS eSupport</button>
                <p style={{ textAlign: "center", fontSize: 13, color: "#64748B" }}>
                  No account?{" "}
                  <button type="button" onClick={() => { setActiveTab("signup"); clearErrors(); }}
                    style={{ background: "none", border: "none", color: "#003399", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                    Create one now
                  </button>
                </p>
              </form>
            )}

            {/* SIGNUP */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Role */}
                <div>
                  <label style={lbl}>I am a</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {(["staff", "intern"] as const).map(r => (
                      <button key={r} type="button" onClick={() => setSignupForm(p => ({ ...p, role: r }))}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                          border: `2px solid ${signupForm.role === r ? "#003399" : "#E2E8F0"}`,
                          backgroundColor: signupForm.role === r ? "#EBF0FA" : "white",
                          color: signupForm.role === r ? "#003399" : "#64748B",
                          fontSize: 14, fontWeight: 700 }}>
                        {r === "staff" ? <Users size={15} /> : <UserCheck size={15} />}
                        {r === "staff" ? "Staff Member" : "IT Intern"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>First Name</label>
                    <input type="text" required placeholder="e.g. Elikanah" value={signupForm.firstName}
                      onChange={e => setSignupForm(p => ({ ...p, firstName: e.target.value }))}
                      style={inp} onFocus={e => (e.target.style.borderColor = "#003399")} onBlur={e => (e.target.style.borderColor = "#E2E8F0")} />
                  </div>
                  <div>
                    <label style={lbl}>Last Name</label>
                    <input type="text" required placeholder="e.g. Njuru" value={signupForm.lastName}
                      onChange={e => setSignupForm(p => ({ ...p, lastName: e.target.value }))}
                      style={inp} onFocus={e => (e.target.style.borderColor = "#003399")} onBlur={e => (e.target.style.borderColor = "#E2E8F0")} />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label style={lbl}>Username</label>
                  <input type="text" required placeholder="Choose a username" value={signupForm.username}
                    onChange={e => setSignupForm(p => ({ ...p, username: e.target.value }))}
                    style={inp} onFocus={e => (e.target.style.borderColor = "#003399")} onBlur={e => (e.target.style.borderColor = "#E2E8F0")} />
                </div>

                {/* Email */}
                <div>
                  <label style={lbl}>OPCS Email Address</label>
                  <input type="email" required placeholder="yourname@opcs.go.ke" value={signupForm.email}
                    onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))}
                    style={inp} onFocus={e => (e.target.style.borderColor = "#003399")} onBlur={e => (e.target.style.borderColor = "#E2E8F0")} />
                </div>

                {/* Department */}
                <div>
                  <label style={lbl}>Department</label>
                  <select required value={signupForm.department}
                    onChange={e => setSignupForm(p => ({ ...p, department: e.target.value }))}
                    style={{ ...inp, backgroundColor: "white" }}
                    onFocus={e => (e.target.style.borderColor = "#003399")} onBlur={e => (e.target.style.borderColor = "#E2E8F0")}>
                    <option value="">Select your department</option>
                    {departments.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label style={lbl}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} required placeholder="Min 6 characters"
                      value={signupForm.password} onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))}
                      style={{ ...inp, paddingRight: 52 }}
                      onFocus={e => (e.target.style.borderColor = "#003399")} onBlur={e => (e.target.style.borderColor = "#E2E8F0")} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", color: "#94A3B8" }}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label style={lbl}>Confirm Password</label>
                  <input type="password" required placeholder="Re-enter your password"
                    value={signupForm.confirmPassword} onChange={e => setSignupForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    style={inp} onFocus={e => (e.target.style.borderColor = "#003399")} onBlur={e => (e.target.style.borderColor = "#E2E8F0")} />
                </div>

                <button type="submit" style={btn}>Create My Account & Sign In</button>

                <p style={{ textAlign: "center", fontSize: 13, color: "#64748B" }}>
                  Already have an account?{" "}
                  <button type="button" onClick={() => { setActiveTab("login"); clearErrors(); }}
                    style={{ background: "none", border: "none", color: "#003399", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                    Sign in
                  </button>
                </p>
              </form>
            )}

            <div style={{ width: "100%", height: 5, borderRadius: 99, backgroundColor: "#FFCC00", marginTop: 24 }} />
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 24 }}>
            © 2026 Office of the Prime Cabinet Secretary, Republic of Kenya
          </p>
        </div>
      </motion.div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 8 };
const inp: React.CSSProperties = { width: "100%", padding: "13px 18px", borderRadius: 12, border: "2px solid #E2E8F0", fontSize: 14, color: "#1E293B", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s", backgroundColor: "white" };
const btn: React.CSSProperties = { width: "100%", padding: "15px 0", borderRadius: 12, border: "none", backgroundColor: "#003399", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" };
