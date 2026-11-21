/**
 * CivicLens Administrator Audit Trail & Logs View
 * Full transparency console recording every status transition, manual override,
 * duplicate linkage, and resolution sign-off across all municipal tickets.
 */

import React, { useState, useEffect } from 'react';
import { getOfficerLogs } from '../services/api';
import SeverityBadge from './SeverityBadge';
import { FileText, RefreshCw, Search, ShieldCheck } from './Icons';

export default function AdminLogsView({ onSelectTicket }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const filters = { limit: 100 };
      if (actionFilter) filters.action = actionFilter;
      if (ticketSearch.trim()) filters.ticket_id = ticketSearch.trim();
      const data = await getOfficerLogs(filters);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            Municipal Audit Trail &amp; Governance Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable log of all officer overrides, status updates, duplicate detections, and verified resolution proofs.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Action Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Filter Action:
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 focus:border-blue-600 focus:outline-none"
          >
            <option value="">All Actions (100% Trail)</option>
            <option value="status_change">Status Updates</option>
            <option value="issue_resolved">Work Resolutions</option>
            <option value="manual_override">Manual Overrides</option>
            <option value="duplicate_linked">Duplicate Links</option>
          </select>
        </div>

        {/* Ticket ID Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
            placeholder="Search Ticket ID (e.g. CL-2611)"
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 focus:border-blue-600 focus:outline-none w-full sm:w-56 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            Loading municipal audit records...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No audit records found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Ticket Reference</th>
                  <th className="py-3 px-4">Action &amp; Target</th>
                  <th className="py-3 px-4">Audit Transition</th>
                  <th className="py-3 px-4">Officer Designation</th>
                  <th className="py-3 px-4">Justification Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectTicket(log.ticket_id)}
                        className="font-mono font-bold text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        {log.ticket_id}
                      </button>
                      {log.severity && (
                        <div className="mt-0.5">
                          <SeverityBadge severity={log.severity} />
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        log.action === 'issue_resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.action === 'manual_override'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : log.action === 'duplicate_linked'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      {log.field_changed && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          field: {log.field_changed}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {log.old_value && log.new_value ? (
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 line-through text-slate-400">
                            {log.old_value}
                          </span>
                          <span>&rarr;</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                            {log.new_value}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Recorded action</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                      {log.officer_name}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs italic text-[11px]">
                      "{log.reason}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
