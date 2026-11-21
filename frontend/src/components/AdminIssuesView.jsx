/**
 * CivicLens Administrator Active Issues Console
 * Focused dashboard for immediate operational action on active, unassigned,
 * critical, and flagged civic issues requiring prompt officer intervention.
 */

import React, { useState, useEffect } from 'react';
import { getOfficerTickets } from '../services/api';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import { ShieldAlert, AlertTriangle, Clock, RefreshCw, CheckCircle2, MapPin, Eye } from './Icons';

export default function AdminIssuesView({ onSelectTicket, onResolveTicket }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('active'); // 'active', 'critical', 'needs_review', 'in_progress'

  useEffect(() => {
    loadIssues();
  }, [activeFilter]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (activeFilter === 'critical') {
        filters.severity = 'Critical';
      } else if (activeFilter === 'needs_review') {
        filters.needs_review = true;
      } else if (activeFilter === 'in_progress') {
        filters.status = 'in_progress';
      }

      const data = await getOfficerTickets(filters);
      // Exclude resolved by default unless specifically requested
      const activeOnly = data.filter((t) => t.status !== 'resolved');
      setIssues(activeOnly);
    } catch (err) {
      console.error('Failed to load active issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = issues.filter((t) => t.severity === 'Critical').length;
  const reviewCount = issues.filter((t) => t.needs_review).length;
  const inProgressCount = issues.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            Active Municipal Issues &amp; Dispatch Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prioritized issues queue requiring field assignment, inspection, or completion sign-off.
          </p>
        </div>

        <button
          onClick={loadIssues}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Issues</span>
        </button>
      </div>

      {/* KPI Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveFilter(activeFilter === 'critical' ? 'active' : 'critical')}
          className={`p-4 rounded-lg border text-left transition-all ${
            activeFilter === 'critical'
              ? 'ring-2 ring-red-500 border-red-400 bg-red-50 dark:bg-red-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
              Critical Emergencies
            </span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {criticalCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Immediate threat to human safety (live wires, open manholes)
          </p>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'needs_review' ? 'active' : 'needs_review')}
          className={`p-4 rounded-lg border text-left transition-all ${
            activeFilter === 'needs_review'
              ? 'ring-2 ring-amber-500 border-amber-400 bg-amber-50 dark:bg-amber-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Review Queue
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {reviewCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Low AI confidence or photo vs text discrepancy
          </p>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'in_progress' ? 'active' : 'in_progress')}
          className={`p-4 rounded-lg border text-left transition-all ${
            activeFilter === 'in_progress'
              ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              In Progress
            </span>
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {inProgressCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Assigned to ward engineering crews
          </p>
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing {issues.length} active issues</span>
          {activeFilter !== 'active' && (
            <button
              onClick={() => setActiveFilter('active')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear filter (Show all active)
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            Loading active municipal issues...
          </div>
        ) : issues.length === 0 ? (
          <div className="py-12 text-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
            No active issues matching the current filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 rounded-lg border bg-white dark:bg-slate-900 space-y-3 transition-shadow hover:shadow-md ${
                  ticket.severity === 'Critical'
                    ? 'border-l-4 border-l-red-600 border-slate-200 dark:border-slate-800'
                    : ticket.severity === 'High'
                    ? 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header line */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                      {ticket.id}
                    </span>
                    <SeverityBadge severity={ticket.severity} />
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>

                {/* Complaint Text */}
                <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">
                  {ticket.translated_text || ticket.raw_text || (
                    <span className="italic text-slate-400">Photo inspection upload</span>
                  )}
                </p>

                {/* Category & Department */}
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Category: <strong className="capitalize text-slate-700 dark:text-slate-300">{ticket.category}</strong></span>
                  <span>Dept: <strong className="text-slate-700 dark:text-slate-300">{ticket.primary_department}</strong></span>
                </div>

                {/* Location */}
                {ticket.location_text && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{ticket.location_text}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectTicket(ticket.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>

                  <button
                    onClick={() => onResolveTicket(ticket.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete &amp; Upload Photo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
