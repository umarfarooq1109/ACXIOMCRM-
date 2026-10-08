"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    role: "Admin" | "Manager" | "SalesExecutive";
  };
  onLogout?: () => void;
}

export function AppShell({ children, user, onLogout }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex text-slate-700">
      <React.Suspense fallback={<div className="w-64 bg-white border-r border-slate-200 h-screen" />}>
        <Sidebar
          userRole={user?.role || "Admin"}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </React.Suspense>
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Header
          user={user}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto bg-white">
          {children}
        </main>
      </div>
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
