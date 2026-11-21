/**
 * CivicLens Ticket Detail & Officer Override Modal
 * Detailed inspection, photo zoom, AI reasoning inspection,
 * duplicate management, status progression, and auditable manual overrides.
 */

import React, { useState, useEffect } from 'react';
import { getTicketDetail, updateTicket, resolveTicketWithProof } from '../services/api';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import { X, AlertTriangle, AlertCircle, RefreshCw, MapPin, User, Clock, ShieldAlert, Check, CheckCircle2, Camera } from './Icons';
import { ALLOWED_CATEGORIES, ALLOWED_SEVERITIES, ALLOWED_STATUSES } from '../config';

export default function TicketDetailModal({ ticketId, onClose, onTicketUpdated }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Form override states
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [primaryDept, setPrimaryDept] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Completion proof states
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [completionSummary, setCompletionSummary] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [completionPhotoPreview, setCompletionPhotoPreview] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTicketDetail(ticketId);
      setTicket(data);
      setStatus(data.status);
      setCategory(data.category);
      setSeverity(data.severity);
      setPrimaryDept(data.primary_department);
      setAssignedOfficer(data.assigned_officer || '');
      setResolutionNotes(data.resolution_notes || '');
    } catch (err) {
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOverrides = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      setError('Please provide a reason for this update or manual override.');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      const payload = {
        status,
        category,
        severity,
        primary_department: primaryDept,
        assigned_officer: assignedOfficer.trim() || null,
        resolution_notes: resolutionNotes.trim() || null,
        override_reason: overrideReason.trim(),
        officer_name: 'Duty Municipal Officer',
      };

      const updated = await updateTicket(ticketId, payload);
      setTicket(updated);
      setOverrideReason('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onTicketUpdated) onTicketUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Completed photo must be 5 MB or smaller.');
      return;
    }
    setCompletionPhoto(file);
    setCompletionPhotoPreview(URL.createObjectURL(file));
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!completionSummary.trim() || completionSummary.trim().length < 5) {
      setError('Please provide a substantive summary (at least 5 characters) of the completed work.');
      return;
    }
    if (!completionPhoto) {
      setError('A photo proving the completed/resolved work is required.');
      return;
    }

    try {
      setResolving(true);
      setError(null);
      const fd = new FormData();
      fd.append('completion_summary', completionSummary.trim());
      fd.append('completion_photo', completionPhoto);
      fd.append('officer_name', assignedOfficer.trim() || 'Duty Municipal Officer');

      const updated = await resolveTicketWithProof(ticket.id, fd);
      setTicket(updated);
      setStatus('resolved');
      setSaveSuccess(true);
      setShowResolveForm(false);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onTicketUpdated) onTicketUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to submit completion proof.');
    } finally {
      setResolving(false);
    }
  };


  if (!ticketId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-lg text-blue-700 dark:text-blue-300">
              {ticketId}
            </span>
            {ticket && (
              <>
                <SeverityBadge severity={ticket.severity} />
                <StatusBadge status={ticket.status} />
                {ticket.is_duplicate && (
                  <span className="px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    Duplicate Grievance
                  </span>
                )}
                {ticket.duplicate_count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    +{ticket.duplicate_count} Duplicates Linked
                  </span>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm">Retrieving ticket dossier...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 text-red-900 border border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-800 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <p>{error}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-medium">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Ticket status and override updated in audit log.</span>
            </div>
          )}

          {ticket && !loading && (
            <>
              {/* Needs Review / Discrepancy Banner */}
              {ticket.needs_review && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 dark:bg-amber-950/70 dark:border-amber-800 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-950 dark:text-amber-200">
                      Attention Required: Triage Review Flag
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                      {ticket.review_reason || 'Automated score or photo discrepancy requires officer verification.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Citizen Intake Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description & Translation */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Original Citizen Text
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Language: {ticket.detected_language}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm">
                      {ticket.raw_text || <span className="italic text-slate-400">No text provided (photo-only report)</span>}
                    </div>
                  </div>

                  {ticket.translated_text && ticket.detected_language !== 'English' && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        English Translation (AI Verified)
                      </span>
                      <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-sm text-slate-800 dark:text-slate-200">
                        {ticket.translated_text}
                      </div>
                    </div>
                  )}

                  {/* Location & GPS */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Location Information
                    </span>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{ticket.location_text || 'No location description given'}</span>
                    </div>
                    {ticket.latitude !== null && ticket.longitude !== null && (
                      <p className="text-xs font-mono text-slate-500 mt-1 ml-6">
                        Coordinates: {ticket.latitude}, {ticket.longitude}
                      </p>
                    )}
                  </div>
                </div>

                {/* Photo & Evidence */}
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Photographic Proof
                  </span>
                  {ticket.photo_path ? (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <a href={ticket.photo_path} target="_blank" rel="noopener noreferrer" title="Click to view full photo">
                        <img
                          src={ticket.photo_path}
                          alt="Citizen Upload"
                          className="w-full h-56 object-contain hover:opacity-95 transition-opacity"
                        />
                      </a>
                      <p className="text-center text-xs text-slate-400 py-1">
                        Re-encoded JPEG on municipal server. Click to open full resolution.
                      </p>
                    </div>
                  ) : (
                    <div className="h-44 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-400">
                      No photographic proof attached to this ticket.
                    </div>
                  )}
                </div>
              </div>

              {/* AI Classification & Safety Rationale */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    AI Triage & Safety Analysis
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 capitalize">
                    Method: {ticket.ai_classification_method.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500">Classified Category:</span>
                    <p className="font-semibold capitalize text-slate-900 dark:text-slate-100">
                      {ticket.category}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Severity Assessment:</span>
                    <div className="mt-0.5">
                      <SeverityBadge severity={ticket.severity} />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Model Confidence:</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {(ticket.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500">Safety Rationale:</span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {ticket.severity_reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Primary Routed Department:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {ticket.primary_department}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Secondary Department:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {ticket.secondary_department || 'None assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Linked Duplicates Section */}
              {ticket.duplicates && ticket.duplicates.length > 0 && (
                <div className="p-4 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-2">
                    Linked Duplicate Grievances ({ticket.duplicates.length})
                  </h4>
                  <div className="space-y-2">
                    {ticket.duplicates.map((dup) => (
                      <div
                        key={dup.id}
                        className="text-xs p-2 rounded bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 flex items-center justify-between"
                      >
                        <span className="font-mono font-medium text-indigo-700 dark:text-indigo-400">
                          {dup.id}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-xs">
                          {dup.raw_text || dup.location_text}
                        </span>
                        <span className="text-slate-400">
                          {new Date(dup.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Work Completion Dossier (If Resolved) */}
              {(ticket.has_completion_photo || ticket.completion_summary) && (
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">
                      Verified Field Resolution Proof
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block mb-1">
                        Work Completion Summary:
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900">
                        {ticket.completion_summary || ticket.resolution_notes}
                      </p>
                      {ticket.resolved_at && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          Resolved on: {new Date(ticket.resolved_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 font-semibold block mb-1">
                        Completed Work Photo Proof:
                      </span>
                      {ticket.completion_photo_path ? (
                        <div className="rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900">
                          <a href={ticket.completion_photo_path} target="_blank" rel="noopener noreferrer">
                            <img
                              src={ticket.completion_photo_path}
                              alt="Completed Resolution Proof"
                              className="w-full h-44 object-contain"
                            />
                          </a>
                        </div>
                      ) : (
                        <div className="p-4 text-xs text-slate-400 italic bg-white dark:bg-slate-900 rounded-lg">
                          No photo proof uploaded.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution Action Trigger / Form */}
              {ticket.status !== 'resolved' && (
                <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-300 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                        Formal Issue Completion Sign-Off
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Once repairs are finished, provide a completion summary and upload on-site photographic proof.
                      </p>
                    </div>
                    {!showResolveForm && (
                      <button
                        type="button"
                        onClick={() => setShowResolveForm(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolve Issue Now</span>
                      </button>
                    )}
                  </div>

                  {showResolveForm && (
                    <form onSubmit={handleResolveSubmit} className="pt-3 border-t border-emerald-200 dark:border-emerald-900 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Completion Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows="2"
                          value={completionSummary}
                          onChange={(e) => setCompletionSummary(e.target.value)}
                          placeholder="Detail the work carried out (e.g., Pothole excavated, cold-mix asphalt laid and leveled flush with road)."
                          className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Upload Completed / After Photo Proof <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          required
                          accept="image/jpeg,image/png"
                          onChange={handlePhotoSelect}
                          className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 dark:file:bg-emerald-950 dark:file:text-emerald-300 hover:file:bg-emerald-200"
                        />
                        {completionPhotoPreview && (
                          <div className="mt-2 w-32 h-24 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                            <img src={completionPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowResolveForm(false)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={resolving}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
                        >
                          {resolving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Submitting proof...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Submit Resolution &amp; Close</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Manual Override & Officer Action Form */}
              <div className="p-5 rounded-lg border-2 border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Officer Action & Manual Override Controls
                  </h3>
                </div>

                <form onSubmit={handleSaveOverrides} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Status Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Lifecycle Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 focus:border-blue-600 focus:outline-none"
                      >
                        {ALLOWED_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Override */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Override Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 focus:border-blue-600 focus:outline-none capitalize"
                      >
                        {ALLOWED_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Severity Override */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Override Severity
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 focus:border-blue-600 focus:outline-none"
                      >
                        {ALLOWED_SEVERITIES.map((sev) => (
                          <option key={sev} value={sev}>
                            {sev}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Assigned Officer / Contractor
                      </label>
                      <input
                        type="text"
                        value={assignedOfficer}
                        onChange={(e) => setAssignedOfficer(e.target.value)}
                        placeholder="e.g. Officer K. Sharma (Ward 104)"
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Resolution Summary
                      </label>
                      <input
                        type="text"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="e.g. Pothole filled and compacted with asphalt"
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Override Justification (Required for Audit Trail)
                    </label>
                    <input
                      type="text"
                      required
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Reclassified to High due to proximity to primary school gate"
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updating}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
                    >
                      {updating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating dossier...</span>
                        </>
                      ) : (
                        <span>Commit Override & Update</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Complete Audit History Log */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Municipal Audit Trail
                </h4>
                {ticket.audit_logs && ticket.audit_logs.length > 0 ? (
                  <div className="space-y-2">
                    {ticket.audit_logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
                          <span className="capitalize font-semibold text-blue-700 dark:text-blue-400">
                            {log.action.replace(/_/g, ' ')}
                            {log.field_changed ? ` (${log.field_changed})` : ''}
                          </span>
                          <span className="text-slate-400">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.old_value && log.new_value && (
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                            Changed from <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{log.old_value}</span> to <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{log.new_value}</span>
                          </p>
                        )}
                        <p className="text-slate-500 dark:text-slate-400 italic mt-0.5">
                          "{log.reason}" - by {log.officer_name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No overrides recorded. Initial intake triage unchanged.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
