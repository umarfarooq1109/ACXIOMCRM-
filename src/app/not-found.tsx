import React from "react";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center mb-4 border border-teal-100 shadow-sm">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-bold text-slate-800 tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-slate-700 mt-2">
        Page Not Found
      </h2>
      <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
        The page or CRM record you requested could not be found or may have been moved.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link href="/dashboard">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Back to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
}
