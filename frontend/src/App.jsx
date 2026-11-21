/**
 * CivicLens Main Application Root
 * Role-Based Access Control for Administrators (Municipal Officers) and Citizens.
 * Theme follows reference styling: Charcoal Black (#171717), Forest Green (#06110C), Crimson Red (#A31C1B).
 * Integrates StaggeredMenu with embedded OptionWheel and RotatingText.
 */

import React, { useState, useEffect, useRef } from 'react';
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
import StaggeredMenu from './components/reactbits/StaggeredMenu';
import RotatingText from './components/reactbits/RotatingText';
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

  // Initialize Dark Mode by default to match editorial theme
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('civiclens_theme');
    if (saved) return saved === 'dark';
    return true; // Default to rich dark mode matching the editorial image
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

  // Navigation mappings for StaggeredMenu and OptionWheel
  const citizenWheelItems = [
    'Report an Issue',
    'Track Report',
    'Civic Analysis',
    'Privacy Policy',
    'Terms of Service'
  ];
  const citizenTabMap = ['intake', 'track', 'analysis', 'privacy', 'terms'];

  const adminWheelItems = [
    'Reports Queue',
    'Active Issues',
    'Audit Logs',
    'Civic Analysis',
    'Tracking Dossier'
  ];
  const adminTabMap = ['reports', 'issues', 'logs', 'analysis', 'tracking'];

  const activeWheelItems = currentUser?.role === 'admin' ? adminWheelItems : citizenWheelItems;
  const activeTabMap = currentUser?.role === 'admin' ? adminTabMap : citizenTabMap;
  const wheelIndex = Math.max(0, activeTabMap.indexOf(activeTab));

  const staggeredMenuItems = activeWheelItems.map((label, idx) => ({
    label,
    link: '#',
    onClick: () => {
      setActiveTab(activeTabMap[idx]);
    }
  }));

  const handleWheelSelect = (idx) => {
    if (activeTabMap[idx]) {
      setActiveTab(activeTabMap[idx]);
    }
  };

  const staggeredMenuRef = useRef(null);
  const handleOpenStaggeredMenu = () => {
    // Trigger click on StaggeredMenu toggle button
    const toggleBtn = document.querySelector('.sm-toggle');
    if (toggleBtn) {
      toggleBtn.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06110C] text-[#f4f4f5] transition-colors selection:bg-[#A31C1B] selection:text-white">
      {/* Staggered Navigation Menu with OptionWheel presented on open */}
      <StaggeredMenu
        isFixed={true}
        position="right"
        colors={['#06110C', '#171717', '#A31C1B']}
        accentColor="#A31C1B"
        menuButtonColor="#ffffff"
        openMenuButtonColor="#A31C1B"
        brandTitle={APP_NAME}
        items={staggeredMenuItems}
        showWheel={true}
        wheelItems={activeWheelItems}
        wheelSelectedIndex={wheelIndex >= 0 ? wheelIndex : 0}
        onWheelChange={handleWheelSelect}
      />

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSignOut={currentUser ? handleSignOut : null}
        onOpenStaggeredMenu={handleOpenStaggeredMenu}
      />

      {/* High-Impact Editorial Hero Announcement Banner with RotatingText */}
      <div className="bg-[#171717] border-b border-[#242424] px-4 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#A31C1B] animate-pulse" />
            <span className="font-extrabold tracking-wider text-white uppercase text-[11px]">
              CIVIC INTELLIGENCE
            </span>
            <span className="text-zinc-600 hidden sm:inline">&bull;</span>
            <div className="inline-flex items-center">
              <RotatingText
                texts={[
                  'SAFETY-CRITICAL FIRST',
                  'INSTANT MUNICIPAL ROUTING',
                  '100% IMMUTABLE AUDIT TRAIL',
                  'REGIONAL LANGUAGE AI'
                ]}
                mainClassName="px-2.5 py-0.5 rounded bg-[#A31C1B] text-white font-black text-[11px] uppercase tracking-wide shadow-sm"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3500}
              />
            </div>
            <span className="text-zinc-400 text-[11px] hidden lg:inline">
              Automated multi-lingual civic triage &amp; lifecycle verification
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            <span className="text-[#A31C1B] font-bold tracking-wider">BUILT DIFFERENTLY</span>
            <span>&bull;</span>
            <span className="text-zinc-500">CHARCOAL #171717 / FOREST #06110C / CRIMSON #A31C1B</span>
          </div>
        </div>
      </div>

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
      <footer className="py-6 border-t border-[#1f1f1f] text-xs text-zinc-400 bg-[#06110C]/90">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-white uppercase tracking-wider">
              {APP_NAME} &bull; MUNICIPAL AI GRIEVANCE SYSTEM
            </span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="text-[11px] text-zinc-400">
              Zero PII forward to LLM &bull; WCAG AA Compliant &bull; Multilingual
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('privacy')}
              className="text-zinc-400 hover:text-[#A31C1B] transition-colors hover:underline"
            >
              Privacy Policy
            </button>
            <span className="text-zinc-700">&bull;</span>
            <button
              onClick={() => setActiveTab('terms')}
              className="text-zinc-400 hover:text-[#A31C1B] transition-colors hover:underline"
            >
              Terms &amp; Conditions
            </button>
            <span className="text-zinc-700">&bull;</span>
            <button
              onClick={handleSignOut}
              className="text-[#A31C1B] font-bold hover:underline"
            >
              {currentUser ? `Sign Out (${currentUser.role})` : 'Role Sign In'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
