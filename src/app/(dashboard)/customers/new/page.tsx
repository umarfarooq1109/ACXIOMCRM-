"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormLayout } from "@/components/forms/FormLayout";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { INDIAN_STATES } from "@/schemas/customer";
import { AlertCircle, ExternalLink } from "lucide-react";

export default function NewCustomerPage() {
  const router = useRouter();
  const toast = useToast();

  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [status, setStatus] = useState<"Active" | "Prospect" | "Inactive">("Active");
  const [notes, setNotes] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [existingConflict, setExistingConflict] = useState<any>(null);

  const handleSubmit = async () => {
    setErrorMsg("");
    setExistingConflict(null);
    setIsLoading(true);

    try {
      const payload: any = {
        customerName,
        companyName,
        email,
        phone,
        address,
        city,
        state,
        status,
        notes,
      };

      // If ownerId provided, pass it (otherwise server defaults to current session user for SalesExec)
      if (ownerId) payload.ownerId = ownerId;

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingCustomer) {
          setExistingConflict(data.existingCustomer);
        }
        setErrorMsg(data.message || "Failed to create customer.");
        setIsLoading(false);
        return;
      }

      toast.success("Customer Created", `Record ${data.data.customerCode} created successfully.`);
      router.push(`/customers/${data.data.id}`);
    } catch (err) {
      setErrorMsg("An unexpected network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Add New Customer"
        description="Register a new commercial account record in your CRM directory."
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: "New Customer" }]}
      />

      <div className="max-w-4xl space-y-4">
        {existingConflict && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-900">Duplicate Record Detected</strong>
                <span>
                  A customer matching these details already exists: <strong>{existingConflict.customerName}</strong> ({existingConflict.companyName}) — Code: <strong>{existingConflict.customerCode}</strong>.
                </span>
              </div>
            </div>
            <Link
              href={`/customers/${existingConflict.id}`}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 flex items-center gap-1 shrink-0"
            >
              <span>View Customer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {errorMsg && !existingConflict && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <FormLayout
          title="Customer Details"
          description="Provide official contact details and enterprise information."
          onSave={handleSubmit}
          onCancel={() => router.back()}
          isLoading={isLoading}
          saveText="Save Customer"
        >
          {/* Section 1: Primary Contact */}
          <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Primary Contact Information
          </div>

          <Input
            label="Customer Contact Name"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
          />

          <Input
            label="Corporate Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rajesh@company.com"
          />

          <Input
            label="Mobile Phone (10 digits)"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            helperText="Indian 10-digit mobile number (+91 hint)"
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0D9488]"
            >
              <option value="Active">Active</option>
              <option value="Prospect">Prospect</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Section 2: Company & Address */}
          <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mt-4">
            2. Company & Geographical Address
          </div>

          <Input
            label="Company Name"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Infosys Technologies Ltd"
          />

          <Input
            label="City"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Hyderabad"
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0D9488]"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Street Address / Office Park"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. HITEC City, Phase 2"
          />

          {/* Section 3: Notes */}
          <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mt-4">
            3. Account Notes & Remarks
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Account Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Important business requirements, GSTIN details, or key decision maker remarks..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0D9488]"
            />
          </div>
        </FormLayout>
      </div>
    </AppShell>
  );
}
