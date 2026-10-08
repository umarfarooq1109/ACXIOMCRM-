"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { formatINR, formatDate, formatPhone } from "@/lib/format";
import { Plus, Search, Filter, X, Eye, Edit, UserCheck, Power, RefreshCw, Building2 } from "lucide-react";

export function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [cityFilter, setCityFilter] = useState(searchParams.get("city") || "ALL");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">((searchParams.get("sortOrder") as "asc" | "desc") || "desc");

  // Dialog states
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [reactivateId, setReactivateId] = useState<string | null>(null);
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [newOwnerId, setNewOwnerId] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const page = searchParams.get("page") || "1";
      const query = new URLSearchParams({
        page,
        pageSize: "10",
        search,
        status: statusFilter,
        city: cityFilter,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/customers?${query.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setCustomers(data.data || []);
        setPagination(data.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 1 });
      } else {
        toast.error("Error", data.message || "Failed to load customer list.");
      }
    } catch (err) {
      toast.error("Network Error", "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }, [searchParams, search, statusFilter, cityFilter, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${deactivateId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Customer Deactivated", "Status updated to Inactive.");
        fetchCustomers();
      } else {
        toast.error("Action Failed", data.message || "Could not deactivate customer.");
      }
    } catch {
      toast.error("Network Error", "Failed to deactivate customer.");
    } finally {
      setIsSubmitting(false);
      setDeactivateId(null);
    }
  };

  const handleReactivate = async () => {
    if (!reactivateId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${reactivateId}/reactivate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Customer Reactivated", "Status updated to Active.");
        fetchCustomers();
      } else {
        toast.error("Action Failed", data.message || "Could not reactivate customer.");
      }
    } catch {
      toast.error("Network Error", "Failed to reactivate customer.");
    } finally {
      setIsSubmitting(false);
      setReactivateId(null);
    }
  };

  const handleReassignOwner = async () => {
    if (!reassignId || !newOwnerId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${reassignId}/owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwnerId, reason: reassignReason || "Reassigned by manager" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Owner Updated", "Customer successfully reassigned.");
        fetchCustomers();
      } else {
        toast.error("Reassignment Failed", data.message || "Could not reassign customer.");
      }
    } catch {
      toast.error("Network Error", "Failed to reassign customer.");
    } finally {
      setIsSubmitting(false);
      setReassignId(null);
      setNewOwnerId("");
      setReassignReason("");
    }
  };

  const columns = [
    {
      header: "Code",
      accessorKey: "customerCode",
      cell: (row: any) => (
        <Link
          href={`/customers/${row.id}`}
          className="font-mono text-xs font-semibold text-[#0D9488] hover:underline"
        >
          {row.customerCode}
        </Link>
      ),
    },
    {
      header: "Name & Company",
      accessorKey: "customerName",
      cell: (row: any) => (
        <div>
          <Link href={`/customers/${row.id}`} className="font-semibold text-slate-800 hover:text-[#0D9488]">
            {row.customerName}
          </Link>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{row.companyName}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Contact Details",
      accessorKey: "email",
      cell: (row: any) => (
        <div className="text-xs">
          <div className="text-slate-700">{row.email}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{formatPhone(row.phone)}</div>
        </div>
      ),
    },
    {
      header: "City & State",
      accessorKey: "city",
      cell: (row: any) => (
        <span className="text-xs text-slate-600">
          {row.city}, {row.state}
        </span>
      ),
    },
    {
      header: "Sales Owner",
      accessorKey: "owner",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-teal-100 text-[#0D9488] font-bold text-[10px] flex items-center justify-center">
            {row.owner?.name ? row.owner.name.charAt(0) : "U"}
          </div>
          <span className="text-xs text-slate-700">{row.owner?.name || "Unassigned"}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      header: "Created Date",
      accessorKey: "createdAt",
      cell: (row: any) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
    },
    {
      header: "Actions",
      cell: (row: any) => (
        <div className="flex items-center gap-1">
          <Link href={`/customers/${row.id}`}>
            <button className="p-1.5 text-slate-500 hover:text-[#0D9488] hover:bg-slate-100 rounded-md transition-colors" title="View Customer">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <Link href={`/customers/${row.id}/edit`}>
            <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors" title="Edit Customer">
              <Edit className="w-4 h-4" />
            </button>
          </Link>
          {row.status === "Active" ? (
            <button
              onClick={() => setDeactivateId(row.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Deactivate Customer"
            >
              <Power className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setReactivateId(row.id)}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
              title="Reactivate Customer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Customer Directory"
        description="Manage your enterprise account records, corporate contacts, and sales assignments across India."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Customers" }]}
        action={
          <Link href="/customers/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Customer
            </Button>
          </Link>
        }
      />

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, name, company, email, phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0D9488]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Prospect">Prospect</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0D9488]"
            >
              <option value="ALL">All Cities</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Chennai">Chennai</option>
              <option value="Delhi NCR">Delhi NCR</option>
            </select>

            {(statusFilter !== "ALL" || cityFilter !== "ALL" || search !== "") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCityFilter("ALL");
                }}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Data Render */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No Customers Found"
          description="No customer accounts match the current filter criteria or search query."
          actionLabel="Create Customer"
          onAction={() => router.push("/customers/new")}
        />
      ) : (
        <DataTable
          data={customers}
          columns={columns}
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalCount={pagination.total}
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(p));
            router.push(`/customers?${params.toString()}`);
          }}
        />
      )}

      {/* Confirm Deactivate Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deactivateId)}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Customer Account"
        message="Are you sure you want to mark this customer as Inactive? They will remain in history records."
        confirmText="Deactivate Customer"
        isDestructive={true}
        isLoading={isSubmitting}
      />

      {/* Confirm Reactivate Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reactivateId)}
        onClose={() => setReactivateId(null)}
        onConfirm={handleReactivate}
        title="Reactivate Customer Account"
        message="Reactivating this customer will return their status to Active."
        confirmText="Reactivate Account"
        isDestructive={false}
        isLoading={isSubmitting}
      />
    </AppShell>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <CustomersContent />
    </Suspense>
  );
}
