import { create } from "zustand";

type Role = "staff" | "intern";

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  department: string;
  password: string;
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  error: string;
  setError: (msg: string) => void;
  register: (data: Omit<User, "id">) => { success: boolean; message: string };
  login: (username: string, password: string) => { success: boolean; role?: Role; message?: string };
  logout: () => void;
  rehydrate: () => void;
};

function getRegistry(): User[] {
  try {
    return JSON.parse(localStorage.getItem("opcs_users") || "[]");
  } catch { return []; }
}

function saveRegistry(users: User[]) {
  localStorage.setItem("opcs_users", JSON.stringify(users));
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
  error: "",

  // Call this once on the client to load saved session
  rehydrate: () => {
    const saved = getSavedUser();
    if (saved) set({ user: saved, isAuthenticated: true });
  },

  setError: (msg) => set({ error: msg }),

  register: (data) => {
    const users = getRegistry();
    if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
      return { success: false, message: "Username already taken. Please choose another." };
    }
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: "An account with this email already exists." };
    }
    const newUser: User = { ...data, id: Date.now().toString() };
    saveRegistry([...users, newUser]);
    return { success: true, message: "Account created!" };
  },

  login: (username, password) => {
    const users = getRegistry();
    const found = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!found) {
      set({ error: "Incorrect username or password." });
      return { success: false, message: "Incorrect username or password." };
    }
    localStorage.setItem("opcs_current_user", JSON.stringify(found));
    set({ user: found, isAuthenticated: true, error: "" });
    return { success: true, role: found.role };
  },

  logout: () => {
    localStorage.removeItem("opcs_current_user");
    set({ user: null, isAuthenticated: false, error: "" });
  },
}));
