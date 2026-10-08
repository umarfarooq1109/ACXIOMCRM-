import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { clsx } from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: "teal" | "violet" | "sky" | "amber" | "rose" | "emerald";
  delta?: {
    value: string;
    isPositive: boolean;
  };
  sublabel?: string;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  iconColor = "teal",
  delta,
  sublabel,
  onClick,
}: KpiCardProps) {
  const iconBgStyles = {
    teal: "bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1]",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <Card
      className={clsx(
        "transition-all hover:border-slate-300",
        onClick && "cursor-pointer hover:shadow-md"
      )}
      onClick={onClick}
    >
      <CardBody className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">
              {value}
            </h3>
          </div>
          <div
            className={clsx(
              "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0",
              iconBgStyles[iconColor]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {(delta || sublabel) && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {delta && (
              <span
                className={clsx(
                  "font-semibold flex items-center gap-1",
                  delta.isPositive ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {delta.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {delta.value}
              </span>
            )}
            {sublabel && <span className="text-slate-500">{sublabel}</span>}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
