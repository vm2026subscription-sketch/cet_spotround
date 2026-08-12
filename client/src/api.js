import axios from "axios";

// One axios instance the whole app shares.
// In production you'll set VITE_API_URL; locally it falls back to your dev server.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT (if the user is logged in) to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If any response comes back 401 (token missing/expired), the session is dead:
// drop the stale credentials and tell the app so it can return to the login page.
// (AuthContext listens for this event — keeps a single source of truth.)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(err);
  },
);

export default api;
