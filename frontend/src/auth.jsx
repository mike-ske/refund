import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function Providers({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const [program, setProgram] = useState({ name: "Allocation Refund Program", tagline: "Your Allocation. Our Commitment.", hours: "Mon – Fri, 8 AM – 6 PM", review_time: "7–10 business days" });
  useEffect(() => { api("/program").then(setProgram).catch(() => {}); }, []);
  useEffect(() => {
    const handleExpired = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);
  // If the saved token has expired, drop the session.
  useEffect(() => { if (user) api("/me").catch((e) => e.status === 401 && signOut()); }, []);
  const signIn = (token, u) => { localStorage.setItem("token", token); localStorage.setItem("user", JSON.stringify(u)); setUser(u); };
  const signOut = () => { api("/logout", { method: "POST" }).catch(() => {}); localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); };
  return <Ctx.Provider value={{ user, program, signIn, signOut }}>{children}</Ctx.Provider>;
}
