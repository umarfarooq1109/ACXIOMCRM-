"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormLayout } from "@/components/forms/FormLayout";
import { Input } from "@/components/ui/Input";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { INDIAN_STATES } from "@/schemas/customer";
import { AlertCircle } from "lucide-react";

export function EditCustomerClient({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [status, setStatus] = useState<"Active" | "Prospect" | "Inactive">("Active");
  const [notes, setNotes] = useState("");
  const [customerCode, setCustomerCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        const res = await fetch(`/api/customers/${id}`);
        const data = await res.json();
        if (res.ok && data.data) {
          const c = data.data;
          setCustomerName(c.customerName);
          setCompanyName(c.companyName);
          setEmail(c.email);
          setPhone(c.phone);
          setAddress(c.address || "");
          setCity(c.city);
          setState(c.state);
          setStatus(c.status);
          setNotes(c.notes || "");
          setCustomerCode(c.customerCode);
        } else {
          toast.error("Error", "Could not load customer data.");
          router.push("/customers");
        }
      } catch {
        toast.error("Network Error", "Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadCustomer();
    }
  }, [id, router, toast]);

  const handleSubmit = async () => {
    setErrorMsg("");
    setIsLoading(true);

    try {
      const payload = {
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

      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to update customer.");
        setIsLoading(false);
        return;
      }

      toast.success("Customer Updated", "Customer record updated successfully.");
      router.push(`/customers/${id}`);
    } catch {
      setErrorMsg("An unexpected network error occurred.");
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <CardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={`Edit Customer: ${customerCode}`}
        description={`Update contact information and details for ${customerName}.`}
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: customerCode, href: `/customers/${id}` }, { label: "Edit" }]}
      />

      <div className="max-w-4xl space-y-4">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <FormLayout
          title="Update Account Details"
          description="Modify contact info, company details, or state assignment."
          onSave={handleSubmit}
          onCancel={() => router.back()}
          isLoading={isLoading}
          saveText="Save Changes"
        >
          <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Primary Contact Information
          </div>

          <Input
            label="Customer Contact Name"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <Input
            label="Corporate Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Mobile Phone (10 digits)"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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

          <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mt-4">
            2. Company & Address
          </div>

          <Input
            label="Company Name"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <Input
            label="City"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
          />

          <div className="col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mt-4">
            3. Account Notes
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Account Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0D9488]"
            />
          </div>
        </FormLayout>
      </div>
    </AppShell>
  );
}
