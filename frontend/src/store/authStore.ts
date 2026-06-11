import { create } from "zustand";

export type Role = "staff" | "intern" | "supervisor" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  role: Role;
  department: string;
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  setError: (msg: string) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; role?: Role; message?: string }>;
  register: (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: "staff" | "intern";
    department: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  rehydrate: () => void;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function saveTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("opcs_current_user");
}

function getSavedUser(): User | null {
  try {
    const raw = localStorage.getItem("opcs_current_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: "",

  setError: (msg) => set({ error: msg }),

  // Restore session from localStorage on page reload
  rehydrate: () => {
    const saved = getSavedUser();
    const token = localStorage.getItem("access_token");
    if (saved && token) {
      set({ user: saved, isAuthenticated: true });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: "" });
    try {
      // Step 1: Get JWT tokens
      const tokenRes = await fetch(`${BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        const msg = err?.detail || "Incorrect username or password.";
        set({ error: msg, isLoading: false });
        return { success: false, message: msg };
      }

      const { access, refresh } = await tokenRes.json();
      saveTokens(access, refresh);

      // Step 2: Fetch user profile
      const meRes = await fetch(`${BASE_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      if (!meRes.ok) {
        clearTokens();
        set({ error: "Failed to load user profile.", isLoading: false });
        return { success: false, message: "Failed to load user profile." };
      }

      const profile = await meRes.json();
      const user: User = {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`.trim() || profile.username,
        email: profile.email,
        username: profile.username,
        role: profile.role as Role,
        department: profile.department_name || "",
      };

      localStorage.setItem("opcs_current_user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, error: "" });
      return { success: true, role: user.role };

    } catch {
      const msg = "Could not connect to the server. Is the backend running?";
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: "" });
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          password: data.password,
          role: data.role,
          // department is a string name — backend expects an ID,
          // so we leave it null here and they set it in profile later
          // (department lookup requires a separate API call)
        }),
      });

      set({ isLoading: false });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          err?.username?.[0] ||
          err?.email?.[0] ||
          err?.password?.[0] ||
          err?.detail ||
          "Registration failed. Please try again.";
        return { success: false, message: msg };
      }

      return { success: true, message: "Account created successfully!" };

    } catch {
      set({ isLoading: false });
      return { success: false, message: "Could not connect to the server. Is the backend running?" };
    }
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false, error: "" });
  },
}));
