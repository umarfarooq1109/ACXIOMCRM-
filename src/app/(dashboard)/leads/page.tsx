"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function LeadsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Lead Management"
        description="Capture, qualify, and assign incoming sales leads."
        breadcrumbs={[{ label: "Leads" }]}
      />
      <EmptyState
        title="Lead Management Module (Module 3)"
        description="Lead scoring, qualification pipeline, and auto-assignment are queued for build in Module 3."
        actionLabel="Back to Customers"
        onAction={() => window.location.href = "/customers"}
      />
    </AppShell>
  );
}
