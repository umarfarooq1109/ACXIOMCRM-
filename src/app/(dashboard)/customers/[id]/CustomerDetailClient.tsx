"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatINR, formatDate, formatPhone, formatRelativeTime } from "@/lib/format";
import {
  Building2,
  MapPin,
  Edit,
  Power,
  RefreshCw,
  Clock,
  TrendingUp,
  Briefcase,
  CalendarCheck,
  Activity,
  History as HistoryIcon,
} from "lucide-react";

export function CustomerDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomerDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();

      if (res.ok) {
        setCustomer(data.data);
      } else {
        toast.error("Not Found", data.message || "Customer record not found.");
        router.push("/customers");
      }
    } catch {
      toast.error("Network Error", "Unable to load customer details.");
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  const fetchAuditHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers/${id}/history`);
      const data = await res.json();
      if (res.ok) {
        setAuditHistory(data.data || []);
      }
    } catch {
      // Audit history failure is non-blocking
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
      fetchAuditHistory();
    }
  }, [id, fetchCustomerDetails, fetchAuditHistory]);

  const handleDeactivate = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deactivated", "Customer account status updated to Inactive.");
        fetchCustomerDetails();
        fetchAuditHistory();
      } else {
        toast.error("Failed", "Could not deactivate customer.");
      }
    } catch {
      toast.error("Network Error", "Failed to deactivate customer.");
    } finally {
      setIsSubmitting(false);
      setIsDeactivating(false);
    }
  };

  const handleReactivate = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${id}/reactivate`, { method: "POST" });
      if (res.ok) {
        toast.success("Reactivated", "Customer account status updated to Active.");
        fetchCustomerDetails();
        fetchAuditHistory();
      } else {
        toast.error("Failed", "Could not reactivate customer.");
      }
    } catch {
      toast.error("Network Error", "Failed to reactivate customer.");
    } finally {
      setIsSubmitting(false);
      setIsReactivating(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <CardSkeleton />
      </AppShell>
    );
  }

  if (!customer) return null;

  const totalPipelineValue = (customer.opportunities || []).reduce(
    (acc: number, item: any) => acc + (item.amount || 0),
    0
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: <Building2 className="w-4 h-4" /> },
    { id: "leads", label: `Leads (${customer.leads?.length || 0})`, icon: <Briefcase className="w-4 h-4" /> },
    { id: "opportunities", label: `Opportunities (${customer.opportunities?.length || 0})`, icon: <TrendingUp className="w-4 h-4" /> },
    { id: "followups", label: `Follow-ups (${customer.followUps?.length || 0})`, icon: <CalendarCheck className="w-4 h-4" /> },
    { id: "activities", label: `Activities (${customer.activities?.length || 0})`, icon: <Activity className="w-4 h-4" /> },
    { id: "history", label: `Audit Timeline (${auditHistory.length})`, icon: <HistoryIcon className="w-4 h-4" /> },
  ];

  return (
    <AppShell>
      <PageHeader
        title={customer.customerName}
        description={`Code: ${customer.customerCode} • Created ${formatDate(customer.createdAt)}`}
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: customer.customerCode }]}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/customers/${customer.id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                Edit Customer
              </Button>
            </Link>
            {customer.status === "Active" ? (
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<Power className="w-4 h-4" />}
                onClick={() => setIsDeactivating(true)}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={() => setIsReactivating(true)}
              >
                Reactivate
              </Button>
            )}
          </div>
        }
      />

      {/* Overview Top Info Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-[#0D9488] font-bold text-xl flex items-center justify-center shrink-0">
            {customer.customerName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">{customer.customerName}</h1>
              <StatusBadge status={customer.status} />
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4 mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {customer.companyName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {customer.city}, {customer.state}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Sales Owner: <strong>{customer.owner?.name || "Unassigned"}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-right w-full md:w-auto shrink-0">
          <span className="text-[11px] text-slate-400 block font-medium">Total Open Pipeline</span>
          <strong className="text-base font-bold text-[#0D9488] font-mono">{formatINR(totalPipelineValue)}</strong>
        </div>
      </div>

      {/* Tabs Bar */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Customer Code</span>
                    <span className="font-mono font-bold text-slate-800">{customer.customerCode}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Email Address</span>
                    <span className="text-slate-800 font-medium">{customer.email}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Mobile Phone</span>
                    <span className="font-mono text-slate-800">{formatPhone(customer.phone)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Company Name</span>
                    <span className="text-slate-800 font-semibold">{customer.companyName}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 block font-medium">Physical Address</span>
                  <span className="text-slate-700">{customer.address || "No address provided."}, {customer.city}, {customer.state}</span>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 block font-medium mb-1">Account Notes & GST Remarks</span>
                  <p className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 text-xs leading-relaxed">
                    {customer.notes || "No notes recorded for this customer."}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Metrics</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3 text-xs">
                <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Open Opportunities</span>
                    <strong className="text-base font-bold text-slate-800">{customer.opportunities?.length || 0}</strong>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#0D9488]" />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Total Leads</span>
                    <strong className="text-base font-bold text-slate-800">{customer.leads?.length || 0}</strong>
                  </div>
                  <Briefcase className="w-5 h-5 text-slate-400" />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Follow-ups Planned</span>
                    <strong className="text-base font-bold text-slate-800">{customer.followUps?.length || 0}</strong>
                  </div>
                  <CalendarCheck className="w-5 h-5 text-slate-400" />
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === "leads" && (
          <EmptyState
            title="No Leads Linked"
            description="There are currently no sales leads associated with this customer account."
            actionLabel="Create Lead"
          />
        )}

        {activeTab === "opportunities" && (
          <EmptyState
            title="No Opportunities Found"
            description="There are currently no active deal opportunities created for this customer."
            actionLabel="New Opportunity"
          />
        )}

        {activeTab === "followups" && (
          <EmptyState
            title="No Follow-ups Scheduled"
            description="Schedule a call, email, or meeting follow-up with this customer."
            actionLabel="Schedule Follow-up"
          />
        )}

        {activeTab === "activities" && (
          <EmptyState
            title="No Activity Logs"
            description="Log sales calls, client meetings, or correspondence notes."
            actionLabel="Log Activity"
          />
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Audit & Change History Timeline</CardTitle>
            </CardHeader>
            <CardBody>
              {auditHistory.length === 0 ? (
                <div className="text-xs text-slate-400 p-4 text-center">No audit history entries recorded.</div>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {auditHistory.map((item: any) => (
                    <div key={item.id} className="relative pl-8 text-xs">
                      <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-[#0D9488] ring-4 ring-white" />
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="font-semibold text-slate-800">{item.action}</strong>
                          <span className="text-[11px] text-slate-400">{formatRelativeTime(item.createdDate)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          By <strong>{item.user?.name || "System"}</strong> ({item.user?.role || "User"})
                        </p>
                        {item.newValue && (
                          <pre className="p-2 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600 mt-2 overflow-x-auto">
                            {item.newValue}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeactivating}
        onClose={() => setIsDeactivating(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Customer Account"
        message="Are you sure you want to deactivate this customer account? This will set status to Inactive."
        confirmText="Deactivate"
        isDestructive={true}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={isReactivating}
        onClose={() => setIsReactivating(false)}
        onConfirm={handleReactivate}
        title="Reactivate Customer Account"
        message="Are you sure you want to reactivate this customer account?"
        confirmText="Reactivate"
        isDestructive={false}
        isLoading={isSubmitting}
      />
    </AppShell>
  );
}
