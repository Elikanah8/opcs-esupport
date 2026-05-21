import { create } from "zustand";

// Define all possible user roles in the system
type Role = "staff" | "intern" | "supervisor";

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
  login: (user: User) => void;
  logout: () => void;
};

// Mock users for testing — will be replaced by real API calls
export const mockUsers = [
  {
    id: "1",
    name: "Elikanah Njuru",
    email: "elikanah@opcs.go.ke",
    password: "intern123",
    role: "intern" as Role,
    department: "Directorate of ICT",
  },
  {
    id: "2",
    name: "Jane Mwangi",
    email: "jane@opcs.go.ke",
    password: "staff123",
    role: "staff" as Role,
    department: "Directorate of Finance",
  },
  {
    id: "3",
    name: "Supervisor OPCS",
    email: "supervisor@opcs.go.ke",
    password: "super123",
    role: "supervisor" as Role,
    department: "Directorate of ICT",
  },
];

// Global auth state using Zustand
export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isAuthenticated: false,

  // Set user as logged in
  login: (user: User) => set({ user, isAuthenticated: true }),

  // Clear user session
  logout: () => set({ user: null, isAuthenticated: false }),
}));