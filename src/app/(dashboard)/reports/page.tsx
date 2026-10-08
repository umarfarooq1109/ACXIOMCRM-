"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReportsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Reports & Sales Analytics"
        description="Executive dashboards, team conversion rates, and revenue reports."
        breadcrumbs={[{ label: "Reports" }]}
      />
      <EmptyState
        title="Reports & Analytics Module (Module 9)"
        description="Chart.js executive visual analytics and sales conversion reports are queued for Module 9 build."
        actionLabel="Go to Customers"
        onAction={() => window.location.href = "/customers"}
      />
    </AppShell>
  );
}
