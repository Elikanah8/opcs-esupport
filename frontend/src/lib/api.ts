import axios from "axios";

// Base axios instance — all API calls go through this
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT access token to every request automatically
api.interceptors.request.use((config) => {
  // Get token from localStorage if it exists
  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a request returns 401 (unauthorized), redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored tokens and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;