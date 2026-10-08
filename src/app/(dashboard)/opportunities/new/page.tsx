"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OPPORTUNITY_STAGES } from "@/schemas/opportunity";

export default function NewOpportunityPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [opportunityName, setOpportunityName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("500000");
  const [stage, setStage] = useState("Qualification");
  const [probability, setProbability] = useState("20");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");

  useEffect(() => {
    setExpectedCloseDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );
  }, []);
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/customers?limit=100")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setCustomers(json.data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityName,
          customerId,
          amount: parseFloat(amount) || 0,
          stage,
          probability: parseInt(probability, 10) || 0,
          expectedCloseDate,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create opportunity.");
        setIsLoading(false);
        return;
      }

      router.push("/opportunities");
    } catch (err) {
      setError("Network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Create Opportunity"
        description="Register a high-value sales deal into your active pipeline."
        breadcrumbs={[{ label: "Opportunities", href: "/opportunities" }, { label: "New Opportunity" }]}
      />

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Deal Details & Revenue Forecasting</CardTitle>
          </CardHeader>
          <CardBody>
            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Opportunity Name"
                  required
                  value={opportunityName}
                  onChange={(e) => setOpportunityName(e.target.value)}
                  placeholder="e.g. Enterprise CRM License Deal"
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Customer Account *</label>
                  <select
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  >
                    <option value="">Select Customer Account...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.customerName})
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Deal Amount (₹) *"
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  helperText="Must be greater than 0."
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Pipeline Stage</label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                    value={stage}
                    onChange={(e) => {
                      const st = e.target.value;
                      setStage(st);
                      if (st === "Qualification") setProbability("20");
                      else if (st === "Proposal") setProbability("50");
                      else if (st === "Negotiation") setProbability("80");
                      else if (st === "Won") setProbability("100");
                      else if (st === "Lost") setProbability("0");
                    }}
                  >
                    {OPPORTUNITY_STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Close Probability (0-100%) *"
                  type="number"
                  required
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  helperText="Required range: 0 to 100."
                />

                <Input
                  label="Expected Close Date *"
                  type="date"
                  required
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  helperText="Cannot be set in the past."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deal Notes & Value Proposition</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key deal decision-makers, competition, timeline..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => router.push("/opportunities")}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  Save Opportunity
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
