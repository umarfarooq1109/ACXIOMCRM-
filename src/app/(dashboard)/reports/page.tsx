"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Download, FileSpreadsheet } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>("customers");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportType}`);
      const json = await res.json();
      if (res.ok) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  return (
    <AppShell>
      <PageHeader
        title="CRM Reports & Analytics"
        description="Executive sales summaries, conversion metrics, pipeline analytics, and audit reports."
        breadcrumbs={[{ label: "Reports" }]}
        action={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => alert("CSV Export feature triggered for active report.")}
          >
            Export Report CSV
          </Button>
        }
      />

      <Card>
        <CardBody className="p-4 space-y-4">
          {/* Report Selector Tabs */}
          <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-2">
            {[
              { id: "customers", label: "Customer Master Report" },
              { id: "leads", label: "Lead Conversion Report" },
              { id: "opportunities", label: "Opportunity Pipeline Report" },
              { id: "followups", label: "Follow-Up Agenda Report" },
              { id: "audit", label: "Security Audit Report" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  reportType === tab.id
                    ? "bg-[#0D9488] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <TableSkeleton rows={6} />
          ) : data.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No report data available for this criteria.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-3">Record Identifier</th>
                    <th className="p-3">Secondary Info</th>
                    <th className="p-3">Primary Metric</th>
                    <th className="p-3">Status / Category</th>
                    <th className="p-3">Assigned Owner / User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.map((row: any, i: number) => (
                    <tr key={row.id || i} className="hover:bg-slate-50/70">
                      <td className="p-3 font-semibold text-slate-900">
                        {row.customerName || row.leadName || row.opportunityName || row.subject || row.action}
                      </td>
                      <td className="p-3">
                        {row.companyName || row.customer?.companyName || row.entityName || "N/A"}
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {row.amount ? `₹${row.amount.toLocaleString("en-IN")}` : row.expectedValue ? `₹${row.expectedValue.toLocaleString("en-IN")}` : row.city || "—"}
                      </td>
                      <td className="p-3">
                        <Badge variant="teal">{row.status || row.stage || row.result || "Active"}</Badge>
                      </td>
                      <td className="p-3">
                        {row.owner?.name || row.assignedTo?.name || row.user?.name || "System"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </AppShell>
  );
}
