"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Plus, Search, Eye, LayoutGrid, ListFilter, DollarSign, Calendar } from "lucide-react";
import { OPPORTUNITY_STAGES } from "@/schemas/opportunity";

export default function OpportunitiesPage() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.append("search", search);
      if (stageFilter) params.append("stage", stageFilter);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setOpportunities(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, [stageFilter]);

  const handleStageChange = async (id: string, newStage: string) => {
    try {
      const res = await fetch(`/api/opportunities/${id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        fetchOpps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Opportunity & Pipeline Management"
        description="Track deal stages, revenue probability, and sales pipeline progression."
        breadcrumbs={[{ label: "Opportunities" }]}
        action={
          <div className="flex gap-2">
            <div className="bg-slate-100 p-0.5 rounded-lg flex border border-slate-200">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 ${
                  viewMode === "kanban" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Board
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 ${
                  viewMode === "list" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" /> List
              </button>
            </div>
            <Link href="/opportunities/new">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                New Opportunity
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="mb-4 flex gap-3 flex-col sm:flex-row justify-between items-center">
        <form onSubmit={(e) => { e.preventDefault(); fetchOpps(); }} className="flex gap-2 w-full sm:w-80">
          <Input
            placeholder="Search deal or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : viewMode === "kanban" ? (
        /* Kanban Pipeline Board */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {OPPORTUNITY_STAGES.map((stg) => {
            const stageOpps = opportunities.filter((o) => o.stage === stg);
            const totalStageValue = stageOpps.reduce((sum, o) => sum + o.amount, 0);

            return (
              <div key={stg} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col min-w-[220px]">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {stg}
                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] rounded-full">
                      {stageOpps.length}
                    </span>
                  </h4>
                  <span className="text-[11px] font-semibold text-[#0D9488]">
                    ₹{(totalStageValue / 100000).toFixed(1)}L
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px]">
                  {stageOpps.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-[#0D9488]/50 transition-all space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <Link href={`/opportunities/${opp.id}`}>
                          <h5 className="text-xs font-bold text-slate-900 hover:text-[#0D9488] leading-tight">
                            {opp.opportunityName}
                          </h5>
                        </Link>
                      </div>

                      <p className="text-[11px] text-slate-500">{opp.customer?.companyName}</p>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px]">
                        <span className="font-bold text-slate-800">
                          ₹{opp.amount.toLocaleString("en-IN")}
                        </span>
                        <Badge variant="teal">{opp.probability}% Prob</Badge>
                      </div>

                      {/* Move Stage Selector */}
                      <div className="pt-1">
                        <select
                          className="w-full text-[10px] py-1 px-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700"
                          value={opp.stage}
                          onChange={(e) => handleStageChange(opp.id, e.target.value)}
                        >
                          {OPPORTUNITY_STAGES.map((s) => (
                            <option key={s} value={s}>Move to {s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageOpps.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-400 italic">
                      No deals in {stg}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardBody className="p-4">
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-3">Deal Name</th>
                    <th className="p-3">Customer Company</th>
                    <th className="p-3">Amount (₹)</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3">Probability</th>
                    <th className="p-3">Expected Close</th>
                    <th className="p-3">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-semibold text-slate-900">{opp.opportunityName}</td>
                      <td className="p-3">{opp.customer?.companyName}</td>
                      <td className="p-3 font-bold text-slate-900">₹{opp.amount.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <Badge variant={opp.stage === "Won" ? "emerald" : opp.stage === "Lost" ? "rose" : "teal"}>
                          {opp.stage}
                        </Badge>
                      </td>
                      <td className="p-3">{opp.probability}%</td>
                      <td className="p-3">{new Date(opp.expectedCloseDate).toLocaleDateString("en-IN")}</td>
                      <td className="p-3">{opp.assignedTo?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </AppShell>
  );
}
