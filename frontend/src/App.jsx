/**
 * CivicLens Main Application Root
 * Role-Based Access Control for Administrators (Municipal Officers) and Citizens.
 * Theme follows reference styling: Charcoal Black (#171717), Forest Green (#06110C), Crimson Red (#A31C1B).
 * Ambient WebGL particle ribbon background via GhostFibers (#5cf6d9 & #4ac568).
 * StaggeredMenu positioned on the LEFT side with embedded interactive OptionWheel.
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
import GhostFibers from './components/reactbits/GhostFibers';
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
    'Report Issue',
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

  const handleOpenStaggeredMenu = () => {
    // Trigger click on StaggeredMenu toggle button on the left
    const toggleBtn = document.querySelector('.sm-toggle');
    if (toggleBtn) {
      toggleBtn.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06110C] text-[#f4f4f5] relative transition-colors selection:bg-[#A31C1B] selection:text-white">
      {/* Ambient Dynamic Background Canvas using GhostFibers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <GhostFibers
          glowColor="#5cf6d9"
          layers={3}
          twist={1.2}
          threads={72}
          fiberStyle="dots"
          depthOfField={0.85}
          hoverEffect="focus"
          intro={true}
          mouseInteraction={true}
          secondaryColor="#4ac568"
          className="w-full h-full opacity-65"
        />
      </div>

      {/* Staggered Navigation Menu positioned on the LEFT side with embedded interactive OptionWheel */}
      <StaggeredMenu
        isFixed={true}
        position="left"
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

      {/* Navigation Header with Menu on LEFT */}
      <div className="relative z-30">
        <Navbar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSignOut={currentUser ? handleSignOut : null}
          onOpenStaggeredMenu={handleOpenStaggeredMenu}
        />
      </div>

      {/* Main Content View Switcher with Translucent Backdrops so GhostFibers shines through */}
      <main className="flex-1 relative z-10">
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
      <footer className="relative z-10 py-5 border-t border-[#1c2e24]/70 text-xs text-zinc-400 bg-[#06110C]/85 backdrop-blur-md">
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
              className="text-zinc-400 hover:text-[#5cf6d9] transition-colors hover:underline"
            >
              Privacy Policy
            </button>
            <span className="text-zinc-700">&bull;</span>
            <button
              onClick={() => setActiveTab('terms')}
              className="text-zinc-400 hover:text-[#5cf6d9] transition-colors hover:underline"
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
