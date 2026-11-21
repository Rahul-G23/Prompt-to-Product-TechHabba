/**
 * CivicLens Role-Based Authentication Gateway
 * Provides distinct, authenticated access for Administrators (Municipal Officers) and Citizens.
 */

import React, { useState } from 'react';
import { Shield, User, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle } from './Icons';
import { loginUser } from '../services/api';
import { APP_NAME } from '../config';

export default function LoginPage({ onLoginSuccess }) {
  const [activeRoleTab, setActiveRoleTab] = useState('citizen'); // 'citizen' or 'admin'

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Citizen form state
  const [citizenPhone, setCitizenPhone] = useState('9845112233');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser({
        role: 'admin',
        username: adminUsername,
        password: adminPassword,
      });
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials. Demo password is "admin123".');
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser({
        role: 'citizen',
        phone_number: citizenPhone,
      });
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Citizen login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Welcome to {APP_NAME}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            Municipal AI Grievance Triage, Routing &amp; Verification Platform
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={() => { setActiveRoleTab('citizen'); setError(null); }}
            className={`py-3.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeRoleTab === 'citizen'
                ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Login as Citizen</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRoleTab('admin'); setError(null); }}
            className={`py-3.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeRoleTab === 'admin'
                ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Login as Administrator</span>
          </button>
        </div>

        {/* Content Card Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-900 border border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-800 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeRoleTab === 'citizen' ? (
            /* Citizen Login Flow */
            <form onSubmit={handleCitizenLogin} className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-blue-900 dark:text-blue-300 block mb-1">
                  Citizen Portal Access
                </span>
                Citizens can lodge civic complaints in any Indian regional language, track resolution progress with live status, and inspect public municipal analysis.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number / Citizen ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2.5 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Demo default pre-filled. No OTP required for prototype evaluation.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                <span>{loading ? 'Entering Portal...' : 'Continue to Citizen Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => handleCitizenLogin({ preventDefault: () => {} })}
                  className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-medium"
                >
                  Quick Demo Access: Enter as Ward Resident &rarr;
                </button>
              </div>
            </form>
          ) : (
            /* Administrator Login Flow */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                  Municipal Officer Access
                </span>
                Officers can inspect prioritized grievance queues, manage issues, view complete audit logs, access advanced analytics, and record mandatory completion summaries with photo proof.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Officer Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2.5 focus:border-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2.5 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Demo credentials: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">admin</code> / <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">admin123</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('admin');
                    setAdminPassword('admin123');
                    handleAdminLogin({ preventDefault: () => {} });
                  }}
                  className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-medium"
                >
                  Quick Demo Access: Sign In as Duty Officer &rarr;
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
