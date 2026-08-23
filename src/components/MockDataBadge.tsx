import React from "react";
import { ShieldAlert } from "lucide-react";

interface MockDataBadgeProps {
  label?: string;
  className?: string;
}

export function MockDataBadge({ label = "Synthetic Data", className = "" }: MockDataBadgeProps) {
  return (
    <span
      title="This is non-real, fictional sample data created strictly for hackathon simulation."
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs select-none ${className}`}
    >
      <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
