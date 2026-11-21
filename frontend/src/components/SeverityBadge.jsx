/**
 * SeverityBadge Component
 * Follows strict design rule: Severity must NOT rely on color alone (combines icon + text label).
 * High WCAG AA contrast styling with consistent rounded rectangle borders.
 * Critical uses theme Crimson Red (#A31C1B).
 */

import React from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from './Icons';

export default function SeverityBadge({ severity, className = "" }) {
  const sev = (severity || "Medium").trim();

  let badgeConfig = {
    bg: "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700",
    icon: Clock,
    label: "Medium",
  };

  switch (sev.toLowerCase()) {
    case "critical":
      badgeConfig = {
        bg: "bg-[#A31C1B]/20 text-white border-[#A31C1B] font-bold shadow-sm",
        icon: AlertTriangle,
        label: "Critical",
      };
      break;
    case "high":
      badgeConfig = {
        bg: "bg-orange-100 text-orange-950 border-orange-300 font-semibold dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700",
        icon: AlertCircle,
        label: "High",
      };
      break;
    case "medium":
      badgeConfig = {
        bg: "bg-yellow-100 text-yellow-950 border-yellow-300 font-medium dark:bg-yellow-950/70 dark:text-yellow-200 dark:border-yellow-700",
        icon: Clock,
        label: "Medium",
      };
      break;
    case "low":
      badgeConfig = {
        bg: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-[#171717] dark:text-zinc-300 dark:border-[#2a2a2a]",
        icon: CheckCircle2,
        label: "Low",
      };
      break;
    default:
      break;
  }

  const Icon = badgeConfig.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border ${badgeConfig.bg} ${className}`}
      role="status"
      aria-label={`Severity: ${badgeConfig.label}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{badgeConfig.label}</span>
    </span>
  );
}
