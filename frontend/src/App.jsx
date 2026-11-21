/**
 * CivicLens Main Application Root
 * State management for views, dark mode, and seamless civic workflows.
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ComplaintForm from './components/ComplaintForm';
import TrackTicket from './components/TrackTicket';
import OfficerDashboard from './components/OfficerDashboard';
import AnalyticsView from './components/AnalyticsView';
import { APP_NAME } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('intake');
  const [trackedTicketId, setTrackedTicketId] = useState(null);

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

  const handleTrackTicket = (ticketId) => {
    setTrackedTicketId(ticketId);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'intake' && (
          <ComplaintForm onTrackTicket={handleTrackTicket} />
        )}
        {activeTab === 'track' && (
          <TrackTicket initialTicketId={trackedTicketId} />
        )}
        {activeTab === 'officer' && (
          <OfficerDashboard />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}
      </main>

      {/* Minimal Civic Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            {APP_NAME} &bull; Municipal AI Triage &amp; Prioritization System
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Open Access Municipal Prototype &bull; WCAG AA Compliant &bull; Multilingual Indian Languages
          </p>
        </div>
      </footer>
    </div>
  );
}
