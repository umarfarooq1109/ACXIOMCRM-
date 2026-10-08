"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LEAD_SOURCES, LEAD_PRIORITIES } from "@/schemas/lead";

export default function NewLeadPage() {
  const router = useRouter();

  const [leadName, setLeadName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("Website");
  const [priority, setPriority] = useState("Medium");
  const [expectedValue, setExpectedValue] = useState("0");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadName,
          companyName,
          email,
          phone,
          source,
          priority,
          expectedValue: parseFloat(expectedValue) || 0,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create lead.");
        setIsLoading(false);
        return;
      }

      router.push("/leads");
    } catch (err) {
      setError("Network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Create New Lead"
        description="Register an incoming prospect into the qualification pipeline."
        breadcrumbs={[{ label: "Leads", href: "/leads" }, { label: "New Lead" }]}
      />

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Lead Prospect Information</CardTitle>
          </CardHeader>
          <CardBody>
            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Lead Name"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                />

                <Input
                  label="Company Name"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechCorp Solutions"
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vikram@techcorp.in"
                />

                <Input
                  label="Mobile Phone (10 digits)"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  helperText="10-digit Indian mobile format (+91)"
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Lead Source</label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    {LEAD_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Expected Deal Value (₹)"
                  type="number"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  placeholder="500000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Notes & Initial Inquiry</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Details about client requirements..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => router.push("/leads")}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  Save Lead
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
