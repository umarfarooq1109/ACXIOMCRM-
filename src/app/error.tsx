"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-bold text-slate-800 tracking-tight">500</h1>
      <h2 className="text-lg font-semibold text-slate-700 mt-2">
        Something Went Wrong
      </h2>
      <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
        An unexpected error occurred. No sensitive data was exposed. Please try refreshing or return to the dashboard.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Button
          variant="primary"
          size="sm"
          onClick={() => reset()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" leftIcon={<Home className="w-4 h-4" />}>
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
