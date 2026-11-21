/**
 * SeverityBadge Component
 * Follows strict design rule: Severity must NOT rely on color alone (combines icon + text label).
 * High WCAG AA contrast styling with consistent rounded rectangle borders.
 */

import React from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from './Icons';

export default function SeverityBadge({ severity, className = "" }) {
  const sev = (severity || "Medium").trim();

  let badgeConfig = {
    bg: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700",
    icon: Clock,
    label: "Medium",
  };

  switch (sev.toLowerCase()) {
    case "critical":
      badgeConfig = {
        bg: "bg-red-100 text-red-950 border-red-400 font-semibold dark:bg-red-950 dark:text-red-100 dark:border-red-600",
        icon: AlertTriangle,
        label: "Critical",
      };
      break;
    case "high":
      badgeConfig = {
        bg: "bg-orange-100 text-orange-950 border-orange-300 font-medium dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700",
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
        bg: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        icon: CheckCircle2,
        label: "Low",
      };
      break;
    default:
      break;
  }

  const IconComponent = badgeConfig.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border ${badgeConfig.bg} ${className}`}
      role="status"
      aria-label={`Severity priority: ${badgeConfig.label}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{badgeConfig.label}</span>
    </span>
  );
}
