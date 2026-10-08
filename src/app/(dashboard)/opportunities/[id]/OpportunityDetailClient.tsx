"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { OPPORTUNITY_STAGES } from "@/schemas/opportunity";

export function OpportunityDetailClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [opp, setOpp] = useState<any>(null);

  const fetchOpp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${id}`);
      const data = await res.json();
      if (res.ok) setOpp(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOpp();
  }, [id]);

  const handleStageUpdate = async (newStage: string) => {
    try {
      const res = await fetch(`/api/opportunities/${id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) fetchOpp();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !opp) {
    return (
      <AppShell>
        <CardSkeleton />
      </AppShell>
    );
  }

  const weightedValue = (opp.amount * opp.probability) / 100;

  return (
    <AppShell>
      <PageHeader
        title={opp.opportunityName}
        description={`Deal for ${opp.customer?.companyName}`}
        breadcrumbs={[{ label: "Opportunities", href: "/opportunities" }, { label: opp.opportunityName }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Deal Overview</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Customer Account</p>
                <p className="text-slate-900 font-semibold mt-0.5">{opp.customer?.companyName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Deal Amount</p>
                <p className="text-slate-900 font-bold text-sm mt-0.5">₹{opp.amount.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Stage</p>
                <p className="mt-0.5">
                  <Badge variant={opp.stage === "Won" ? "emerald" : opp.stage === "Lost" ? "rose" : "teal"}>
                    {opp.stage}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Probability / Weighted Value</p>
                <p className="text-slate-900 font-semibold mt-0.5">
                  {opp.probability}% (₹{weightedValue.toLocaleString("en-IN")})
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Expected Close Date</p>
                <p className="text-slate-900 mt-0.5">{new Date(opp.expectedCloseDate).toLocaleDateString("en-IN")}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Assigned Executive</p>
                <p className="text-slate-900 mt-0.5">{opp.assignedTo?.name}</p>
              </div>
            </div>

            {opp.notes && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700">Deal Notes</p>
                <p className="text-xs text-slate-600 mt-1">{opp.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Pipeline Stage Transition Control */}
        <Card>
          <CardHeader>
            <CardTitle>Stage Progression</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {OPPORTUNITY_STAGES.map((stg) => (
              <button
                key={stg}
                onClick={() => handleStageUpdate(stg)}
                className={`w-full p-2.5 rounded-lg text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                  opp.stage === stg
                    ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488]"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{stg}</span>
                {opp.stage === stg && <span className="text-[10px] font-bold">CURRENT</span>}
              </button>
            ))}
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
