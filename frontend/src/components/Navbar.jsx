/**
 * CivicLens Navigation Bar
 * Responsive role-aware top bar with distinct navigation for Administrators and Citizens,
 * session indicator, role switcher, and dark mode toggle.
 */

import React from 'react';
import { APP_NAME } from '../config';
import { 
  ShieldAlert, 
  Sun, 
  Moon, 
  FileText, 
  Search, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  User, 
  LogOut,
  AlertTriangle 
} from './Icons';

export default function Navbar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode, 
  onSignOut 
}) {
  // Navigation tabs configured strictly by authenticated role
  const citizenNav = [
    { id: 'intake', label: 'Report an Issue', icon: FileText },
    { id: 'track', label: 'Track Report', icon: Search },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  ];

  const adminNav = [
    { id: 'reports', label: 'Reports', icon: Layers },
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
    { id: 'logs', label: 'Logs', icon: ShieldCheck },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'tracking', label: 'Tracking', icon: Search },
  ];

  const currentNav = currentUser?.role === 'admin' ? adminNav : citizenNav;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  setActiveTab('reports');
                } else {
                  setActiveTab('intake');
                }
              }}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {APP_NAME}
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {currentUser?.role === 'admin' ? 'Officer Portal' : 'Citizen Portal'}
                </span>
              </div>
            </button>
          </div>

          {/* Role Navigation Items */}
          {currentUser && (
            <nav className="flex items-center gap-1 sm:gap-2">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Area: User Session, Sign Out & Theme */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                {currentUser.role === 'admin' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="font-medium text-slate-700 dark:text-slate-300 max-w-[130px] truncate">
                  {currentUser.name}
                </span>
              </div>
            )}

            {currentUser && onSignOut && (
              <button
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign out and switch role"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch Role</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
