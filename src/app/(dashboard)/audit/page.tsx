"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ShieldAlert, Search, Eye } from "lucide-react";

export default function AuditPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.append("search", search);
      if (actionFilter) params.append("action", actionFilter);

      const res = await fetch(`/api/audit?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setLogs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [actionFilter]);

  return (
    <AppShell>
      <PageHeader
        title="Security & System Audit Log"
        description="Immutable audit trail of authentication events, authorization checks, and data modifications."
        breadcrumbs={[{ label: "Audit Logs" }]}
      />

      <Card>
        <CardBody className="p-4 space-y-4">
          <div className="flex gap-3 flex-col sm:flex-row justify-between items-center">
            <form onSubmit={(e) => { e.preventDefault(); fetchAudit(); }} className="flex gap-2 w-full sm:w-80">
              <Input
                placeholder="Search audit action, entity, user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </form>

            <select
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 w-full sm:w-auto"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">All Action Types</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
              <option value="LOGIN_FAILURE">LOGIN_FAILURE</option>
              <option value="CUSTOMER_CREATE">CUSTOMER_CREATE</option>
              <option value="LEAD_CONVERT">LEAD_CONVERT</option>
              <option value="OPPORTUNITY_CREATE">OPPORTUNITY_CREATE</option>
              <option value="ROLE_CHANGE">ROLE_CHANGE</option>
            </select>
          </div>

          {loading ? (
            <TableSkeleton rows={6} />
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No audit records match the selected query.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Entity Name</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70">
                      <td className="p-3 text-slate-500 font-sans">
                        {new Date(l.createdDate).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-sans font-medium text-slate-900">
                        {l.user?.name || "Anonymous / System"}
                      </td>
                      <td className="p-3 font-semibold text-[#0D9488]">{l.action}</td>
                      <td className="p-3">{l.entityName}</td>
                      <td className="p-3 font-sans">
                        <Badge variant={l.result === "Success" ? "emerald" : "rose"}>
                          {l.result}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-500">{l.ipAddress || "127.0.0.1"}</td>
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
