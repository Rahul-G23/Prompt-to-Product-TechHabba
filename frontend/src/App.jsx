/**
 * CivicLens Main Application Root
 * Role-Based Access Control for Administrators (Municipal Officers) and Citizens.
 * Theme follows reference styling: Charcoal Black (#171717), Forest Green (#06110C), Crimson Red (#A31C1B).
 * Ambient WebGL particle ribbon background via GhostFibers (#5cf6d9 & #4ac568).
 * StaggeredMenu positioned on the LEFT side with embedded interactive OptionWheel.
 */

import React, { useState, useEffect, useRef } from 'react';
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
    <div className="min-h-screen flex flex-col bg-[#07071f] text-[#f4f4ff] relative transition-colors selection:bg-[#7c3cff] selection:text-white">
      {/* Ambient Dynamic Background Canvas using GhostFibers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <GhostFibers
          glowColor="#67e8f9"
          layers={3}
          twist={1.2}
          threads={72}
          fiberStyle="dots"
          depthOfField={0.85}
          hoverEffect="focus"
          intro={true}
          mouseInteraction={true}
          secondaryColor="#7c3cff"
          className="w-full h-full opacity-65"
        />
      </div>

      {/* Staggered Navigation Menu positioned on the LEFT side with embedded interactive OptionWheel */}
      {currentUser && (
        <StaggeredMenu
          isFixed={true}
          position="left"
          colors={['#07071f', '#11113a', '#7c3cff']}
          accentColor="#67e8f9"
          menuButtonColor="#ffffff"
          openMenuButtonColor="#67e8f9"
          brandTitle={APP_NAME}
          items={staggeredMenuItems}
          showWheel={true}
          wheelItems={activeWheelItems}
          wheelSelectedIndex={wheelIndex >= 0 ? wheelIndex : 0}
          onWheelChange={handleWheelSelect}
          onLogout={handleSignOut}
        />
      )}

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

    </div>
  );
}
