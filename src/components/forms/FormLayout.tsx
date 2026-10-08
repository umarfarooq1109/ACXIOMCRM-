"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface FormLayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  saveText?: string;
  cancelText?: string;
}

export function FormLayout({
  title,
  description,
  children,
  onSave,
  onCancel,
  isLoading = false,
  saveText = "Save Changes",
  cancelText = "Cancel",
}: FormLayoutProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {(title || description) && (
        <div className="p-6 border-b border-slate-100">
          {title && <h2 className="text-base font-semibold text-slate-800">{title}</h2>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
      {(onSave || onCancel) && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
              {cancelText}
            </Button>
          )}
          {onSave && (
            <Button variant="primary" size="sm" onClick={onSave} isLoading={isLoading}>
              {saveText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
