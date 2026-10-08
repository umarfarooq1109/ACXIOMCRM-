"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminPage() {
  return (
    <AppShell>
      <PageHeader
        title="Administration & Audit Dashboard"
        description="User management, role assignment, account unlocking, and system audit logs."
        breadcrumbs={[{ label: "Administration" }]}
      />
      <EmptyState
        title="Administration Module (Module 7)"
        description="User role management, account unlocks, and audit trail viewer are queued for Module 7 build."
        actionLabel="Go to Customers"
        onAction={() => window.location.href = "/customers"}
      />
    </AppShell>
  );
}
