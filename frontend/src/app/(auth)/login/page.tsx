"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore, mockUsers } from "@/store/authStore";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: "", email: "", department: "", password: ""
  });

  // Auth store and router
  const { login } = useAuthStore();
  const router = useRouter();

  // Handle login form submission
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Find user in mock data — will be replaced by real API call
      const user = mockUsers.find(
        u => u.email === loginForm.email && u.password === loginForm.password
      );

      if (!user) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Log the user in and store in global state
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      });

      // Redirect based on role
      if (user.role === "intern")      router.push("/intern");
      if (user.role === "staff")       router.push("/staff");
      if (user.role === "supervisor")  router.push("/supervisor");

      setLoading(false);
    }, 800);
  }

  // Handle signup form submission
  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate account creation — will be replaced by real API
    setTimeout(() => {
      // After signup, default new users to staff role
      login({
        id: Date.now().toString(),
        name: signupForm.name,
        email: signupForm.email,
        role: "staff",
        department: signupForm.department,
      });

      router.push("/staff");
      setLoading(false);
    }, 800);
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", backgroundColor: "#003399" }}>

      {/* ---- LEFT BRANDING PANEL ---- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: 64, backgroundColor: "#003399" }}
      >
        <div className="flex flex-col items-center text-center mt-16">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            src="/coat-of-arms.jpg"
            alt="Kenya Coat of Arms"
            className="w-48 h-48 object-contain mb-10 drop-shadow-2xl"
          />
          <h1 className="text-white text-4xl font-extrabold leading-tight mb-4">
            Office of the Prime<br />Cabinet Secretary
          </h1>
          <p className="text-blue-200 text-xl mb-6">Republic of Kenya</p>
          <div className="w-32 h-1.5 rounded-full mb-8" style={{ backgroundColor: "#FFCC00" }} />
          <p className="text-blue-200 text-base leading-relaxed max-w-xs">
            Centralized IT Incident Management and Support Platform for OPCS Staff
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-8">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Shield size={16} className="text-yellow-400" />
            <span className="text-blue-100 text-sm font-medium">Secure Government Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor size={14} className="text-blue-300" />
            <span className="text-blue-300 text-xs">OPCS eSupport v1.0 — May 2026</span>
          </div>
        </div>
      </motion.div>

      {/* ---- RIGHT FORM PANEL ---- */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16"
        style={{ backgroundColor: "#F5F7FA" }}
      >
        <div className="w-full max-w-lg">

          {/* Mobile header */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <img src="/coat-of-arms.jpg" alt="Coat of Arms" className="w-24 h-24 object-contain mb-4" />
            <h1 className="text-2xl font-extrabold" style={{ color: "#003399" }}>OPCS eSupport</h1>
          </div>

          {/* Page heading */}
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold mb-2" style={{ color: "#003399" }}>
              {activeTab === "login" ? "Welcome back" : "Get started"}
            </h2>
            <p className="text-gray-500 text-base">
              {activeTab === "login"
                ? "Sign in to your OPCS eSupport account"
                : "Create your account in under 30 seconds"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex mb-10 rounded-xl p-1.5" style={{ backgroundColor: "#E2E8F0" }}>
            {["login", "signup"].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab as "login" | "signup"); setError(""); }}
                className="flex-1 py-3 rounded-lg text-base font-semibold transition-all duration-300"
                style={{
                  backgroundColor: activeTab === tab ? "#003399" : "transparent",
                  color: activeTab === tab ? "white" : "#64748B",
                  boxShadow: activeTab === tab ? "0 4px 12px rgba(0,51,153,0.3)" : "none",
                }}
              >
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >

              {/* Error message */}
              {error && (
                <div
                  className="px-4 py-3 rounded-xl mb-6 text-sm font-medium"
                  style={{ backgroundColor: "#FFE5E5", color: "#CC0000" }}
                >
                  {error}
                </div>
              )}

              {/* LOGIN FORM */}
              {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#1E293B" }}>
                      OPCS Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@opcs.go.ke"
                      value={loginForm.email}
                      onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border-2 text-base transition-all outline-none"
                      style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
                      onFocus={e => (e.target.style.borderColor = "#003399")}
                      onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#1E293B" }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-5 py-4 rounded-xl border-2 text-base transition-all outline-none pr-14"
                        style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
                        onFocus={e => (e.target.style.borderColor = "#003399")}
                        onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>



                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,51,153,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-white text-base font-bold transition-all"
                    style={{ backgroundColor: loading ? "#6B93CC" : "#003399" }}
                  >
                    {loading ? "Signing in..." : "Sign In to OPCS eSupport"}
                  </motion.button>
                </form>
              )}

              {/* SIGNUP FORM */}
              {activeTab === "signup" && (
                <form onSubmit={handleSignup} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#1E293B" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elikanah Njuru"
                      value={signupForm.name}
                      onChange={e => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border-2 text-base transition-all outline-none"
                      style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
                      onFocus={e => (e.target.style.borderColor = "#003399")}
                      onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#1E293B" }}>
                      OPCS Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@opcs.go.ke"
                      value={signupForm.email}
                      onChange={e => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border-2 text-base transition-all outline-none"
                      style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
                      onFocus={e => (e.target.style.borderColor = "#003399")}
                      onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#1E293B" }}>
                      Department
                    </label>
                    <select
                      required
                      value={signupForm.department}
                      onChange={e => setSignupForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border-2 text-base outline-none bg-white"
                      style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
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

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#1E293B" }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Create a strong password"
                        value={signupForm.password}
                        onChange={e => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-5 py-4 rounded-xl border-2 text-base transition-all outline-none pr-14"
                        style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
                        onFocus={e => (e.target.style.borderColor = "#003399")}
                        onBlur={e  => (e.target.style.borderColor = "#E2E8F0")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,51,153,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-white text-base font-bold transition-all"
                    style={{ backgroundColor: loading ? "#6B93CC" : "#003399" }}
                  >
                    {loading ? "Creating account..." : "Create My Account"}
                  </motion.button>
                </form>
              )}

            </motion.div>

            {/* Gold bottom accent */}
            <div className="w-full h-1.5 rounded-full mt-8" style={{ backgroundColor: "#FFCC00" }} />
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            © 2026 Office of the Prime Cabinet Secretary, Republic of Kenya
          </p>
        </div>
      </motion.div>
    </div>
  );
}