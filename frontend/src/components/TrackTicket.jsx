/**
 * CivicLens Citizen Ticket Tracker View
 * Public portal allowing citizens to monitor live progress and departmental routing.
 */

import React, { useState, useEffect } from 'react';
import { trackComplaint } from '../services/api';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import { Search, MapPin, CheckCircle2, Clock, AlertCircle, RefreshCw, FileText } from './Icons';

export default function TrackTicket({ initialTicketId }) {
  const [ticketIdInput, setTicketIdInput] = useState(initialTicketId || '');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialTicketId) {
      setTicketIdInput(initialTicketId);
      handleTrack(initialTicketId);
    }
  }, [initialTicketId]);

  const handleTrack = async (idToSearch) => {
    const queryId = (idToSearch || ticketIdInput).trim();
    if (!queryId) {
      setError('Please enter a valid Ticket Reference ID.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await trackComplaint(queryId);
      setTicket(data);
    } catch (err) {
      setTicket(null);
      setError(err.message || 'No civic ticket found with this reference ID.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleTrack(ticketIdInput);
  };

  // Lifecycle steps calculation
  const steps = [
    { id: 'new', label: 'Registered', desc: 'AI triage and department assigned' },
    { id: 'assigned', label: 'Field Assigned', desc: 'Assigned to municipal unit' },
    { id: 'in_progress', label: 'In Progress', desc: 'Field team mobilized' },
    { id: 'resolved', label: 'Resolved', desc: 'Remediation completed' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'new': return 0;
      case 'assigned': return 1;
      case 'in_progress': return 2;
      case 'resolved': return 3;
      default: return 0;
    }
  };

  const currentStep = ticket ? getStepIndex(ticket.status) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Track Your Civic Grievance
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Enter your ticket reference ID to see real-time dispatch and resolution progress.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={onSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={ticketIdInput}
              onChange={(e) => setTicketIdInput(e.target.value)}
              placeholder="e.g. CL-2611-A8F2B"
              className="w-full text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Track</span>}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/70 dark:text-red-200 dark:border-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Ticket Details Dossier */}
      {ticket && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ticket Reference
              </span>
              <h2 className="font-mono text-xl font-bold text-blue-700 dark:text-blue-300">
                {ticket.id}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={ticket.severity} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-4">
              Remediation Lifecycle
            </span>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
              {steps.map((st, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={st.id} className="text-center">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isCompleted
                          ? 'bg-blue-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      } ${isCurrent ? 'ring-2 ring-blue-400' : ''}`}
                    >
                      {idx + 1}
                    </div>
                    <p
                      className={`text-xs font-semibold mt-2 ${
                        isCompleted ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </p>
                    <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
                      {st.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-500">Classified Category:</span>
              <p className="font-semibold capitalize text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                {ticket.category}
              </p>
            </div>

            <div>
              <span className="text-slate-500">Responsible Department:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                {ticket.primary_department}
              </p>
            </div>

            <div>
              <span className="text-slate-500">Reported On:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <span className="text-slate-500">Location:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{ticket.location_text || 'Coordinates on file'}</span>
              </p>
            </div>

            {ticket.resolution_notes && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-semibold">Resolution Notes:</span>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium">
                  {ticket.resolution_notes}
                </p>
              </div>
            )}
          </div>

          {/* Verified Resolution Proof (Completion Summary + Completed Photo) */}
          {(ticket.status === 'resolved' || ticket.has_completion_photo || ticket.completion_summary) && (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Verified Municipal Work Completion Proof
                </h3>
              </div>

              {ticket.completion_summary && (
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 text-xs">
                  <span className="font-semibold text-slate-500 block mb-0.5">Officer Completion Statement:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {ticket.completion_summary}
                  </p>
                  {ticket.resolved_at && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Completed: {new Date(ticket.resolved_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Photo Proof Display (Before & After) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {ticket.photo_path && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Initial Citizen Report (Before):
                    </span>
                    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <a href={ticket.photo_path} target="_blank" rel="noopener noreferrer">
                        <img src={ticket.photo_path} alt="Before" className="w-full h-36 object-contain" />
                      </a>
                    </div>
                  </div>
                )}

                {ticket.completion_photo_path && (
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Completed Resolution Proof (After):
                    </span>
                    <div className="rounded-lg overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900">
                      <a href={ticket.completion_photo_path} target="_blank" rel="noopener noreferrer">
                        <img src={ticket.completion_photo_path} alt="After" className="w-full h-36 object-contain" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!ticket && !loading && (
        <div className="text-center py-10 text-slate-400">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm">Enter a reference ID above to query live status.</p>
        </div>
      )}
    </div>
  );
}
