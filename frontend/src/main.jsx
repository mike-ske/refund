import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { Providers } from "./auth";
import { AdminLayout, Layout, Require } from "./ui";
import { Home, Status } from "./pages/public";
import { Apply } from "./pages/user";
import { AdminApplications, AdminContacts, AdminDetail, AdminList, AdminLogin, AdminPortalPage, AdminUsers } from "./pages/admin";
import { About, CustomerService, FAQs, HowItWorks, Privacy, Terms } from "./pages/info";

createRoot(document.getElementById("root")).render(
  <BrowserRouter><Providers><Routes><Route element={<Layout />}>
    <Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/how-it-works" element={<HowItWorks />} /><Route path="/faqs" element={<FAQs />} /><Route path="/customer-service" element={<CustomerService />} /><Route path="/privacy" element={<Privacy />} /><Route path="/terms" element={<Terms />} /><Route path="/status" element={<Status />} />
    <Route path="/apply" element={<Apply />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route element={<Require role="admin"><AdminLayout /></Require>}>
      <Route path="/admin" element={<AdminList />} />
      <Route path="/admin/applications" element={<AdminApplications />} />
      <Route path="/admin/applications/:id" element={<AdminDetail />} />
      <Route path="/admin/contacts" element={<AdminContacts />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/payouts" element={<AdminPortalPage />} />
      <Route path="/admin/emails" element={<AdminPortalPage />} />
      <Route path="/admin/reports" element={<AdminPortalPage />} />
      <Route path="/admin/settings" element={<AdminPortalPage />} />
    </Route>
    <Route path="*" element={<div className="p-20 text-center"><h1 className="text-3xl font-extrabold text-brand-dark">Page not found</h1></div>} />
  </Route></Routes></Providers></BrowserRouter>
);
