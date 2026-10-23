/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  Clock, 
  BarChart3, 
  Bookmark, 
  User, 
  Sparkles, 
  Calculator as CalcIcon,
  Zap,
  Menu,
  X,
  Target
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab = 
  | 'landing'
  | 'dashboard'
  | 'subjects'
  | 'planner'
  | 'pyq'
  | 'mock'
  | 'visualizer'
  | 'analytics'
  | 'revision'
  | 'profile';

interface Props {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: UserProfile;
  onOpenCalculator: () => void;
  daysRemaining: number;
}

export const Navigation: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenCalculator,
  daysRemaining
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Syllabus Tracker', icon: BookOpen, badge: '11 Subs' },
    { id: 'planner', label: 'Smart Planner', icon: Calendar },
    { id: 'pyq', label: 'PYQ Practice', icon: FileText, badge: 'Official' },
    { id: 'mock', label: 'Mock Tests (TCS)', icon: Clock, badge: 'Live' },
    { id: 'visualizer', label: '3D EE Lab', icon: Zap, badge: '3D' },
    { id: 'analytics', label: 'Analytics & AIR', icon: BarChart3 },
    { id: 'revision', label: 'Formula Book', icon: Bookmark, badge: 'Leitner' },
    { id: 'profile', label: 'Goals & Profile', icon: User },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                G
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  GATETrack <span className="text-amber-400 font-black">AI</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 block -mt-0.5">
                  Electrical Engineering (EE)
                </span>
              </div>
            </button>
          </div>

          {/* Center Info: Countdown & Target */}
          <div className="hidden md:flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">
                GATE {profile.targetYear}:
              </span>
              <span className="font-mono font-bold text-amber-400">
                {daysRemaining} Days Left
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">Target AIR:</span>
              <span className="font-mono font-bold text-emerald-400">
                &lt; {profile.targetAIR}
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* GATE Virtual Calculator Button */}
            <button
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-sm transition-all hover:border-amber-500/50"
              title="Open Official GATE Virtual Calculator"
            >
              <CalcIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">GATE Calculator</span>
            </button>

            {/* User Profile Badge */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                {profile.name[0] || 'V'}
              </div>
              <span className="font-semibold hidden lg:inline">{profile.name}</span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Desktop Sticky Sub-Navigation Bar */}
      <nav className="hidden md:block w-full bg-slate-900 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
