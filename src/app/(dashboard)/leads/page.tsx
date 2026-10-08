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
import { Plus, Search, Eye, Edit2, ArrowRightLeft, UserCheck } from "lucide-react";

export default function LeadsListPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const fetchLeads = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setLeads(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New": return <Badge variant="teal">New</Badge>;
      case "Contacted": return <Badge variant="sky">Contacted</Badge>;
      case "Qualified": return <Badge variant="violet">Qualified</Badge>;
      case "Converted": return <Badge variant="emerald">Converted</Badge>;
      case "Lost": return <Badge variant="rose">Lost</Badge>;
      default: return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Lead Management"
        description="Capture, qualify, assign, and convert prospective sales leads."
        breadcrumbs={[{ label: "Leads" }]}
        action={
          <Link href="/leads/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Lead
            </Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-80">
              <Input
                placeholder="Search lead code, name, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              <Button type="submit" variant="outline" size="md">
                Search
              </Button>
            </form>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={6} />
          ) : leads.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No lead records match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="p-3">Code</th>
                    <th className="p-3">Lead Name</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned Owner</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-medium text-slate-800">{l.leadCode}</td>
                      <td className="p-3 font-medium text-slate-900">{l.leadName}</td>
                      <td className="p-3">{l.companyName}</td>
                      <td className="p-3 text-slate-500">
                        <div>{l.email}</div>
                        <div className="text-[11px]">{l.phone}</div>
                      </td>
                      <td className="p-3">{l.source}</td>
                      <td className="p-3">{getStatusBadge(l.status)}</td>
                      <td className="p-3">{l.assignedTo?.name || "Unassigned"}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/leads/${l.id}`}>
                            <button className="p-1.5 text-slate-500 hover:text-[#0D9488] hover:bg-slate-100 rounded-md" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          {l.status !== "Converted" && (
                            <Link href={`/leads/${l.id}`}>
                              <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md" title="Convert to Customer">
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                            </Link>
                          )}
                        </div>
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
