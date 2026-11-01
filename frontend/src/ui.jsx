import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";

export const STATUSES = {
  received: ["Received", "bg-slate-100 text-slate-700"], under_review: ["Under review", "bg-blue-100 text-blue-800"],
  needs_info: ["More information needed", "bg-amber-100 text-amber-800"], approved: ["Approved", "bg-emerald-100 text-emerald-800"], rejected: ["Not approved", "bg-rose-100 text-rose-800"],
};
export const Badge = ({ s }) => <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUSES[s]?.[1] || ""}`}>{STATUSES[s]?.[0] || s}</span>;
export const fdate = (d, time) => new Date(d).toLocaleString("en-NG", time ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
export const inputCls = "mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
export const btn = "rounded-full bg-brand px-8 py-3.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-50";

const P = { shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", doc: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  user: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  phone: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  mail: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  chat: "M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", arrow: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" };
export const Icon = ({ name, className = "h-6 w-6" }) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d={P[name]} /></svg>;

export function Field({ label, error, hint, children }) {
  return <label className="block text-sm font-semibold">{label}{hint && <span className="block font-normal text-muted">{hint}</span>}{children}{error && <span role="alert" className="block font-normal text-rose-600">{Array.isArray(error) ? error[0] : error}</span>}</label>;
}

export function AdminSkeleton({ rows = 4 }) {
  return <div aria-label="Loading content" aria-busy="true" className="space-y-3 p-4 sm:p-6">{Array.from({ length: rows }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-200" />)}</div>;
}

export function AdminToast({ children, tone = "success" }) {
  const [visible, setVisible] = useState(Boolean(children));
  useEffect(() => {
    setVisible(Boolean(children));
    if (!children) return undefined;
    const timeout = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timeout);
  }, [children]);
  if (!children || !visible) return null;
  return <div role={tone === "error" ? "alert" : "status"} className={`fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl ${tone === "error" ? "border-rose-200 bg-white text-rose-800" : "border-emerald-200 bg-white text-emerald-800"}`}>{children}</div>;
}

export function VerificationNotice() {
  return <aside className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-left text-xs leading-relaxed text-amber-950 sm:text-sm">
  A federal government and World Bank–associated initiative aimed at helping eligible individuals with bills, homeownership, education, and business startup opportunities, including veterans, retirees, widows, people with disabilities, teachers, nurses, and the unemployed.
  </aside>;
}

function SocialIcon({ name }) {
  const paths = {
    facebook: <path d="M13.2 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.5v2.1H6.8v3.2h2.8V21h3.6Z" />,
    x: <path d="M18.9 3h3.3l-7.2 8.2 8.5 11.2h-6.6l-5.2-6.8-6 6.8H2.4l7.7-8.8L1.9 3h6.8l4.7 6.2L18.9 3Zm-1.2 17.4h1.8L7.2 4.9H5.3l12.4 15.5Z" />,
    linkedin: <path d="M5.2 7.8A2.2 2.2 0 1 0 5.2 3.4a2.2 2.2 0 0 0 0 4.4ZM3.3 9.4h3.8V21H3.3V9.4Zm6.2 0h3.6V11h.1c.5-.9 1.7-1.9 3.5-1.9 3.8 0 4.5 2.5 4.5 5.7V21h-3.8v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9.5V9.4Z" />,
    youtube: <><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8Z" /><path className="fill-brand-dark" d="m9.7 15.5 5.8-3.5-5.8-3.5v7Z" /></>,
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">{paths[name]}</svg>;
}

function SocialLinks({ social = {} }) {
  const platforms = [["facebook", "Facebook"], ["x", "X"], ["linkedin", "LinkedIn"], ["youtube", "YouTube"]];
  return <div className="mt-4 flex items-center gap-3">{platforms.map(([name, label]) => {
    const href = social[name];
    let validHref = false;
    try { validHref = ["http:", "https:"].includes(new URL(href).protocol); } catch {}
    const icon = <SocialIcon name={name} />;
    return validHref
      ? <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={`Visit our ${label} profile`} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-brand-dark">{icon}</a>
      : <span key={name} aria-label={`${label} profile not configured`} title={`${label} profile not configured`} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/45">{icon}</span>;
  })}</div>;
}

export function Layout() {
  const { user, program: p, signOut } = useAuth(), { pathname, hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView(); else window.scrollTo(0, 0); }, [pathname, hash]);
  useEffect(() => { setMenuOpen(false); }, [pathname, hash]);
  if (pathname.startsWith("/admin")) return <main><Outlet /></main>;
  const link = ({ isActive }) => (isActive ? "text-brand" : "hover:text-brand");
  if (["/admin/login"].includes(pathname)) {
    return <main className="min-h-dvh bg-white"><Outlet /></main>;
  }
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-3 px-3 sm:gap-5 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0" aria-label={`${p.name} home`}><img src="/logo.jpg" alt={p.name} className="h-auto w-40 sm:w-60" /></Link>
          <nav className="hidden items-center gap-3 text-xs font-semibold text-slate-600 xl:flex 2xl:gap-4 2xl:text-[13px]">
            <NavLink to="/" end className={link}>Home</NavLink><NavLink to="/about" className={link}>About</NavLink><NavLink to="/how-it-works" className={link}>How it works</NavLink>
            <NavLink to="/apply" className={link}>Apply</NavLink><NavLink to="/status" className={link}>Check status</NavLink><NavLink to="/faqs" className={link}>FAQs</NavLink><NavLink to="/customer-service" className={link}>Customer service</NavLink><NavLink to="/privacy" className={link}>Privacy</NavLink>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            {user?.role === "admin" && <><Link to="/admin" className="hidden font-semibold text-brand sm:inline">Admin</Link><button onClick={signOut} className="hidden text-slate-600 hover:text-brand sm:inline">Sign out</button></>}
            <Link to="/customer-service" className="hidden items-center gap-2 rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white hover:bg-brand lg:inline-flex"><Icon name="phone" className="h-5 w-5" />Help</Link>
            <button type="button" aria-expanded={menuOpen} aria-label="Toggle navigation menu" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-line px-3 py-2 text-brand-dark xl:hidden">{menuOpen ? "Close" : "Menu"}</button>
          </div>
        </div>
        {menuOpen && <><button type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 top-[72px] z-20 cursor-default bg-brand-dark/25 backdrop-blur-[2px] xl:hidden" /><nav className="mobile-menu absolute left-2 right-2 top-[calc(100%-1px)] z-30 max-h-[calc(100dvh-80px)] overflow-y-auto rounded-b-3xl border border-line bg-white p-4 shadow-2xl sm:left-5 sm:right-5 sm:p-6 xl:hidden"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Explore</p><p className="mt-1 text-sm text-muted">Program information and support</p></div><button onClick={() => setMenuOpen(false)} className="rounded-full bg-soft px-4 py-2 text-sm font-semibold text-brand-dark">Close</button></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{[["Home", "/"], ["About", "/about"], ["How it works", "/how-it-works"], ["Apply", "/apply"], ["Check status", "/status"], ["FAQs", "/faqs"], ["Customer service", "/customer-service"], ["Privacy information", "/privacy"], ["Terms & conditions", "/terms"]].map(([label, to]) => <Link key={to} to={to} className="flex min-h-12 items-center rounded-xl border border-line px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand/30 hover:bg-soft hover:text-brand">{label}</Link>)}</div>{user?.role === "admin" && <div className="mt-3 flex gap-3"><Link to="/admin" className="text-brand">Admin dashboard</Link><button onClick={() => { signOut(); setMenuOpen(false); }} className="text-rose-700">Sign out</button></div>}</nav></>}
      </header>
      <main><Outlet /></main>
      <footer className="bg-brand-dark text-white/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div><div className="inline-flex rounded-xl bg-white p-2"><img src="/logo.jpg" alt={p.name} className="h-auto w-64" /></div>{p.operator && <p className="mt-4 text-sm">Operated by {p.operator}</p>}</div>
          <div><h3 className="font-semibold text-white">Quick links</h3><ul className="mt-3 grid grid-cols-2 gap-2 text-sm"><li><Link to="/">Home</Link></li><li><Link to="/faqs">FAQs</Link></li><li><Link to="/about">About</Link></li><li><Link to="/how-it-works">How it works</Link></li><li><Link to="/apply">Apply</Link></li><li><Link to="/customer-service">Contact</Link></li><li><Link to="/privacy">Privacy policy</Link></li><li><Link to="/terms">Terms &amp; conditions</Link></li></ul></div>
          <div><h3 className="font-semibold text-white">Customer service</h3><ul className="mt-3 space-y-2 text-sm">{p.phone && <li className="flex gap-2"><Icon name="phone" className="h-5 w-5 shrink-0" />{p.phone}</li>}{p.email && <li className="flex gap-2"><Icon name="mail" className="h-5 w-5 shrink-0" />{p.email}</li>}{p.chat_url && <li className="flex gap-2"><Icon name="chat" className="h-5 w-5 shrink-0" /><a href={p.chat_url}>Live Chat</a></li>}<li className="flex gap-2"><Icon name="clock" className="h-5 w-5 shrink-0" />{p.hours}</li><li><Link to="/customer-service" className="font-semibold text-white">Contact us</Link></li></ul></div>
          <div><h3 className="font-semibold text-white">Follow us</h3><p className="mt-3 text-sm text-white/65">Follow official program channels.</p><SocialLinks social={p.social} /></div>
        </div>
        <p className="border-t border-white/15 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} {p.name}. All rights reserved.</p>
      </footer>
    </>
  );
}

const adminLinks = [
  ["Dashboard", "/admin", "▦"], ["Applications", "/admin/applications", "▤"], ["Users", "/admin/users", "♧"],
  ["Payouts", "/admin/payouts", "$"], ["Emails", "/admin/emails", "✉"], ["Reports", "/admin/reports", "▥"], ["Settings", "/admin/settings", "⚙"],
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const title = pathname.includes("/applications/") ? "Application review" : adminLinks.find(([, path]) => path === pathname)?.[0] || (pathname.startsWith("/admin/contacts") ? "Customer messages" : "Admin workspace");
  const nav = <><div className="flex items-center gap-3 border-b border-line px-5 py-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-lg font-black text-white">A</span><span className="font-extrabold text-brand-dark">Allocation<span className="block text-[10px] font-semibold tracking-widest text-muted">ADMIN PORTAL</span></span></div><p className="px-5 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[.18em] text-muted">Workspace</p><nav aria-label="Admin navigation" className="space-y-1 px-3">{adminLinks.map(([label, to, icon]) => { const active = pathname === to || (to === "/admin/applications" && pathname.startsWith("/admin/applications/")); return <NavLink end={to === "/admin"} key={to} to={to} onClick={() => setDrawer(false)} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${active ? "bg-soft text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-brand"}`}><span className="grid w-5 place-items-center text-base" aria-hidden="true">{icon}</span>{label}</NavLink>; })}</nav></>;
  return <div className="min-h-dvh bg-[#f3f6fa] text-ink lg:grid lg:grid-cols-[244px_minmax(0,1fr)]"><aside className="hidden border-r border-line bg-white lg:block">{nav}</aside>{drawer && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close admin menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-slate-950/40"/><aside className="relative h-full w-[min(82vw,300px)] bg-white shadow-xl">{nav}</aside></div>}<div className="min-w-0"><header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6"><div className="flex min-w-0 items-center gap-3"><button onClick={() => setDrawer(true)} aria-label="Open admin menu" className="rounded-lg border border-line px-3 py-2 text-brand lg:hidden">☰</button><h1 className="truncate text-lg font-extrabold text-brand-dark sm:text-xl">{title}</h1></div><div className="flex items-center gap-3"><span className="hidden max-w-48 truncate text-sm font-semibold text-slate-600 sm:block">{user?.name || user?.email}</span><button onClick={signOut} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-soft sm:text-sm">Sign out</button></div></header><main className="min-w-0"> <Outlet /></main></div></div>;
}

/** Each role has its own area. Wrong role is sent to its own home; signed-out visitors go to that role's sign-in page. */
export function Require({ role, children }) {
  const { user } = useAuth(), loc = useLocation();
  if (!user) return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}
