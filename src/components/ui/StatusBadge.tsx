import React from "react";
import { Badge } from "@/components/ui/Badge";

export type CRMStatus =
  | "Active"
  | "Inactive"
  | "Prospect"
  | "New"
  | "Contacted"
  | "Qualified"
  | "Unqualified"
  | "Converted"
  | "Lost"
  | "Qualification"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Planned"
  | "Completed"
  | "Missed"
  | "Cancelled"
  | "Admin"
  | "Manager"
  | "SalesExecutive";

interface StatusBadgeProps {
  status: CRMStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant: "emerald" | "rose" | "amber" | "sky" | "violet" | "teal" | "slate" = "slate";

  switch (status) {
    case "Active":
    case "Won":
    case "Completed":
    case "Converted":
      variant = "emerald";
      break;
    case "Lost":
    case "Missed":
    case "Inactive":
    case "Failed":
      variant = "rose";
      break;
    case "Negotiation":
    case "Pending":
    case "Planned":
    case "Contacted":
    case "Warning":
      variant = "amber";
      break;
    case "New":
    case "Qualification":
    case "Prospect":
      variant = "sky";
      break;
    case "Proposal":
    case "Admin":
      variant = "violet";
      break;
    case "Manager":
      variant = "sky";
      break;
    case "SalesExecutive":
      variant = "teal";
      break;
    case "Cancelled":
    case "Unqualified":
    default:
      variant = "slate";
      break;
  }

  return (
    <Badge variant={variant} dot className={className}>
      {status === "SalesExecutive" ? "Sales Exec" : status}
    </Badge>
  );
}
