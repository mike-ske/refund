import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  { image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=85", alt: "Customer getting support at a service desk", title: "A clear path forward", copy: "Keep your application details and staff updates together in one secure place." },
  { image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=85", alt: "People discussing a service request", title: "Support when you need it", copy: "Send a message to program staff and check updates using your reference number." },
  { image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=85", alt: "Person reviewing documents at a desk", title: "Know where things stand", copy: "See your application progress and read updates from the program team." },
  { image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=85", alt: "Customer support professional ready to help", title: "Here to help you apply", copy: "Review the process and contact the team through verified channels." },
];

export function AuthLayout({ children }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);
  const slide = slides[active];

  return <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(390px,0.86fr)_minmax(0,1.14fr)]">
    <main className="order-1 flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
      <div className="flex items-center justify-between gap-3"><Link to="/" aria-label="Allocation Refund Program home"><img src="/logo.jpg" alt="Allocation Refund Program" className="h-auto w-48 max-w-[62vw] object-contain object-left sm:w-64" /></Link><Link to="/" className="shrink-0 text-sm font-semibold text-brand hover:text-brand-dark">← Home</Link></div>
      <div className="flex flex-1 items-center justify-center py-8"><div className="w-full max-w-md">{children}</div></div>
      <p className="mx-auto mt-auto max-w-md text-center text-xs leading-relaxed text-muted">Protect your account. Program staff will never ask for your password, PIN, card security code, or one-time code.</p>
    </main>
    <aside aria-label="Application support highlights" className="group relative order-2 min-h-[220px] overflow-hidden bg-brand-dark lg:sticky lg:top-0 lg:h-dvh lg:min-h-[600px]">
      <img key={slide.image} src={slide.image} alt={slide.alt} className="auth-slide-image absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071b43]/95 via-[#071b43]/25 to-[#071b43]/10" />
      <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur sm:left-8 sm:top-8">Allocation Refund Program</div>
      <div key={slide.title} className="auth-slide-copy absolute inset-x-5 bottom-12 text-white sm:inset-x-10 sm:bottom-14 lg:inset-x-14 lg:bottom-20 xl:inset-x-20"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Applicant portal</p><h2 className="mt-3 max-w-xl text-3xl font-extrabold sm:text-4xl lg:text-5xl">{slide.title}</h2><p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{slide.copy}</p><div className="mt-7 flex items-center gap-2">{slides.map((item, index) => <button key={item.title} type="button" onClick={() => setActive(index)} aria-label={`Show image ${index + 1} of ${slides.length}`} aria-current={active === index} className={`h-2 rounded-full transition-all duration-300 ${active === index ? "w-9 bg-white" : "w-2 bg-white/55 hover:bg-white/80"}`} />)}</div></div>
      <p className="absolute bottom-5 right-6 hidden text-xs text-white/70 lg:block">Program review depends on official rules.</p>
    </aside>
  </div>;
}
