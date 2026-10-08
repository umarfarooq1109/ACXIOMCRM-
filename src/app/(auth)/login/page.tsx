"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, ShieldCheck, Users, TrendingUp, AlertCircle, Key, UserCheck, Shield } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (eEmail?: string, ePassword?: string) => {
    const loginEmail = eEmail || email;
    const loginPassword = ePassword || password;

    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDemoFill = (dEmail: string, dPass: string) => {
    setEmail(dEmail);
    setPassword(dPass);
    handleLogin(dEmail, dPass);
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div>
        <Logo />
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-6">
          Sign in to Acxiom CRM
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your corporate email and password to access your pipeline.
        </p>
      </div>

      {/* Quick Demo Login Widget */}
      <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D9488]">
          <Key className="w-3.5 h-3.5" />
          <span>Quick 1-Click Demo Login</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Select any system role to sign in instantly with pre-configured demo credentials:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoFill("admin@acxiomcrm.com", "Admin@123456")}
            className="px-2.5 py-1.5 bg-white hover:bg-teal-100/70 border border-teal-300 rounded-lg text-left transition-colors text-xs font-semibold text-slate-800 flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-violet-600" />
            <div className="truncate">
              <div className="text-[11px] leading-tight font-bold text-slate-800">Admin</div>
              <div className="text-[9px] text-slate-500 truncate">Full System</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoFill("manager@acxiomcrm.com", "Manager@123456")}
            className="px-2.5 py-1.5 bg-white hover:bg-teal-100/70 border border-teal-300 rounded-lg text-left transition-colors text-xs font-semibold text-slate-800 flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <div className="truncate">
              <div className="text-[11px] leading-tight font-bold text-slate-800">Manager</div>
              <div className="text-[9px] text-slate-500 truncate">Team Pipeline</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoFill("sales@acxiomcrm.com", "SalesExec@123456")}
            className="px-2.5 py-1.5 bg-white hover:bg-teal-100/70 border border-teal-300 rounded-lg text-left transition-colors text-xs font-semibold text-slate-800 flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <div className="truncate">
              <div className="text-[11px] leading-tight font-bold text-slate-800">Sales Exec</div>
              <div className="text-[9px] text-slate-500 truncate">Own Records</div>
            </div>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="space-y-4"
      >
        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          autoComplete="email"
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#0D9488] font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Don't have an account?{" "}
        <Link href="/register" className="text-[#0D9488] font-semibold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-8 md:px-12 lg:px-20 bg-white">
        <Suspense fallback={<div className="text-xs text-slate-400 text-center">Loading login form...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      <div className="hidden md:flex flex-1 bg-[#F0FDFA] border-l border-[#CCFBF1] p-8 lg:p-12 flex-col justify-between">
        <div>
          <Logo />
          <h2 className="text-xl font-bold text-slate-800 mt-8 tracking-tight">
            Role-Based Commercial Sales Workspace
          </h2>
          <p className="text-xs text-slate-600 mt-2 max-w-md leading-relaxed">
            Manage your accounts, track lead status transitions, and enforce structured approval flows with immutable audit logging.
          </p>
        </div>

        <div className="space-y-4 my-8">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Unified Customer Records</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Centralized contact history, GST details, and follow-up activities.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Pipeline & Stage Forecasts</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Real-time INR stage weighting and sales velocity tracking.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Strict Role Scoping</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Database-level row permissions for Executives, Managers, and Admins.
              </p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Acxiom CRM • Enterprise Customer Workspace
        </div>
      </div>
    </div>
  );
}
