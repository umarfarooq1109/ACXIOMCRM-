"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ActivitiesPage() {
  return (
    <AppShell>
      <PageHeader
        title="Sales Activity Logging"
        description="Log sales calls, client meetings, email exchanges, and demo logs."
        breadcrumbs={[{ label: "Activities" }]}
      />
      <EmptyState
        title="Activity Tracking Module (Module 6)"
        description="Interaction logs, phone call recordings, and client meeting notes are queued for Module 6 build."
        actionLabel="Go to Customers"
        onAction={() => window.location.href = "/customers"}
      />
    </AppShell>
  );
}
