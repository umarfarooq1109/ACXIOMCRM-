"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KpiCard } from "@/components/ui/KpiCard";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DateRangePicker, DatePreset } from "@/components/ui/DateRangePicker";
import { Tabs } from "@/components/ui/Tabs";
import { FormLayout } from "@/components/forms/FormLayout";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Users, TrendingUp, Shield, AlertTriangle, Plus, Search } from "lucide-react";
import { formatINR, formatCompactINR, formatPhone, formatRelativeTime } from "@/lib/format";

export default function DesignSystemPage() {
  const [role, setRole] = useState<"Admin" | "Manager" | "SalesExecutive">("Admin");
  const [activeTab, setActiveTab] = useState("overview");
  const [datePreset, setDatePreset] = useState<DatePreset>("this_month");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const toast = useToast();

  const sampleData = [
    {
      code: "CUS-000101",
      name: "Bengaluru Tech Solutions",
      city: "Bengaluru",
      status: "Active",
      amount: 1250000,
    },
    {
      code: "LED-000204",
      name: "Hyderabad Systems Pvt Ltd",
      city: "Hyderabad",
      status: "Qualified",
      amount: 450000,
    },
    {
      code: "OPP-000309",
      name: "Chennai Commerce Enterprise",
      city: "Chennai",
      status: "Won",
      amount: 3200000,
    },
  ];

  const columns = [
    { accessorKey: "code", header: "Code" },
    { accessorKey: "name", header: "Company Name" },
    { accessorKey: "city", header: "City" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "amount",
      header: "Value",
      cell: ({ row }: any) => formatINR(row.original.amount),
    },
  ];

  return (
    <AppShell user={{ name: `${role} User`, email: `${role.toLowerCase()}@acxiomcrm.com`, role }}>
      <PageHeader
        title="Acxiom CRM Design System Tokens & Components"
        description="Comprehensive reference for pure white (#FFFFFF) theme, Teal (#0D9488) primary, and shared UI primitives."
        breadcrumbs={[{ label: "Administration", href: "#" }, { label: "Design System" }]}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Role Preview:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#0D9488]"
            >
              <option value="Admin">Admin (All menus)</option>
              <option value="Manager">Manager (Team view)</option>
              <option value="SalesExecutive">SalesExecutive (Own data)</option>
            </select>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: "overview", label: "Colors & Tokens" },
          { id: "components", label: "UI Components" },
          { id: "tables", label: "Data Grids & Filters" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette & Strict Tokens</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="w-full h-12 bg-[#0D9488] rounded-lg mb-2 flex items-center justify-center text-white font-bold text-xs">
                  #0D9488
                </div>
                <p className="text-xs font-semibold text-slate-800">Primary Teal</p>
                <p className="text-[11px] text-slate-500">Main buttons, active indicators, focus rings</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1]">
                <div className="w-full h-12 bg-[#CCFBF1] rounded-lg mb-2 flex items-center justify-center text-[#0D9488] font-bold text-xs">
                  #CCFBF1 / #F0FDFA
                </div>
                <p className="text-xs font-semibold text-slate-800">Primary Light Tint</p>
                <p className="text-[11px] text-slate-500">Active nav items, selection backgrounds</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="w-full h-12 bg-[#FFFFFF] border border-slate-300 rounded-lg mb-2 flex items-center justify-center text-slate-700 font-bold text-xs">
                  #FFFFFF Pure White
                </div>
                <p className="text-xs font-semibold text-slate-800">Pure White Background</p>
                <p className="text-[11px] text-slate-500">Enforced strictly across all pages & sidebars</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Badge Mapping Matrix</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-wrap gap-3">
              <StatusBadge status="Won" />
              <StatusBadge status="Active" />
              <StatusBadge status="Completed" />
              <StatusBadge status="Lost" />
              <StatusBadge status="Missed" />
              <StatusBadge status="Negotiation" />
              <StatusBadge status="Planned" />
              <StatusBadge status="Qualification" />
              <StatusBadge status="Prospect" />
              <StatusBadge status="Proposal" />
              <StatusBadge status="Admin" />
              <StatusBadge status="SalesExecutive" />
              <StatusBadge status="Cancelled" />
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === "components" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              title="Total Pipeline Value"
              value={formatINR(4650000)}
              icon={TrendingUp}
              iconColor="teal"
              delta={{ value: "+14.2% vs last mo", isPositive: true }}
            />
            <KpiCard
              title="Active Customers"
              value="128"
              icon={Users}
              iconColor="sky"
              sublabel="Across 4 metros"
            />
            <KpiCard
              title="Compact INR Formatter"
              value={formatCompactINR(3200000)}
              icon={Shield}
              iconColor="violet"
              sublabel="INR format test"
            />
          </div>

          <FormLayout
            title="Sample Shared Form Layout"
            description="Two-column responsive grid with inline error handling and sticky footer."
            onSave={() => toast.success("Form Saved", "Sample validation successful.")}
            onCancel={() => toast.info("Action Cancelled")}
          >
            <Input label="Customer Name" defaultValue="Bengaluru Tech Solutions" required />
            <Input label="Phone Number" defaultValue={formatPhone("9876543210")} required />
            <Input label="Email Address" defaultValue="contact@bengalurutech.in" required />
            <Input label="Expected Value" defaultValue={formatINR(1250000)} />
          </FormLayout>

          <div className="flex gap-3">
            <Button variant="primary" onClick={() => setIsConfirmOpen(true)}>
              Test Confirmation Dialog
            </Button>
            <Button variant="outline" onClick={() => toast.warning("Warning Toast", "Low pipeline balance.")}>
              Test Warning Toast
            </Button>
          </div>

          <ConfirmDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => {
              setIsConfirmOpen(false);
              toast.error("Record Deactivated", "Customer code CUS-000101 marked inactive.");
            }}
            title="Deactivate Customer Record"
            message="Are you sure you want to deactivate Bengaluru Tech Solutions? This action will write an append-only audit entry."
          />
        </div>
      )}

      {activeTab === "tables" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <DateRangePicker value={datePreset} onChange={setDatePreset} />
            <span className="text-xs text-slate-500">Preset: {datePreset}</span>
          </div>

          <DataTable columns={columns} data={sampleData} page={1} pageSize={10} totalCount={3} />

          <EmptyState
            title="No Pending Follow-ups"
            description="You have cleared all assigned tasks and calls for today."
            actionLabel="Schedule Follow-up"
            onAction={() => toast.info("Modal trigger")}
          />

          <ErrorState onRetry={() => toast.success("Refreshed", "Data updated from server.")} />
        </div>
      )}
    </AppShell>
  );
}
