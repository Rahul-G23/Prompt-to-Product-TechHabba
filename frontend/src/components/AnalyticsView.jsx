/**
 * CivicLens Real Municipal Analytics View
 * Strict compliance: 100% real persisted data, zero fake counters.
 */

import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../services/api';
import SeverityBadge from './SeverityBadge';
import { BarChart3, RefreshCw, AlertCircle, Clock, CheckCircle2, ShieldAlert } from './Icons';

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAnalytics();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to compute municipal analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Aggregating live municipal metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-4 rounded-lg bg-red-50 text-red-900 border border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const total = data ? data.total_tickets : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            <span>Municipal Operational Analytics</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Aggregated in real time from database records. Displays workload, resolution velocity, and triage distribution.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.total_tickets}</p>
          <span className="text-[11px] text-slate-400">Recorded grievances</span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-sm">
          <span className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider">Active Open</span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{data.open_tickets}</p>
          <span className="text-[11px] text-blue-700 dark:text-blue-300">In remediation queue</span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
          <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">Resolved</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{data.resolved_tickets}</p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
            {total > 0 ? `${((data.resolved_tickets / total) * 100).toFixed(0)}% completion` : '0%'}
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm">
          <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400 tracking-wider">Review Queue</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{data.needs_review_count}</p>
          <span className="text-[11px] text-amber-700 dark:text-amber-300">Needs officer action</span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-sm">
          <span className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-400 tracking-wider">Duplicates</span>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{data.duplicate_tickets}</p>
          <span className="text-[11px] text-purple-700 dark:text-purple-300">Merged to parents</span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Avg Resolution</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {data.avg_resolution_hours !== null ? `${data.avg_resolution_hours}h` : 'N/A'}
          </p>
          <span className="text-[11px] text-slate-400">From creation to fix</span>
        </div>
      </div>

      {total === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8">
          <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No complaints recorded in the database yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            To view rich real analytics and test prioritization, run the seed script:
            <code className="block mt-2 font-mono text-blue-700 dark:text-blue-300 bg-slate-100 dark:bg-slate-800 p-2 rounded">
              python seed_demo_data.py
            </code>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Severity Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Safety Severity Breakdown
            </h2>
            <div className="space-y-3">
              {['Critical', 'High', 'Medium', 'Low'].map((sev) => {
                const count = data.tickets_by_severity[sev] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={sev} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={sev} />
                        <span className="text-slate-500">({count} tickets)</span>
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          sev === 'Critical'
                            ? 'bg-red-600'
                            : sev === 'High'
                            ? 'bg-orange-500'
                            : sev === 'Medium'
                            ? 'bg-yellow-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Workload by Municipal Department
            </h2>
            <div className="space-y-3">
              {Object.entries(data.tickets_by_department).map(([dept, count]) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={dept} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {dept}
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Grievance Distribution Across Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(data.tickets_by_category).map(([cat, count]) => {
                return (
                  <div
                    key={cat}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                  >
                    <span className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-300 block truncate">
                      {cat}
                    </span>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
