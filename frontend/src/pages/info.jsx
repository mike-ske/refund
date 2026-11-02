import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { Field, Icon, SupportChannels, VerificationNotice, btn, inputCls } from "../ui";

const heroImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85";

function PageHero({ eyebrow, title, intro, image = heroImage }) {
  return <section className="relative isolate overflow-hidden bg-brand-dark text-white"><img src={image} alt="Modern public service buildings" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25" /><div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-brand-dark/35" /><div className="mx-auto max-w-6xl px-5 py-16 sm:py-20"><p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-200">{eyebrow}</p><h1 className="mt-4 max-w-3xl text-4xl font-extrabold sm:text-5xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{intro}</p></div></section>;
}

function Section({ title, children }) {
  return <section className="mx-auto max-w-4xl px-5 py-12"><h2 className="text-2xl font-extrabold text-brand-dark">{title}</h2><div className="mt-4 space-y-4 leading-relaxed text-slate-600">{children}</div></section>;
}

function ImageCards({ items }) {
  return <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.title} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"><img src={item.image} alt={item.alt} loading="lazy" className="h-48 w-full object-cover" /><div className="p-5"><h2 className="font-extrabold text-brand-dark">{item.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p></div></article>)}</section>;
}

export function About() {
  const commitments = [
    ["Transparency", "Make application steps, requirements and relevant program terms easier to understand."],
    ["Professional review", "Review submissions in line with the program requirements and eligibility criteria published by its operator."],
    ["Clear communication", "Provide relevant updates about review outcomes and any additional information requested."],
    ["Applicant support", "Offer guidance to help applicants understand each stage of the process."],
    ["Information security", "Handle information according to the organisation’s applicable privacy policy and safeguards."],
  ];
  const steps = [
    ["Application submission", "Applicants complete the online form with the personal and contact information it requests."],
    ["Application review", "Submissions are reviewed against the applicable program requirements and eligibility criteria."],
    ["Application updates", "Applicants can check relevant updates on the application status page and review any request for clarification or additional documentation."],
    ["Review outcome", "When a review is complete, applicants are notified of the outcome and any applicable next steps."],
  ];

  return <>
    <PageHero eyebrow="About the program" title="About the Allocation Refund Program" intro="A clear, organised and transparent application experience." image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85" />
    <Section title="Welcome">
      <p>Welcome to the Allocation Refund Program. This portal is designed to provide applicants with a structured, accessible and straightforward application experience.</p>
      <p>Its aim is to make the application process easier to understand, explain the information requested, and help applicants follow relevant updates throughout review. Eligibility and outcomes depend on the program requirements published by its operator; submitting an application does not guarantee approval or payment.</p>
    </Section>
    <Section title="Our Commitment to Applicants">
      <p>Clear communication and an organised application process help applicants understand what to expect. Submissions are reviewed according to the applicable program requirements and eligibility criteria.</p>
      <ul className="list-disc space-y-3 pl-6">{commitments.map(([title, body]) => <li key={title}><strong className="text-brand-dark">{title}:</strong> {body}</li>)}</ul>
    </Section>
    <section className="bg-soft/60 py-12"><div className="mx-auto max-w-5xl px-5"><h2 className="text-2xl font-extrabold text-brand-dark">Understanding the Application Process</h2><p className="mt-3 leading-relaxed text-slate-600">The process is organised to explain what applicants can expect at each stage.</p><ol className="mt-6 grid gap-5 sm:grid-cols-2">{steps.map(([title, body], index) => <li key={title} className="rounded-2xl border border-line bg-white p-6 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-full bg-soft font-bold text-brand">{index + 1}</span><h3 className="mt-4 font-bold text-brand-dark">{title}</h3><p className="mt-2 leading-relaxed text-slate-600">{body}</p></li>)}</ol></div></section>
    <Section title="Our Approach to Applicant Support">
      <p>Thank you for your interest in the program and for taking the time to submit an application.</p>
      <p>Applications are considered in accordance with the published program requirements. We aim to provide relevant updates and guidance so applicants can understand what to expect throughout the process.</p>
      <p>We appreciate your patience, cooperation and interest in the program.</p>
    </Section>
    <Section title="Your Information Matters">
      <p>Personal information submitted through this portal should be handled in accordance with the organisation’s applicable privacy policy. Review that policy and confirm the program operator before providing personal information.</p>
      <p>For your security, never share account passwords, banking PINs, card security codes or one-time authentication codes with anyone.</p>
    </Section>
    <section className="mx-auto max-w-4xl px-5 pb-12 text-center"><h2 className="text-2xl font-extrabold text-brand-dark">Get Started</h2><p className="mx-auto mt-3 max-w-2xl leading-relaxed text-slate-600">Review the information requested on the application page before deciding whether to submit an application.</p><p className="mt-4 font-semibold text-brand-dark">A well-organised process begins with clear information and effective communication.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/apply" className={`${btn} inline-flex`}>Apply Now</Link><Link to="/how-it-works" className="inline-flex items-center rounded-full border border-brand/25 bg-white px-6 py-3.5 font-semibold text-brand hover:bg-soft">Learn More</Link></div></section>
  </>;
}

export function HowItWorks() {
  const steps = [["Review the official rules", "Check eligibility, required information, review timelines, and any official program terms with the verified operator."], ["Complete the form", "Use an email address and phone number staff can use to contact you."], ["Submit a request", "Share accurate contact details and a short description. Only provide additional documents if the operator verifies they are required."], ["Follow the review", "Use your reference number and email to check status changes. Staff can ask for more information or explain a decision."], ["Receive the outcome", "The program operator will communicate the result and any next steps. A submitted request does not guarantee approval or payment."]];
  return <><PageHero eyebrow="Application guide" title="A clear path from request to review" intro="Learn what happens at each stage and what to expect after you submit a request." image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=85" /><ImageCards items={[{ title: "Prepare your details", text: "Use an email address that you can access and check regularly.", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80", alt: "Person checking application documents" }, { title: "Submit securely", text: "Complete the form and avoid sending information through unofficial channels.", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80", alt: "Team member assisting a customer" }, { title: "Follow up", text: "Use your reference number and email to follow status changes.", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80", alt: "Support staff speaking with a customer" }]} /><section className="mx-auto max-w-5xl px-5 py-8"><ol className="grid gap-5 sm:grid-cols-2">{steps.map(([title, body], index) => <li key={title} className="rounded-2xl border border-line bg-white p-6 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-full bg-soft font-bold text-brand">{index + 1}</span><h2 className="mt-4 text-lg font-bold text-brand-dark">{title}</h2><p className="mt-2 leading-relaxed text-slate-600">{body}</p></li>)}</ol><div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950"><b>Protect your account information.</b> We will never need your password, PIN, card security code, or one-time code to review an application.</div><Link to="/apply" className={`${btn} mt-8 inline-flex`}>Start an application</Link></section></>;
}

const questions = [
  ["Who is eligible to apply?", "Eligibility depends on the program requirements and criteria published by its operator. Review the guidelines to understand qualifications and any documentation required before applying."],
  ["Does submitting an application guarantee approval?", "No. Applications are reviewed against the applicable requirements. Applicants are notified of the outcome and relevant next steps when review is complete."],
  ["How long does application review take?", "Timelines can vary with application volume, the information provided and review requirements. Use your reference number to check for available updates."],
  ["Is there an application fee?", "Check the program’s published terms for any applicable fee. Before paying, verify the amount, purpose, recipient and payment instructions through an independently confirmed official channel."],
  ["What information do I need to provide?", "Complete the application form with accurate personal and contact information. Additional documentation may be requested where necessary for review."],
  ["How will I receive my application decision?", "Updates and outcomes are available through the application status page. The program may also contact you using the email address provided with your application."],
  ["How can I check my application status?", "Visit the application status page and enter your application reference number to view available information about your submission."],
  ["Can I update information after submitting my application?", "Contact customer support with your application reference number. Support can advise whether and how submitted information can be corrected."],
  ["What happens after my application is approved?", "If an application is approved, the program operator should provide information about any next steps under the published program terms."],
  ["How can I contact customer support?", "Use the contact channels on the Customer Service page for general enquiries and application-related questions."],
];

export function FAQs() {
  return <>
    <PageHero eyebrow="Applicant help" title="Frequently Asked Questions" intro="Everything you need to know about the Allocation Refund Program." image="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1800&q=85" />
    <Section title="Welcome"><p>Find information about the application process, eligibility requirements, reviews, status updates and support.</p><p>This guide answers common questions and explains what applicants can expect at each stage. The program operator’s published rules and terms govern eligibility and outcomes.</p></Section>
    <Section title="Understanding the Application Process"><div className="grid gap-5 sm:grid-cols-3">
      <article className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h3 className="font-bold text-brand-dark">Eligibility and requirements</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">Review applicable criteria before applying so you can provide the information requested.</p></article>
      <article className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h3 className="font-bold text-brand-dark">Application updates</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">Use your application reference number to view available status updates.</p></article>
      <article className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h3 className="font-bold text-brand-dark">Applicant support</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">Contact customer support for general enquiries and guidance about submitting an application.</p></article>
    </div></Section>
    <section className="mx-auto max-w-6xl px-5 pb-8"><div className="grid gap-5 md:grid-cols-3">
      <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85" alt="People reviewing documents at a desk" loading="lazy" className="h-56 w-full rounded-2xl object-cover" />
      <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85" alt="Colleagues discussing an application" loading="lazy" className="h-56 w-full rounded-2xl object-cover" />
      <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85" alt="Support team working together" loading="lazy" className="h-56 w-full rounded-2xl object-cover" />
    </div></section>
    <section className="mx-auto max-w-3xl space-y-3 px-5 py-8">{questions.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-line bg-white p-5"><summary className="cursor-pointer list-none font-bold text-brand-dark">{question}<span className="float-right text-brand">+</span></summary><p className="mt-4 leading-relaxed text-slate-600">{answer}</p></details>)}</section>
    <Section title="Need Additional Assistance?"><p>Customer support channels can help with general questions and guidance about the application process. Visit the Customer Service page to see available contact options.</p><p>Thank you for your interest. We aim to make the application information clear and straightforward.</p><Link to="/customer-service" className={`${btn} mt-2 inline-flex`}>Customer Service</Link></Section>
  </>;
}

export function CustomerService() {
  const { program } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", topic: "Application question", message: "" }), [errors, setErrors] = useState({}), [busy, setBusy] = useState(false), [feedback, setFeedback] = useState(null);
  const bind = (key) => ({ value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }) });
  const submit = async (event) => { event.preventDefault(); setBusy(true); setErrors({}); setFeedback(null); try { const result = await api("/contact", { method: "POST", body: form }); setFeedback(result.message); setForm({ name: "", email: "", topic: "Application question", message: "" }); } catch (error) { setErrors(error.errors || {}); setFeedback(Object.keys(error.errors || {}).length ? "Please check the highlighted fields." : error.message); } finally { setBusy(false); } };
  return <><PageHero eyebrow="Customer service" title="How can we help?" intro="Send a question to the customer service team or check the status of an application using its reference number." image="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85" /><section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[1.2fr_.8fr]"><form id="contact-form" onSubmit={submit} className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-soft text-brand"><Icon name="chat" /></span><div><h2 className="text-xl font-bold text-brand-dark">Contact customer service</h2><p className="text-sm text-muted">We’ll use your email to reply to your question.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Your name" error={errors.name}><input required maxLength={160} className={inputCls} {...bind("name")} /></Field><Field label="Email address" error={errors.email}><input type="email" required maxLength={180} className={inputCls} {...bind("email")} /></Field></div><Field label="What can we help with?" error={errors.topic}><select className={inputCls} {...bind("topic")}><option>Application question</option><option>Account support</option><option>Program information</option><option>Accessibility help</option><option>Other</option></select></Field><Field label="Message" error={errors.message} hint="Please do not include passwords, PINs, or one-time security codes."><textarea required minLength={10} maxLength={3000} rows={5} className={inputCls} {...bind("message")} /></Field>{feedback && <p role="status" className={`rounded-xl p-3 text-sm ${feedback === "Your message has been received." ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{feedback}</p>}<button disabled={busy} className={`${btn} mt-2 w-full`}>{busy ? "Sending…" : "Send your message"}</button></form><div className="space-y-6"><article className="rounded-3xl border border-line bg-white p-6 shadow-sm"><span className="grid h-12 w-12 place-items-center rounded-full bg-soft text-brand"><Icon name="mail" /></span><h2 className="mt-4 text-xl font-bold text-brand-dark">Verified contact details</h2>{(program.email || program.phone) && <p className="mt-2 leading-relaxed text-slate-600">Use the published contact information to reach the program operator.</p>}{program.email && <a className="mt-4 block break-all font-semibold text-brand" href={`mailto:${program.email}`}>{program.email}</a>}{program.phone && <a className="mt-2 block font-semibold text-brand" href={`tel:${program.phone}`}>{program.phone}</a>}{program.hours && <p className="mt-3 text-sm text-muted">{program.hours}</p>}<h3 className="mt-5 font-bold text-brand-dark">Message us</h3><div className="mt-2"><SupportChannels program={program} /></div></article><article className="rounded-3xl bg-brand-dark p-6 text-white"><h2 className="text-xl font-bold">Application already submitted?</h2><p className="mt-2 leading-relaxed text-white/75">Check your application status with your reference number and email.</p><Link to="/status" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-brand-dark">Check application status</Link></article><VerificationNotice /><p className="rounded-xl bg-amber-50 p-5 text-sm leading-relaxed text-amber-950"><b>Protect your information.</b> Do not share account passwords, PINs, card details, or one-time security codes. Avoid sending identity documents through an unverified channel.</p></div></section></>;
}

export function Privacy() {
  return <><PageHero eyebrow="Privacy information" title="Your information and this portal" intro="A clear privacy notice must come from the organization that operates this program. Verify it before submitting personal information." image="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85" /><ImageCards items={[{ title: "What the form collects", text: "Only enter details requested in the application or contact form.", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80", alt: "Person reviewing a form" }, { title: "Who reviews a request", text: "Program staff use submitted details to assess requests and respond.", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80", alt: "Support team meeting" }, { title: "How to get help", text: "Contact the verified operator for official retention and access information.", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=80", alt: "Customer service team" }]} /><Section title="Before submitting an application"><p>The application portal collects the information shown on its application form so program staff can review a request and contact the applicant. The operator must explain its lawful basis, retention period, data access process, and privacy contact in a verified privacy notice.</p><p>This page is general information and is not a substitute for the operator's official privacy notice. Do not submit sensitive documents until you have confirmed who operates the program and how your information will be handled.</p></Section><Section title="Questions about your information"><p>Use the verified contact details published by the program operator. If those details are not available, wait until you can confirm the operator before sending identity or financial information.</p></Section></>;
}

export function Terms() {
  const terms = [
    ["Purpose of the application portal", "The portal provides a way to view program information, submit application details and check available updates. It is intended to make the process organised and accessible."],
    ["Application requirements", "Applicants are responsible for providing complete, accurate and current information. Check submissions before sending. Additional information or supporting documents may be requested where needed for review."],
    ["Application review and eligibility", "Applications are reviewed according to the applicable requirements and eligibility criteria. Submission does not establish eligibility or guarantee approval or payment. Applicants should be notified of the review outcome and relevant next steps."],
    ["Processing and updates", "Processing times may vary with application volume, verification requirements and individual submissions. Use your application reference number to access available updates. Staff may contact you through the details provided if more information is needed."],
    ["Fees and payment information", "Any applicable application, administrative or processing fees should be clearly described in official published terms. Before paying, confirm the purpose, amount, recipient and authorised payment instructions through a verified channel. Keep transaction records."],
    ["Applicant responsibilities", "Provide accurate information and genuine supporting documents when requested, keep contact details current, protect your reference number and account credentials, respond to reasonable requests, and use the portal responsibly."],
    ["Privacy and information protection", "Information submitted through the portal is intended to support application administration, communication and review. Its handling should follow the organisation’s applicable Privacy Policy and relevant data protection requirements. Review the Privacy Policy for details."],
    ["Communication and customer support", "Use the contact details published on the Customer Service page for assistance. Updates may be provided through the status portal and, where applicable, the email address supplied with the application."],
    ["Changes to these terms", "Terms may be updated to reflect changes in procedures, administrative requirements or applicable guidelines. Revised terms and the updated date will be published on this page; applicants should review it periodically."],
    ["Acceptance of terms", "By using the portal and submitting an application, you acknowledge that you have reviewed these terms and agree to follow the applicable application procedures."],
    ["Contact information", "For questions about these terms or the application process, contact support through the Customer Service page. Confirm the program operator and official contact channels before sharing sensitive information or making a payment."],
  ];
  return <>
    <PageHero eyebrow="Program information" title="Terms and Conditions" intro="Last updated: November 2026. Please review these terms before using the application portal." image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=85" />
    <Section title="Welcome"><p>These terms describe general guidelines for accessing this portal, submitting application information and checking updates. By using the portal, you acknowledge that you have read and understood them.</p><p>Confirm the program operator and review the official program requirements and privacy policy before submitting personal information.</p></Section>
    <section className="mx-auto max-w-6xl px-5 pb-8"><div className="grid gap-5 md:grid-cols-3">
      <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85" alt="Reviewing program documents" loading="lazy" className="h-56 w-full rounded-2xl object-cover" />
      <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85" alt="Team discussing application procedures" loading="lazy" className="h-56 w-full rounded-2xl object-cover" />
      <img src="https://images.unsplash.com/photo-1556740772-1a741367b93e?auto=format&fit=crop&w=1000&q=85" alt="Secure online information entry" loading="lazy" className="h-56 w-full rounded-2xl object-cover" />
    </div></section>
    <div className="mx-auto max-w-4xl space-y-3 px-5 pb-12">{terms.map(([title, body], index) => <details key={title} open className="rounded-2xl border border-line bg-white p-5 shadow-sm"><summary className="cursor-pointer list-none font-bold text-brand-dark">{index + 1}. {title}<span className="float-right text-brand">−</span></summary><p className="mt-3 leading-relaxed text-slate-600">{body}</p></details>)}<p className="pt-4 text-center text-sm text-muted">© {new Date().getFullYear()} Allocation Refund Program. All rights reserved.</p></div>
  </>;
}
