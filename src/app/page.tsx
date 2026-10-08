"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Plus, Download, Search, CheckCircle2, Shield, Users, TrendingUp } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <AppShell>
      <HomeContent loading={loading} setLoading={setLoading} />
    </AppShell>
  );
}

function HomeContent({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: (val: boolean) => void;
}) {
  const toast = useToast();

  const handleTestToast = () => {
    toast.success(
      "Design System Loaded",
      "Acxiom CRM Phase 1 design tokens and layout shell active."
    );
  };

  return (
    <div>
      <PageHeader
        title="Overview & Design System"
        description="Customers, pipeline and follow-ups in one place."
        breadcrumbs={[{ label: "Overview" }]}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleTestToast}
            >
              Export System
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1200);
              }}
            >
              New Entity
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={4} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Badges & Palette */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Primary Accent</p>
                  <p className="text-lg font-bold text-slate-800">#0D9488 Teal</p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="teal" dot>
                      Active Status
                    </Badge>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center border border-[#CCFBF1]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Secondary Accents</p>
                  <p className="text-lg font-bold text-slate-800">Pipeline Stages</p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    <Badge variant="emerald">Won</Badge>
                    <Badge variant="rose">Lost</Badge>
                    <Badge variant="amber">Negotiation</Badge>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">RBAC Roles</p>
                  <p className="text-lg font-bold text-slate-800">Access Matrix</p>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    <Badge variant="violet">Admin</Badge>
                    <Badge variant="sky">Manager</Badge>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Shield className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Seed Region</p>
                  <p className="text-lg font-bold text-slate-800">India Business</p>
                  <p className="text-xs text-slate-500 mt-1">₹ INR Currency & +91 Phones</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Users className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Form & Input Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>System Verification & Search Input</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Sample Search Input"
                  placeholder="Enter company name e.g. Bengaluru Tech Solutions"
                  leftIcon={<Search className="w-4 h-4" />}
                  helperText="Search by Indian business registration or phone number."
                />
                <Input
                  label="Sample Validated Input"
                  defaultValue="contact@acxiomcrm.com"
                  error={undefined}
                  helperText="Zod shared client/server schema validation."
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button variant="primary" onClick={handleTestToast}>
                  Trigger Success Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.warning("Warning State", "Account lockout attempt recorded.")}
                >
                  Trigger Warning Toast
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => toast.error("Error Action", "Failed to update record.")}
                >
                  Trigger Error Toast
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
