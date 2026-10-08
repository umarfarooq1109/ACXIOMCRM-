"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ArrowRightLeft, CheckCircle2 } from "lucide-react";

export function LeadDetailClient({ id }: { id: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<any>(null);

  // Conversion Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [city, setCity] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [address, setAddress] = useState("");
  const [createOpp, setCreateOpp] = useState(true);
  const [oppAmount, setOppAmount] = useState("500000");
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState("");

  const fetchLead = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      if (res.ok) {
        setLead(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLead();
  }, [id]);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setConvertError("");
    setConvertLoading(true);

    try {
      const res = await fetch(`/api/leads/${id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          state,
          address,
          createOpportunity: createOpp,
          amount: parseFloat(oppAmount) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setConvertError(data.message || "Failed to convert lead.");
        setConvertLoading(false);
        return;
      }

      setShowConvertModal(false);
      router.push(`/customers/${data.data.customer.id}`);
    } catch (err) {
      setConvertError("Error converting lead.");
      setConvertLoading(false);
    }
  };

  if (loading || !lead) {
    return (
      <AppShell>
        <CardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={`${lead.leadName} (${lead.leadCode})`}
        description={`Prospect at ${lead.companyName}`}
        breadcrumbs={[{ label: "Leads", href: "/leads" }, { label: lead.leadCode }]}
        action={
          lead.status !== "Converted" ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ArrowRightLeft className="w-4 h-4" />}
              onClick={() => setShowConvertModal(true)}
            >
              Convert to Customer
            </Button>
          ) : (
            <Badge variant="emerald" dot>
              Converted to Customer
            </Badge>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Lead Code</p>
                <p className="text-slate-900 font-semibold font-mono mt-0.5">{lead.leadCode}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Status</p>
                <p className="mt-0.5">
                  <Badge variant={lead.status === "Converted" ? "emerald" : "teal"}>{lead.status}</Badge>
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Company Name</p>
                <p className="text-slate-900 font-semibold mt-0.5">{lead.companyName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Lead Source</p>
                <p className="text-slate-900 mt-0.5">{lead.source}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Email</p>
                <p className="text-slate-900 mt-0.5">{lead.email}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Phone</p>
                <p className="text-slate-900 mt-0.5">{lead.phone}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Expected Value</p>
                <p className="text-slate-900 font-bold mt-0.5">₹{lead.expectedValue.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Assigned Executive</p>
                <p className="text-slate-900 mt-0.5">{lead.assignedTo?.name || "Unassigned"}</p>
              </div>
            </div>

            {lead.notes && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700">Notes & Inquiry</p>
                <p className="text-xs text-slate-600 mt-1">{lead.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Action Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Workflow</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-xs text-slate-600">
              <p>
                Converting this lead creates a new active **Customer Account** and an optional **Sales Opportunity**.
              </p>
              {lead.status === "Converted" ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1.5" />
                  Lead converted to customer:{" "}
                  <a href={`/customers/${lead.customer?.id}`} className="font-semibold underline">
                    {lead.customer?.customerCode}
                  </a>
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowConvertModal(true)}
                >
                  Convert Lead Now
                </Button>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Convert Lead Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800">Convert Lead to Customer</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create customer master data for <span className="font-semibold text-slate-800">{lead.companyName}</span>.
            </p>

            {convertError && (
              <div className="p-2.5 my-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {convertError}
              </div>
            )}

            <form onSubmit={handleConvert} className="space-y-3 mt-4">
              <Input label="City" required value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="State" required value={state} onChange={(e) => setState(e.target.value)} />
              <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Building / Street address" />

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={createOpp}
                    onChange={(e) => setCreateOpp(e.target.checked)}
                    className="rounded text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  Create Opportunity for this deal
                </label>
              </div>

              {createOpp && (
                <Input
                  label="Initial Opportunity Amount (₹)"
                  type="number"
                  value={oppAmount}
                  onChange={(e) => setOppAmount(e.target.value)}
                />
              )}

              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => setShowConvertModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={convertLoading}>
                  Confirm Conversion
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
