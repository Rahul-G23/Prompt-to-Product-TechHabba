/**
 * CivicLens Privacy Policy
 * Detailed civic privacy disclosures compliant with the Indian Digital Personal Data Protection Act (DPDP Act, 2023).
 */

import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2 } from './Icons';
import { APP_NAME } from '../config';

export default function PrivacyPolicy({ onBack }) {
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
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {APP_NAME} Citizen Data Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Effective Date: November 2026 &bull; Compliant with Digital Personal Data Protection (DPDP) Act, 2023
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            1. PII Protection & AI Isolation Guarantee
          </h2>
          <p>
            {APP_NAME} enforces strict architectural isolation between citizen Personally Identifiable Information (PII) and artificial intelligence processing pipelines. 
            When you submit a civic grievance, contact telephone numbers and personal identity records are stored strictly in the secure local municipal database for officer follow-up. 
            <strong> Citizen phone numbers and personal identifiers are never forwarded to AI models or third-party cloud inference providers.</strong>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            2. Image Sanitization & EXIF Data Stripping
          </h2>
          <p>
            All citizen inspection photos uploaded through the intake portal undergo automated server-side sanitization:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Embedded EXIF metadata, including camera serial numbers, device models, and device-level hardware identifiers, is permanently stripped upon ingestion.</li>
            <li>Images are validated, sanitized, and re-encoded server-side into standardized JPEG format to neutralize malicious embedded payloads.</li>
            <li>Only visual features relevant to the physical municipal hazard (such as potholes, fallen debris, or exposed wiring) are analyzed.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            3. Purpose-Bound Municipal Processing
          </h2>
          <p>
            Grievance data collected through {APP_NAME} is processed exclusively for the triage, dispatch, prioritization, and field resolution of municipal civic issues. Data is never monetized, traded, or shared with commercial advertising brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            4. Citizen Rights & Tracking Confidentiality
          </h2>
          <p>
            Public tracking of complaints via ticket identifier displays only operational triage details (category, routed department, priority status, resolution notes, and verified work proof). The complainant's identity and phone number remain concealed from public view.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            5. Officer Audit Trail & Accountability
          </h2>
          <p>
            All manual overrides of category, severity, and department routing, as well as work completion reports, are permanently recorded in an immutable municipal audit log. Every record captures the officer designation, timestamp, and justification reason.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            6. Grievance Officer Contact
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For data privacy inquiries or requests regarding recorded civic grievance records, please contact the Municipal Grievance Cell at <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">grievance@city.gov.in</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
