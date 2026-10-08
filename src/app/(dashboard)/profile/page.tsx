"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { User, Mail, Shield, KeyRound } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: "Admin" | "Manager" | "SalesExecutive";
  }>({
    name: "System Administrator",
    email: "admin@acxiomcrm.com",
    role: "Admin",
  });

  return (
    <AppShell user={user}>
      <PageHeader
        title="User Profile & Security"
        description="Manage your account profile information and authentication security settings."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Profile" }]}
      />

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Account Credentials</span>
              <StatusBadge status={user.role} />
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Full Name</span>
                <strong className="text-slate-800 text-xs font-semibold">{user.name}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Corporate Email</span>
                <strong className="text-slate-800 text-xs font-semibold">{user.email}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Shield className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Assigned Role</span>
                <strong className="text-slate-800 text-xs font-semibold">{user.role}</strong>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication & Password</CardTitle>
          </CardHeader>
          <CardBody className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Account Password</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Last updated via secure bcrypt hash. Policy requires periodic updates.
              </p>
            </div>
            <Link href="/change-password">
              <Button variant="outline" size="sm" leftIcon={<KeyRound className="w-4 h-4" />}>
                Change Password
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
