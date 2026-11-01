import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { Badge, Field, Icon, SupportChannels, btn, fdate, inputCls } from "../ui";

export function Home() {
  const { program: p } = useAuth();
  const highlights = [
    ["shield", "Secure & trusted", "Submit your request directly and follow progress using your reference number."],
    ["clock", "Review guidance", "Review timelines depend on the official program rules."],
    ["doc", "Simple application", "Follow the steps and provide only the information requested."],
    ["user", "Dedicated support", "Contact the team through the customer service form."],
  ];
  const steps = [
    ["Review the rules", "Confirm the official criteria with the program operator."],
    ["Complete the form", "Share accurate contact details and a short description."],
    ["Submit for review", "Staff will contact you if more information is required."],
    ["Follow your request", "Use your reference number to check application status."],
  ];
  return <>
    <section className="relative isolate overflow-hidden bg-[#eef6fd] lg:min-h-[500px]"><img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1900&q=90" alt="Customer service team supporting a visitor" className="absolute inset-0 -z-20 h-full w-full object-cover object-[63%_center]" /><div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#eef6fd] via-[#eef6fd]/95 to-[#eef6fd]/30 lg:bg-gradient-to-r lg:from-[#eef6fd] lg:via-[#eef6fd]/95 lg:via-[57%] lg:to-[#eef6fd]/10" /><div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-9 sm:px-6 sm:py-14 lg:min-h-[500px] lg:grid-cols-[1.1fr_.9fr] lg:gap-10 lg:px-8 lg:py-12">
      <div className="relative z-10"><p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-brand">{p.name}</p><h1 className="mt-4 max-w-2xl text-[2.25rem] font-extrabold leading-[1.06] tracking-tight text-brand-dark sm:text-5xl lg:text-[3.35rem]">Understand your options.<br className="hidden sm:block" /> Apply with confidence.</h1><p className="mt-5 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">Review the official program information and submit a request for review. Eligibility, benefits, and any refund depend on the verified rules.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/apply" className={`${btn} inline-flex items-center gap-2 shadow-lg shadow-brand/20`}>Apply now <Icon name="arrow" className="h-5 w-5" /></Link></div><div className="mt-5 max-w-xl rounded-xl border border-blue-200 bg-white/90 p-4 text-sm leading-relaxed text-slate-700">A federal government and World Bank–associated initiative aimed at helping eligible individuals with bills, homeownership, education, and business startup opportunities, including veterans, retirees, widows, people with disabilities, teachers, nurses, and the unemployed.</div></div>
      <div className="relative z-10 flex items-end justify-center pb-2 sm:justify-end lg:min-h-[390px] lg:pb-0"><div className="w-full max-w-sm rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl backdrop-blur sm:p-6"><h2 className="text-xl font-extrabold text-brand-dark">Need help?</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Our customer service team can assist with questions about the process and your application.</p><ul className="mt-4 space-y-3 text-sm">{p.phone && <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft text-brand"><Icon name="phone" className="h-5 w-5" /></span><span className="min-w-0"><b className="block break-words text-brand-dark">{p.phone}</b><span className="text-xs text-muted">{p.hours}</span></span></li>}{p.email && <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft text-brand"><Icon name="mail" className="h-5 w-5" /></span><span className="min-w-0"><b className="block break-all text-brand-dark">{p.email}</b><span className="text-xs text-muted">Use verified operator contact details.</span></span></li>}{p.chat_url && <li><a className="inline-flex items-center gap-3 font-bold text-brand" href={p.chat_url}><Icon name="chat" className="h-5 w-5" />Live chat</a></li>}</ul><div className="mt-4 border-t border-line pt-4"><SupportChannels program={p} /></div><Link to="/customer-service" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-3 font-semibold text-white hover:bg-brand"><Icon name="phone" className="h-5 w-5" />Customer service</Link></div></div>
    </div></section>
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">{highlights.map(([icon, title, text]) => <article key={title} className="px-2 py-3"><span className="grid h-16 w-16 place-items-center rounded-full bg-soft text-brand"><Icon name={icon} className="h-8 w-8" /></span><h2 className="mt-3 font-extrabold text-brand-dark">{title}</h2><p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-600">{text}</p></article>)}</section>
    <section id="how" className="bg-soft/70 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-brand">Get started</p><h2 className="mt-2 text-3xl font-extrabold text-brand-dark sm:text-4xl">How to apply</h2><p className="mt-3 text-slate-600">Follow these general steps and confirm the official program requirements before applying.</p></div><ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, text], index) => <li key={title} className="relative flex gap-4 py-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-dark text-lg font-bold text-white">{index + 1}</span><div><h3 className="font-bold text-brand-dark">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p></div>{index < steps.length - 1 && <span aria-hidden="true" className="absolute -right-1 top-4 hidden text-3xl font-light text-brand/60 lg:block">›</span>}</li>)}</ol><div className="mt-8 flex justify-center"><Link to="/apply" className={`${btn} inline-flex items-center gap-2`}>Apply now <Icon name="arrow" className="h-5 w-5" /></Link></div></div></section>
  </>;
}

export function Timeline({ events }) {
  return (
    <ol className="mt-4 space-y-5 border-l-2 border-line pl-5">{events.map((e) => (
      <li key={e.id} className="relative"><span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-brand" />
        <p className="font-semibold"><Badge s={e.status} /> <span className="text-sm font-normal text-muted">· {e.author_role === "user" ? "Your message" : ["admin", "super_admin"].includes(e.author_role) ? "Program staff" : "Update"} · {fdate(e.created_at, true)}</span></p>{e.message && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{e.message}</p>}</li>))}</ol>
  );
}

export function Status() {
  const [params] = useSearchParams();
  const [f, setF] = useState({ reference: params.get("reference") || "" }), [app, setApp] = useState(null), [err, setErr] = useState(null), [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null); setApp(null);
    try { setApp(await api("/status", { method: "POST", body: f })); } catch (x) { setErr(x.errors.reference?.[0] || x.message); }
    setBusy(false);
  };
  return (
    <section className="bg-soft/60 py-10 sm:py-12"><div className="mx-auto max-w-2xl px-4 sm:px-5"><div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm"><img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85" alt="Program staff reviewing a customer request" className="h-48 w-full object-cover sm:h-60" /><div className="p-5 sm:p-7"><p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-brand">Application tracking</p><h1 className="mt-2 text-3xl font-extrabold text-brand-dark">Check application status</h1><p className="mt-2 text-sm text-slate-600">Enter the reference number shown after you submitted your application.</p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
        <Field label="Reference number"><input className={`${inputCls} uppercase`} required maxLength={20} autoComplete="off" placeholder="ARP-XXXXXXXX" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value.toUpperCase() })} /></Field>
        {err && <p role="alert" className="text-sm text-rose-600">{err}</p>}<button disabled={busy} className={`${btn} w-full`}>{busy ? "Checking…" : "Check status"}</button></form>
      {app && <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-sm text-muted">{app.reference}</p><p className="font-bold text-brand-dark">Application status</p></div><Badge s={app.status} /></div><Timeline events={app.events} /></div>}
    </div></div></div></section>
  );
}
