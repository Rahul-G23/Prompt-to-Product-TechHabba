/**
 * CivicLens Terms & Conditions
 * Municipal service charter, SLA guidelines, and genuine grievance reporting regulations.
 */

import React from 'react';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle } from './Icons';
import { APP_NAME } from '../config';

export default function TermsConditions({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Application</span>
        </button>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-700 text-white">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {APP_NAME} Terms of Service &amp; Grievance Charter
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Municipal Citizen Redressal Regulations &bull; Last Revised: November 2026
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            1. Scope of Municipal Grievance Redressal
          </h2>
          <p>
            {APP_NAME} is an automated triage and routing system designed for reporting civic infrastructure defects, including roads and potholes, solid waste management, drinking water supply, sewage and drainage, streetlights and electrical hazards, fallen trees, encroachments, noise pollution, and stray animals.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            2. Emergency Life-Safety Situations
          </h2>
          <p>
            While issues classified as <strong>Critical</strong> (e.g., exposed sparking high-voltage wires, uncovered manholes on active roads) are prioritized to top emergency dispatch queues, {APP_NAME} is an asynchronous triage system. For active fires, ongoing building collapses, or police emergencies, citizens should immediately dial national emergency numbers <strong>112</strong> or <strong>101</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            3. Genuine Grievance Submission Standards
          </h2>
          <p>
            Users are required to submit genuine complaints reflecting actual civic hazards within municipal limits. Submissions must not contain:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Defamatory, abusive, obscene, or racially discriminatory language.</li>
            <li>Adversarial prompt injection commands intended to deceive automated triage systems.</li>
            <li>Staged, fabricated, or digitally generated deceptive photos.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            4. Service Level Agreements (SLAs) &amp; Prioritization
          </h2>
          <p>
            Work orders are assigned based on human safety severity:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
              <span className="font-bold text-red-900 dark:text-red-300">Critical Severity:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">Target response within 2 to 4 hours. Immediate life hazard or danger to human life.</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="font-bold text-amber-900 dark:text-amber-300">High Severity:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">Target response within 12 to 24 hours. Serious safety threat or major traffic disruption.</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <span className="font-bold text-blue-900 dark:text-blue-300">Medium Severity:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">Target response within 48 to 72 hours. Public hygiene issues, overflowing bins, minor leaks.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-200">Low Severity:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">Target response within 5 to 7 working days. Routine maintenance and cosmetic defects.</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            5. Mandatory Verification of Work Completion
          </h2>
          <p>
            Under municipal quality assurance protocols, no ticket may be transitioned to "Resolved" status without an accompanying verified field completion summary and photographic proof uploaded by the assigned municipal officer or authorized contractor.
          </p>
        </section>
      </div>
    </div>
  );
}
