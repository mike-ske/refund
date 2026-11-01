import { useState } from "react";
import { api } from "../api";
import { Field, VerificationNotice, btn, inputCls } from "../ui";
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

  drawField("Applicant", application.full_name);
  drawField("Email address", application.email);
  drawField("Phone number", application.phone || "Not provided");
  drawField("Existing reference number", application.existing_reference || "None");
  drawField("Request description", application.message);
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
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", country_code: "US", phone_number: "", existing_reference: "", message: "", consent: false });
  const [errors, setErrors] = useState({}), [busy, setBusy] = useState(false), [result, setResult] = useState(null), [alert, setAlert] = useState(null);
  const bind = (key) => ({ value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }), onBlur: (event) => { if (event.target.validity && !event.target.validity.valid) setErrors({ ...errors, [key]: [event.target.validationMessage] }); } });
  const submit = async (event) => { event.preventDefault(); setBusy(true); setErrors({}); setAlert(null); try { const dialingCode = phoneCodes.find(([iso]) => iso === form.country_code)?.[2] || "+1"; const payload = { ...form, phone: `${dialingCode} ${form.phone_number}`.trim() }; delete payload.country_code; delete payload.phone_number; const application = await api("/applications", { method: "POST", body: payload }); setResult(application); setAlert({ type: "success", title: "Application received", body: `Your reference number is ${application.reference}. Save it to check your application status.` }); window.scrollTo({ top: 0, behavior: "smooth" }); } catch (error) { setErrors(error.errors || {}); setAlert({ type: "error", title: "Could not submit application", body: Object.keys(error.errors || {}).length ? "Review the highlighted fields and try again." : error.message }); } finally { setBusy(false); } };
  const download = () => { const link = document.createElement("a"); const url = URL.createObjectURL(applicationPdf(result)); link.href = url; link.download = `${result.reference}-application.pdf`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); };
  return <section className="bg-soft/60 py-8 sm:py-12"><div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.2fr_.8fr] lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-brand">Application request</p><h1 className="mt-2 text-[clamp(1.65rem,5vw,2.25rem)] font-extrabold text-brand-dark">Apply for review</h1><p className="mt-2 text-sm leading-relaxed text-slate-600">Complete the form to submit your details directly to program staff. Keep your reference number to check progress.</p><div className="mt-4"><VerificationNotice /></div>
    {alert && <div role={alert.type === "error" ? "alert" : "status"} className={`mt-5 rounded-2xl border p-5 shadow-lg ${alert.type === "success" ? "border-emerald-200 bg-white" : "border-rose-200 bg-white"}`}><div className="flex items-start gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-bold ${alert.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{alert.type === "success" ? "✓" : "!"}</span><div><h2 className="font-bold text-brand-dark">{alert.title}</h2><p className="mt-1 text-sm text-slate-600">{alert.body}</p>{result && <div className="mt-4 flex flex-wrap gap-2"><button onClick={download} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Download application details</button><a href={`/status?reference=${result.reference}`} className="rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand">Check status</a></div>}</div></div></div>}
    <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><Field label="First name" error={errors.first_name}><input required maxLength={80} autoComplete="given-name" className={inputCls} {...bind("first_name")} /></Field><Field label="Last name" error={errors.last_name}><input required maxLength={80} autoComplete="family-name" className={inputCls} {...bind("last_name")} /></Field></div><Field label="Email address" error={errors.email}><input required type="email" maxLength={150} autoComplete="email" className={inputCls} {...bind("email")} /></Field>
    <Field label="Phone number" error={errors.phone}><div className="grid grid-cols-[minmax(0,1fr)_minmax(7rem,1.2fr)] gap-2"><select aria-label="Country calling code" className={`${inputCls} min-w-0`} value={form.country_code} onChange={(event) => setForm({ ...form, country_code: event.target.value })}>{phoneCodes.map(([iso, country, code]) => <option key={iso} value={iso}>{country} ({code})</option>)}</select><input aria-label="Phone number" required type="tel" inputMode="tel" autoComplete="tel-national" pattern="[0-9 ()-]{5,20}" title="Enter a valid phone number using digits, spaces, parentheses, or hyphens." className={`${inputCls} min-w-0`} {...bind("phone_number")} /></div></Field>
    <Field label="Existing reference number (optional)" error={errors.existing_reference}><input maxLength={60} className={inputCls} {...bind("existing_reference")} /></Field><Field label="Briefly describe your request" error={errors.message}><textarea required minLength={10} maxLength={2000} rows={5} className={inputCls} {...bind("message")} /></Field><div><label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-brand" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} /><span>I confirm these details are accurate and may be used to review my request and contact me.</span></label>{errors.consent && <p role="alert" className="mt-1 text-sm text-rose-600">{errors.consent[0]}</p>}</div><button disabled={busy} className={`${btn} w-full`}>{busy ? "Submitting…" : "Submit application"}</button></form></div>
    <aside className="h-fit rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-brand-dark">What happens next?</h2><ol className="mt-4 space-y-4 text-sm text-slate-600">{[["1", "Staff receive your application for review."], ["2", "Save the reference number shown after submission."], ["3", "Use Check status with your reference and email."], ["4", "Download a copy of the details for your records."]].map(([n, text]) => <li key={n} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-soft font-bold text-brand">{n}</span><span>{text}</span></li>)}</ol></aside></div></section>;
}
