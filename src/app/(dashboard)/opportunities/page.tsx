"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OpportunitiesPage() {
  return (
    <AppShell>
      <PageHeader
        title="Opportunity Management"
        description="Deal pipeline stages, stage transitions, and revenue forecasting."
        breadcrumbs={[{ label: "Opportunities" }]}
      />
      <EmptyState
        title="Opportunity Management Module (Module 5)"
        description="Kanban deal board, pipeline tracking, and won/lost analytics are queued for Module 5 build."
        actionLabel="Go to Customers"
        onAction={() => window.location.href = "/customers"}
      />
    </AppShell>
  );
}
