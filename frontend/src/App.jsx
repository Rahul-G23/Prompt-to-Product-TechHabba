/**
 * CivicLens Main Application Root
 * Role-Based Access Control for Administrators (Municipal Officers) and Citizens,
 * theme management, verified work resolution workflows, and civic governance compliance.
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import ComplaintForm from './components/ComplaintForm';
import TrackTicket from './components/TrackTicket';
import OfficerDashboard from './components/OfficerDashboard';
import AdminIssuesView from './components/AdminIssuesView';
import AdminLogsView from './components/AdminLogsView';
import AnalyticsView from './components/AnalyticsView';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import TicketDetailModal from './components/TicketDetailModal';
import { APP_NAME } from './config';

export default function App() {
  // Current authenticated user session (saved in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('civiclens_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedUser = localStorage.getItem('civiclens_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return u.role === 'admin' ? 'reports' : 'intake';
      }
    } catch {}
    return 'intake';
  });

  const [trackedTicketId, setTrackedTicketId] = useState(null);
  const [selectedTicketModalId, setSelectedTicketModalId] = useState(null);

  // Initialize Dark Mode from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('civiclens_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('civiclens_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('civiclens_theme', 'light');
    }
  }, [darkMode]);

  // Login handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('civiclens_user', JSON.stringify(user));
    if (user.role === 'admin') {
      setActiveTab('reports');
    } else {
      setActiveTab('intake');
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('civiclens_user');
    setActiveTab('login');
  };

  const handleTrackTicket = (ticketId) => {
    setTrackedTicketId(ticketId);
    if (currentUser?.role === 'admin') {
      setActiveTab('tracking');
    } else {
      setActiveTab('track');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSignOut={currentUser ? handleSignOut : null}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {/* If Not Authenticated, show Login Page unless viewing Privacy or Terms */}
        {!currentUser && activeTab !== 'privacy' && activeTab !== 'terms' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}

        {/* Static Legal & Policy Pages (Accessible anytime) */}
        {activeTab === 'privacy' && (
          <PrivacyPolicy onBack={() => setActiveTab(currentUser?.role === 'admin' ? 'reports' : (currentUser ? 'intake' : 'login'))} />
        )}

        {activeTab === 'terms' && (
          <TermsConditions onBack={() => setActiveTab(currentUser?.role === 'admin' ? 'reports' : (currentUser ? 'intake' : 'login'))} />
        )}

        {/* Authenticated Citizen Views */}
        {currentUser?.role === 'citizen' && (
          <>
            {activeTab === 'intake' && (
              <ComplaintForm onTrackTicket={handleTrackTicket} />
            )}
            {activeTab === 'track' && (
              <TrackTicket initialTicketId={trackedTicketId} />
            )}
            {activeTab === 'analysis' && (
              <AnalyticsView />
            )}
          </>
        )}

        {/* Authenticated Administrator Views */}
        {currentUser?.role === 'admin' && (
          <>
            {activeTab === 'reports' && (
              <OfficerDashboard onSelectTicket={(id) => setSelectedTicketModalId(id)} />
            )}
            {activeTab === 'issues' && (
              <AdminIssuesView
                onSelectTicket={(id) => setSelectedTicketModalId(id)}
                onResolveTicket={(id) => setSelectedTicketModalId(id)}
              />
            )}
            {activeTab === 'logs' && (
              <AdminLogsView onSelectTicket={(id) => setSelectedTicketModalId(id)} />
            )}
            {activeTab === 'analysis' && (
              <AnalyticsView />
            )}
            {activeTab === 'tracking' && (
              <TrackTicket initialTicketId={trackedTicketId} />
            )}
          </>
        )}
      </main>

      {/* Global Ticket Dossier Modal for Administrator Views */}
      {selectedTicketModalId && (
        <TicketDetailModal
          ticketId={selectedTicketModalId}
          onClose={() => setSelectedTicketModalId(null)}
          onTicketUpdated={() => setSelectedTicketModalId(null)}
        />
      )}

      {/* Municipal Civic Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {APP_NAME} &bull; Municipal AI Triage &amp; Prioritization System
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Zero PII forward to LLM &bull; WCAG AA Compliant &bull; Multilingual
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('privacy')}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 hover:underline"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={() => setActiveTab('terms')}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 hover:underline"
            >
              Terms &amp; Conditions
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={handleSignOut}
              className="text-blue-700 dark:text-blue-400 font-medium hover:underline"
            >
              {currentUser ? `Sign Out (${currentUser.role})` : 'Role Sign In'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
