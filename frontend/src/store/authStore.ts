import { create } from "zustand";
import api from "@/lib/api";

// Define all possible user roles in the system
type Role = "staff" | "intern" | "supervisor" | "admin";

// Shape of a logged-in user object
type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
};

// Shape of the global auth store
type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: "",

  // Set user directly — used after fetching profile
  setUser: (user: User) => set({ user, isAuthenticated: true }),

  // Login — calls real Django JWT endpoint
  login: async (username: string, password: string) => {
    set({ loading: true, error: "" });

    try {
      // Step 1 — Get JWT tokens from Django
      const tokenResponse = await api.post("/api/auth/login/", {
        username,
        password,
      });

      const { access, refresh } = tokenResponse.data;

      // Step 2 — Store tokens in localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Step 3 — Fetch current user profile using the token
      const userResponse = await api.get("/api/users/me/");
      const userData = userResponse.data;

      // Step 4 — Store user in global state
      const user: User = {
        id:         userData.id,
        name:       `${userData.first_name} ${userData.last_name}`,
        email:      userData.email,
        role:       userData.role,
        department: userData.department_name || "",
      };

      set({ user, isAuthenticated: true, loading: false });

      // Step 5 — Return role so login page can redirect correctly
      return user.role;

    } catch (error: any) {
      const message = error.response?.data?.detail || "Invalid username or password.";
      set({ error: message, loading: false });
      return null;
    }
  },

  // Logout — clears tokens and user state
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false });
  },
}));