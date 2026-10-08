"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function FollowUpsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Follow-ups & Scheduled Tasks"
        description="Schedule sales calls, client meetings, and automated reminder tasks."
        breadcrumbs={[{ label: "Follow-ups" }]}
      />
      <EmptyState
        title="Follow-up & Activity Module (Module 6)"
        description="Daily sales agenda, call logging, and follow-up reminders are queued for Module 6 build."
        actionLabel="Go to Customers"
        onAction={() => window.location.href = "/customers"}
      />
    </AppShell>
  );
}
