"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AuditPage() {
  return (
    <AppShell>
      <PageHeader
        title="Security & System Audit Log Viewer"
        description="Immutable audit trail of system logins, record changes, and permission modifications."
        breadcrumbs={[{ label: "Audit Logs" }]}
      />
      <EmptyState
        title="Audit Logs Dashboard (Module 7)"
        description="Full-text audit search, date range filters, and security violation tracking are queued for Module 7 build."
        actionLabel="Go to Customers"
        onAction={() => window.location.href = "/customers"}
      />
    </AppShell>
  );
}
