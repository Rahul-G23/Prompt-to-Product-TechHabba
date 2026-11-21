/**
 * CivicLens Navigation Bar
 * Responsive role-aware top bar with distinct navigation for Administrators and Citizens,
 * session indicator, role switcher, StaggeredMenu trigger, and dark mode toggle.
 * Follows editorial Charcoal Black (#171717), Forest Green (#06110C), and Crimson Red (#A31C1B).
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
  AlertTriangle,
  Menu
} from './Icons';

export default function Navbar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode, 
  onSignOut,
  onOpenStaggeredMenu
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
    <header className="sticky top-0 z-40 bg-[#171717]/95 border-b border-[#262626] backdrop-blur shadow-md">
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
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-md bg-[#A31C1B] text-white flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white uppercase">
                    {APP_NAME}
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-[#06110C] text-[#A31C1B] border border-[#A31C1B]/40">
                    AI Triage
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">
                  {currentUser?.role === 'admin' ? 'Municipal Officer Console' : 'Citizen Grievance Portal'}
                </div>
              </div>
            </button>
          </div>

          {/* Role Navigation Items */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                      isActive
                        ? 'bg-[#A31C1B] text-white shadow-sm'
                        : 'text-zinc-300 hover:text-white hover:bg-[#242424]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Area: User Session, StaggeredMenu Trigger, Role Switch & Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#06110C] border border-[#262626] text-xs">
                {currentUser.role === 'admin' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-[#A31C1B]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="font-medium text-zinc-200 max-w-[130px] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-[#171717] text-zinc-400 border border-[#2a2a2a]">
                  {currentUser.role}
                </span>
              </div>
            )}

            {/* Staggered Menu / Option Wheel Trigger Button */}
            <button
              onClick={onOpenStaggeredMenu}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#06110C] hover:bg-[#202020] border border-[#A31C1B]/50 text-xs font-bold text-white transition-all shadow-sm"
              title="Open Navigation Menu & Option Wheel"
            >
              <Menu className="w-3.5 h-3.5 text-[#A31C1B]" />
              <span className="tracking-wide uppercase text-[11px]">Wheel Menu</span>
            </button>

            {currentUser && onSignOut && (
              <button
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#2e2e2e] text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#242424] transition-colors"
                title="Sign out and switch role"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch Role</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-[#242424] transition-colors"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-300" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
