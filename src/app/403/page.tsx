import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-bold text-slate-800 tracking-tight">403</h1>
      <h2 className="text-lg font-semibold text-slate-700 mt-2">
        Access Forbidden
      </h2>
      <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
        You do not have permission to view this resource. Your role does not grant access to this module or record.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link href="/dashboard">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
