"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";

export type DatePreset = "today" | "this_week" | "this_month" | "custom";

export interface DateRangePickerProps {
  value?: DatePreset;
  onChange: (preset: DatePreset) => void;
}

export function DateRangePicker({
  value = "this_month",
  onChange,
}: DateRangePickerProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
      <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
      <button
        type="button"
        onClick={() => onChange("today")}
        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
          value === "today"
            ? "bg-white text-slate-800 shadow-xs border border-slate-200"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => onChange("this_week")}
        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
          value === "this_week"
            ? "bg-white text-slate-800 shadow-xs border border-slate-200"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        This Week
      </button>
      <button
        type="button"
        onClick={() => onChange("this_month")}
        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
          value === "this_month"
            ? "bg-white text-slate-800 shadow-xs border border-slate-200"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        This Month
      </button>
    </div>
  );
}
