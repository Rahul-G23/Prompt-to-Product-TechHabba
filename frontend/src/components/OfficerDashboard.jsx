/**
 * CivicLens Municipal Officer Priority Dashboard
 * Real-time queue strictly sorted by safety severity priority,
 * multi-faceted filtering, review queues, and live ticket dossiers.
 */

import React, { useState, useEffect } from 'react';
import { getOfficerTickets, getAnalytics } from '../services/api';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import TicketDetailModal from './TicketDetailModal';
import {
  Layers,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronRight,
  X
} from './Icons';
import { ALLOWED_CATEGORIES, ALLOWED_SEVERITIES, ALLOWED_STATUSES } from '../config';

export default function OfficerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false);

  // Selected Ticket for Modal
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [category, severity, status, needsReviewOnly]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ticketData, analyticsData] = await Promise.all([
        getOfficerTickets({
          category: category || undefined,
          severity: severity || undefined,
          status: status || undefined,
          needs_review: needsReviewOnly ? true : undefined,
          search: search.trim() || undefined,
        }),
        getAnalytics(),
      ]);
      setTickets(ticketData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.message || 'Failed to load officer dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSeverity('');
    setStatus('');
    setNeedsReviewOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Officer Header with Prototype Note */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Municipal Officer Priority Queue</span>
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Officer View (Prototype Demo - No Auth Required)
            </span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Grievances are sorted strictly by safety risk: Critical threats to human life are queued first, followed by age.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Real KPI Metrics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Total Grievances
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.total_tickets}
              </span>
              <span className="text-xs text-slate-500">
                {analytics.open_tickets} Active
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 shadow-sm">
            <span className="text-xs font-semibold uppercase text-red-700 dark:text-red-400 tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical Priority
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {analytics.tickets_by_severity['Critical'] || 0}
              </span>
              <span className="text-xs text-red-700 dark:text-red-300">
                Immediate Dispatch
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm">
            <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Review Queue
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {analytics.needs_review_count}
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Low Conf / Discrepancy
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
            <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolved Tickets
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {analytics.resolved_tickets}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300">
                {analytics.avg_resolution_hours ? `${analytics.avg_resolution_hours}h avg` : 'Tracking'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Ticket ID (e.g. CL-2611-...), location, or grievance description..."
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none capitalize"
          >
            <option value="">All Categories</option>
            {ALLOWED_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Severity Dropdown */}
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
          >
            <option value="">All Severities</option>
            {ALLOWED_SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {ALLOWED_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Needs Review Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={needsReviewOnly}
              onChange={(e) => setNeedsReviewOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>Needs Review Queue Only</span>
          </label>

          {(category || severity || status || search || needsReviewOnly) && (
            <button
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-red-600 flex items-center gap-1 underline text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-900 border border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {/* Ticket List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Severity Priority</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description Snippet</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date & Age</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Loading prioritized municipal queue...</span>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="max-w-sm mx-auto text-center space-y-2">
                      <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        No grievances match the filter criteria.
                      </p>
                      <p className="text-xs text-slate-500">
                        Try clearing active filters or populate sample data via the seed script.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-blue-700 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                      <div className="flex items-center gap-1.5">
                        <span>{t.id}</span>
                        {t.duplicate_count > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                            title={`${t.duplicate_count} duplicate complaints merged into this ticket`}
                          >
                            +{t.duplicate_count} dup
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <SeverityBadge severity={t.severity} />
                    </td>

                    <td className="py-3 px-4 capitalize font-medium text-slate-900 dark:text-slate-100">
                      {t.category}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate">
                      <span className="text-slate-900 dark:text-slate-100 font-medium">
                        {t.translated_text || t.raw_text || (t.has_photo ? '[Photo-only submission]' : '-')}
                      </span>
                      {t.location_text && (
                        <span className="block text-[11px] text-slate-400 truncate">
                          Near: {t.location_text}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {t.primary_department}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={t.status} />
                        {t.needs_review && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                            title="Flagged for officer review"
                          />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(t.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(t.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-700 dark:hover:text-blue-300"
                        title="Open dossier"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={(updated) => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
