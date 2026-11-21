/**
 * StatusBadge Component
 * Displays ticket lifecycle states with clean icons and accessible typography.
 */

import React from 'react';
import { InfoIcon, RefreshCw, CheckCircle2 } from './Icons';

export default function StatusBadge({ status, className = "" }) {
  const st = (status || "new").toLowerCase();

  let config = {
    bg: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    icon: InfoIcon,
    label: "New",
  };

  switch (st) {
    case "new":
      config = {
        bg: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
        icon: InfoIcon,
        label: "New",
      };
      break;
    case "assigned":
      config = {
        bg: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
        icon: InfoIcon,
        label: "Assigned",
      };
      break;
    case "in_progress":
      config = {
        bg: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
        icon: RefreshCw,
        label: "In Progress",
      };
      break;
    case "resolved":
      config = {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
        icon: CheckCircle2,
        label: "Resolved",
      };
      break;
    default:
      break;
  }

  const IconComp = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-md border ${config.bg} ${className}`}>
      <IconComp className="w-3 h-3 flex-shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
