"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function UsersPage() {
  return (
    <AppShell>
      <PageHeader
        title="User Management & Role Permissions"
        description="Manage system users, role promotions, and account lockouts."
        breadcrumbs={[{ label: "Users" }]}
      />
      <EmptyState
        title="User Management Module (Module 7)"
        description="User directory, role escalation controls, and password reset overrides are queued for Module 7 build."
        actionLabel="Go to Customers"
        onAction={() => window.location.href = "/customers"}
      />
    </AppShell>
  );
}
