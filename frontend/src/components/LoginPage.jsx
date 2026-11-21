/**
 * CivicLens Role-Based Authentication Gateway
 * Provides distinct, authenticated access for Administrators (Municipal Officers) and Citizens.
 * Follows Charcoal Black (#171717), Forest Green (#06110C), and Crimson Red (#A31C1B) palette.
 * Features LogoLoop animation of verified municipal departments.
 */

import React, { useState } from 'react';
import { Shield, User, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle } from './Icons';
import { loginUser } from '../services/api';
import { APP_NAME } from '../config';
import LogoLoop from './reactbits/LogoLoop';

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

  // Partner municipal agencies for LogoLoop
  const partnerAgencies = [
    { title: "BBMP Roads", node: <span className="px-3.5 py-1.5 rounded-md bg-[#171717] border border-[#A31C1B]/40 text-xs font-bold text-zinc-200 uppercase tracking-wider">BBMP Roads &amp; Infra</span> },
    { title: "BWSSB Water", node: <span className="px-3.5 py-1.5 rounded-md bg-[#171717] border border-[#A31C1B]/40 text-xs font-bold text-zinc-200 uppercase tracking-wider">BWSSB Water &amp; Drainage</span> },
    { title: "BESCOM Power", node: <span className="px-3.5 py-1.5 rounded-md bg-[#171717] border border-[#A31C1B]/40 text-xs font-bold text-zinc-200 uppercase tracking-wider">BESCOM Electricity Board</span> },
    { title: "Fire & Rescue", node: <span className="px-3.5 py-1.5 rounded-md bg-[#171717] border border-[#A31C1B]/40 text-xs font-bold text-zinc-200 uppercase tracking-wider">State Fire &amp; Rescue</span> },
    { title: "Solid Waste", node: <span className="px-3.5 py-1.5 rounded-md bg-[#171717] border border-[#A31C1B]/40 text-xs font-bold text-zinc-200 uppercase tracking-wider">Solid Waste Directorate</span> },
    { title: "Traffic Command", node: <span className="px-3.5 py-1.5 rounded-md bg-[#171717] border border-[#A31C1B]/40 text-xs font-bold text-zinc-200 uppercase tracking-wider">City Traffic Police</span> },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-10 bg-transparent relative z-10">
      <div className="w-full max-w-lg bg-[#171717]/85 border border-[#2a2a2a]/80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
        {/* Editorial Header */}
        <div className="bg-[#101010]/90 text-white p-7 text-center border-b border-[#242424]/80 relative">
          <div className="w-12 h-12 mx-auto rounded-lg bg-[#A31C1B] flex items-center justify-center text-white mb-3 shadow-lg">
            <Shield className="w-7 h-7" />
          </div>
          <div className="inline-block mb-1 text-[10px] uppercase font-mono font-bold tracking-widest text-[#5cf6d9]">
            URBAN INTELLIGENCE &bull; MUNICIPAL AI
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            {APP_NAME} PORTAL
          </h1>
          <p className="text-xs text-zinc-300 mt-1 max-w-sm mx-auto">
            AI Triage &bull; Regional Language Processing &bull; Verifiable Resolution
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 border-b border-[#262626]/80 bg-[#0c0c0c]/80">

          <button
            type="button"
            onClick={() => { setActiveRoleTab('citizen'); setError(null); }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeRoleTab === 'citizen'
                ? 'border-[#A31C1B] text-white bg-[#171717]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-[#A31C1B]" />
            <span>Login as Citizen</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRoleTab('admin'); setError(null); }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeRoleTab === 'admin'
                ? 'border-[#A31C1B] text-white bg-[#171717]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-[#A31C1B]" />
            <span>Login as Administrator</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-7">
          {error && (
            <div className="mb-5 p-3 rounded-md bg-[#241212] text-red-200 border border-red-800 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-[#A31C1B] flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeRoleTab === 'citizen' ? (
            /* Citizen Login Flow */
            <form onSubmit={handleCitizenLogin} className="space-y-4">
              <div className="p-3.5 rounded-md bg-[#06110C] border border-[#262626] text-xs text-zinc-300">
                <span className="font-bold text-[#A31C1B] block mb-1 uppercase tracking-wide">
                  Citizen Portal Access
                </span>
                Citizens can lodge complaints in English or regional Indian languages, track real-time resolution progress, and inspect municipal analytics.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Mobile Number (Demo OTP Free)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Phone className="w-4 h-4 text-zinc-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2.5 rounded-md bg-[#0c0c0c] border border-[#333] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#A31C1B] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-[#A31C1B] hover:bg-[#871716] active:bg-[#6d1211] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Enter Citizen Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Administrator / Municipal Officer Flow */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 rounded-md bg-[#06110C] border border-[#262626] text-xs text-zinc-300">
                <span className="font-bold text-[#A31C1B] block mb-1 uppercase tracking-wide">
                  Administrator &amp; Officer Access
                </span>
                Authorized officers can manage reports, inspect audit logs, resolve issues with mandatory completion summaries &amp; photos, and review city-wide analytics.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md bg-[#0c0c0c] border border-[#333] text-sm text-white focus:outline-none focus:border-[#A31C1B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-md bg-[#0c0c0c] border border-[#333] text-sm text-white focus:outline-none focus:border-[#A31C1B] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-[#A31C1B] hover:bg-[#871716] active:bg-[#6d1211] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In as Officer'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-4 border-t border-[#242424] flex items-center justify-between text-[11px] text-zinc-400">
            <span>Demo Mode Active</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveRoleTab('citizen');
                  onLoginSuccess({
                    role: 'citizen',
                    phone: '9845112233',
                    name: 'Citizen Demo (Bengaluru)',
                    token: 'demo-citizen-token'
                  });
                }}
                className="text-[#A31C1B] hover:underline font-bold"
              >
                Instant Citizen
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => {
                  setActiveRoleTab('admin');
                  onLoginSuccess({
                    role: 'admin',
                    username: 'admin',
                    name: 'Officer Sharma (BBMP)',
                    department: 'Public Works',
                    token: 'demo-admin-token'
                  });
                }}
                className="text-[#A31C1B] hover:underline font-bold"
              >
                Instant Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Looping Marquee of Civic Departments */}
      <div className="w-full max-w-4xl mt-10">
        <div className="text-center mb-3">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-400">
            Direct Routing to Partner Municipal Agencies
          </span>
        </div>
        <div style={{ height: '48px', position: 'relative', overflow: 'hidden' }}>
          <LogoLoop
            logos={partnerAgencies}
            speed={45}
            direction="left"
            logoHeight={34}
            gap={32}
            hoverSpeed={15}
            scaleOnHover={true}
            ariaLabel="Partner Municipal Departments"
          />
        </div>
      </div>
    </div>
  );
}
