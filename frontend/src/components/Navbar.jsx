/**
 * CivicLens Navigation Bar
 * Responsive role-aware top bar with Menu toggle on the LEFT side,
 * session indicator, role switcher, and theme styling matching GhostFibers background.
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
    { id: 'intake', label: 'Report Issue', icon: FileText },
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
    <header className="sticky top-0 z-40 bg-[#06110C]/85 border-b border-[#1c2e24]/70 backdrop-blur-md shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Area: Menu Button on Left + Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Menu Trigger Button on the LEFT side */}
            <button
              onClick={onOpenStaggeredMenu}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#171717]/90 hover:bg-[#222222] border border-[#A31C1B]/50 text-xs font-bold text-white transition-all shadow-md group"
              title="Open Navigation Menu & Option Wheel"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4 text-[#A31C1B] group-hover:scale-110 transition-transform" />
              <span className="tracking-wide uppercase text-[11px] font-mono">Menu / Wheel</span>
            </button>

            {/* Brand Logo & Name */}
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
              <div className="w-8 h-8 rounded-md bg-[#A31C1B] text-white flex items-center justify-center font-bold text-base shadow-sm transition-transform group-hover:scale-105">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white uppercase">
                    {APP_NAME}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5cf6d9] animate-pulse shadow-[0_0_6px_#5cf6d9]" />
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {currentUser?.role === 'admin' ? 'Officer Portal' : 'Citizen Grievance'}
                </span>
              </div>
            </button>
          </div>

          {/* Role Navigation Items in Middle */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1.5">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      isActive
                        ? 'bg-[#A31C1B] text-white shadow-[0_0_10px_rgba(163,28,27,0.4)]'
                        : 'text-zinc-300 hover:text-white hover:bg-[#171717]/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Area: User Session, Role Switch & Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#171717]/80 border border-[#262626] text-xs">
                {currentUser.role === 'admin' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-[#A31C1B]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#5cf6d9]" />
                )}
                <span className="font-medium text-zinc-200 max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-[#06110C] text-[#5cf6d9] border border-[#5cf6d9]/30">
                  {currentUser.role}
                </span>
              </div>
            )}

            {currentUser && onSignOut && (
              <button
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#2e2e2e] text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#171717] transition-colors"
                title="Sign out and switch role"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch Role</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-[#171717] transition-colors"
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
