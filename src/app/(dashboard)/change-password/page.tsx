"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormLayout } from "@/components/forms/FormLayout";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Check, X, ShieldAlert } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const handleSubmit = async () => {
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to update password.");
        setIsLoading(false);
        return;
      }

      toast.success("Password Updated", "Your password has been changed successfully.");
      router.push("/dashboard");
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Change Password"
        description="Update your corporate account password. Policy requires 8+ characters with uppercase, lowercase, digit, and special character."
        breadcrumbs={[{ label: "Profile", href: "/profile" }, { label: "Change Password" }]}
      />

      <div className="max-w-2xl">
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <FormLayout
          title="Security Update"
          description="Enter your current password followed by your new password."
          onSave={handleSubmit}
          onCancel={() => router.back()}
          isLoading={isLoading}
          saveText="Update Password"
        >
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <div className="space-y-1">
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mt-2 text-[11px] space-y-1">
              <span className="font-semibold text-slate-700 block">Password Requirements:</span>
              <div className="grid grid-cols-2 gap-1 text-slate-600">
                <div className="flex items-center gap-1.5">
                  {hasMinLen ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span className={hasMinLen ? "text-emerald-700 font-medium" : ""}>8+ Characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span className={hasUpper ? "text-emerald-700 font-medium" : ""}>Uppercase (A-Z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasLower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span className={hasLower ? "text-emerald-700 font-medium" : ""}>Lowercase (a-z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasDigit ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span className={hasDigit ? "text-emerald-700 font-medium" : ""}>Digit (0-9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span className={hasSpecial ? "text-emerald-700 font-medium" : ""}>Special (!@#$)</span>
                </div>
              </div>
            </div>
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormLayout>
      </div>
    </AppShell>
  );
}
