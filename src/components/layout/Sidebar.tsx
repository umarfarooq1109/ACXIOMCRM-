"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { APP_CONFIG } from "@/lib/config";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  TrendingUp,
  CalendarClock,
  Activity,
  ShieldCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from "lucide-react";
import { clsx } from "clsx";

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: ("Admin" | "Manager" | "SalesExecutive")[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        label: "Leads",
        href: "/leads",
        icon: UserCheck,
      },
      {
        label: "Opportunities",
        href: "/opportunities",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Engagement",
    items: [
      {
        label: "Follow-ups",
        href: "/followups",
        icon: CalendarClock,
      },
      {
        label: "Activities",
        href: "/activities",
        icon: Activity,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Users & Roles",
        href: "/users",
        icon: UserCog,
        roles: ["Admin"],
      },
      {
        label: "Audit Log",
        href: "/audit",
        icon: ShieldCheck,
        roles: ["Admin", "Manager"],
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
    ],
  },
];

interface SidebarProps {
  userRole?: "Admin" | "Manager" | "SalesExecutive";
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  userRole = "Admin",
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col transition-all duration-200 z-30 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4">
        <Link href="/dashboard">
          <Logo collapsed={collapsed} />
        </Link>
        <button
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Grouped Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {navSections.map((section) => {
          const filteredItems = section.items.filter(
            (item) => !item.roles || item.roles.includes(userRole)
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {section.title}
                </div>
              )}
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? `${section.title}: ${item.label}` : undefined}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors group relative",
                      isActive
                        ? "bg-[#F0FDFA] text-[#0D9488] font-semibold border-l-4 border-[#0D9488]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-4 h-4 flex-shrink-0 transition-colors",
                        isActive ? "text-[#0D9488]" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Line with Version */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{APP_CONFIG.appName}</span>
          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
            {APP_CONFIG.version}
          </span>
        </div>
      )}
    </aside>
  );
}
