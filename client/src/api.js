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

// If any response comes back 401 (token missing/expired), drop the stale token.
// Full "redirect to login" handling comes in Phase 6.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

export default api;