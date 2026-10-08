import React from "react";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center text-white shadow-sm flex-shrink-0">
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3L4 19h4l2-4h4l2 4h4L12 3z" />
          <path d="M11 11h2" />
        </svg>
      </div>
      {!collapsed && (
        <div className="flex items-baseline tracking-tight">
          <span className="font-semibold text-lg text-slate-800">Acxiom</span>
          <span className="font-light text-lg text-slate-500 ml-1">CRM</span>
        </div>
      )}
    </div>
  );
}
