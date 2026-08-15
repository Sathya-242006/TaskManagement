import React, { useState } from 'react';
import {
  Kanban,
  List,
  Calendar as CalendarIcon,
  Grid,
  BarChart3,
  Plus,
  Sparkles,
  RefreshCw,
  LogOut,
  UserCheck,
  Radio,
  CheckCircle2,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks, ViewMode } from '../context/TaskContext';

export const Header: React.FC = () => {
  const { user, logout, quickDemoLogin } = useAuth();
  const {
    viewMode,
    setViewMode,
    openCreateTaskModal,
    openAiModal,
    isRealtimeConnected,
    isSyncing,
    refreshData,
    resetToDemoData,
    setIsAuthModalOpen,
  } = useTasks();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const viewButtons: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'kanban', label: 'Board', icon: <Kanban className="w-4 h-4" /> },
    { id: 'list', label: 'List', icon: <List className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'matrix', label: 'Matrix', icon: <Grid className="w-4 h-4" /> },
    { id: 'analytics', label: 'Metrics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const demoAccounts = [
    { name: 'Alex Rivera', role: 'admin', email: 'alex@taskflow.dev', color: '#3b82f6' },
    { name: 'Priya Sharma', role: 'member', email: 'priya@taskflow.dev', color: '#10b981' },
    { name: 'Jordan Lee', role: 'member', email: 'jordan@taskflow.dev', color: '#8b5cf6' },
    { name: 'Taylor Chen', role: 'viewer', email: 'taylor@taskflow.dev', color: '#f59e0b' },
  ];

  return (
    <header className="bg-[#0A0A0A] border-b border-[#222] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo & Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3B82F6] flex items-center justify-center text-black font-black text-sm">
              ■
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-white tracking-tighter uppercase select-none">
                  TaskFlow<span className="text-[#3B82F6]">.</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#262626] bg-[#141414] text-[10px] font-bold uppercase tracking-[0.15em] text-[#888]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isRealtimeConnected ? 'bg-[#3B82F6] animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {isRealtimeConnected ? 'LIVE SYNC' : 'CONNECTING'}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold hidden sm:block">
                Full-Stack Collaborative Workspace
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <nav className="hidden md:flex items-center p-1 bg-[#121212] border border-[#222]">
            {viewButtons.map((btn) => {
              const isActive = viewMode === btn.id;
              return (
                <button
                  key={btn.id}
                  id={`view-btn-${btn.id}`}
                  onClick={() => setViewMode(btn.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#3B82F6] text-black shadow-xs'
                      : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                >
                  {btn.icon}
                  {btn.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons & User Menu */}
          <div className="flex items-center gap-2">
            {/* Sync & Refresh Button */}
            <button
              id="refresh-tasks-btn"
              onClick={() => refreshData()}
              title="Refresh and sync data"
              className={`p-2 border border-[#222] bg-[#121212] text-[#888] hover:text-white hover:border-[#444] transition-colors ${
                isSyncing ? 'animate-spin text-[#3B82F6]' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* AI Assistant Button */}
            <button
              id="ai-assistant-btn"
              onClick={() => openAiModal()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#161616] border border-[#333] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              AI ARCHITECT
            </button>

            {/* New Task Button */}
            {user?.role !== 'viewer' && (
              <button
                id="create-task-header-btn"
                onClick={() => openCreateTaskModal('todo')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#3B82F6] hover:bg-white transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>NEW TASK +</span>
              </button>
            )}

            {/* User Profile & Demo Switcher */}
            <div className="relative ml-1">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 border border-[#333] hover:border-[#3B82F6] transition-colors focus:outline-none"
              >
                <div
                  className="w-7 h-7 flex items-center justify-center text-white text-xs font-black uppercase"
                  style={{ backgroundColor: user?.color || '#3b82f6' }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-76 bg-[#111] border border-[#262626] py-2 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-2xl"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-[#222]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{user?.name}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#333] text-[9px] font-black uppercase tracking-[0.15em] bg-[#1a1a1a] text-[#3B82F6]">
                        <Shield className="w-3 h-3" />
                        {user?.role}
                      </span>
                    </div>
                    <p className="text-xs text-[#666] truncate mt-0.5 font-mono">{user?.email}</p>
                  </div>

                  {/* Switch Demo Persona */}
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-2 px-1">
                      Switch Active User
                    </p>
                    <div className="space-y-1">
                      {demoAccounts.map((acc) => {
                        const isCurrent = user?.email === acc.email;
                        return (
                          <button
                            key={acc.email}
                            onClick={async () => {
                              await quickDemoLogin(acc.email);
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors border ${
                              isCurrent
                                ? 'bg-[#1A1A1A] border-[#3B82F6] text-white font-bold'
                                : 'border-transparent text-[#999] hover:text-white hover:bg-[#161616]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5"
                                style={{ backgroundColor: acc.color }}
                              />
                              <span className="font-bold uppercase tracking-tight">{acc.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#666] uppercase">
                              {isCurrent ? '✓ ACTIVE' : acc.role}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-[#222] pt-1 px-2">
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          resetToDemoData();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-400 hover:bg-[#1c1408] border border-transparent hover:border-amber-900 transition-colors uppercase font-bold tracking-wider"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Sample Workspace
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#aaa] hover:text-white hover:bg-[#161616] transition-colors uppercase font-bold tracking-wider"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#666]" />
                      Sign In / Register
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-[#200a0a] transition-colors uppercase font-bold tracking-wider"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="md:hidden flex items-center justify-between pb-3 pt-1 border-t border-[#222] overflow-x-auto gap-1">
          {viewButtons.map((btn) => {
            const isActive = viewMode === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setViewMode(btn.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#3B82F6] text-black'
                    : 'text-[#888] hover:text-white hover:bg-[#161616]'
                }`}
              >
                {btn.icon}
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
