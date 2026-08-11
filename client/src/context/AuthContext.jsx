import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  // The login response only carries { id, name, role } — no email/CET details.
  // Hydrate the full profile from /auth/me so the header menu, profile page and
  // dashboard progress all have real data.
  const hydrateProfile = async (base) => {
    try {
      const res = await api.get("/auth/me");
      const full = { ...base, ...res.data, id: res.data._id || base?.id };
      persist(full);
      return full;
    } catch {
      return base; // non-fatal: keep whatever we have
    }
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: basicUser } = res.data;
    localStorage.setItem("token", token);
    persist(basicUser);
    return hydrateProfile(basicUser); // returned so the page can redirect by role
  };

  const logout = () => {
    localStorage.removeItem("token");
    persist(null);
  };

  useEffect(() => {
    // Expired/invalid token detected by the API layer → end the session everywhere.
    const onUnauthorized = () => persist(null);
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  useEffect(() => {
    // On a fresh page load with a stored session, refresh the profile once in the
    // background (also validates the token is still alive).
    if (localStorage.getItem("token") && user && !user.email) {
      hydrateProfile(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
