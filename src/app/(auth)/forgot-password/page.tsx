import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Password Reset Request</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Password resets are managed securely by your workspace System Administrator. Please contact your CRM admin or write to{" "}
          <strong className="text-slate-700">support@acxiomcrm.com</strong> to receive a temporary login token.
        </p>
        <div className="pt-4 border-t border-slate-100">
          <Link href="/login">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
