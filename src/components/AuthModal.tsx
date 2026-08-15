import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

export const AuthModal: React.FC = () => {
  const { user, login, register, quickDemoLogin } = useAuth();
  const { isAuthModalOpen, setIsAuthModalOpen } = useTasks();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoPresets = [
    {
      name: 'Alex Rivera',
      role: 'admin',
      desc: 'Full read/write/delete + reset permissions',
      email: 'alex@taskflow.dev',
      color: '#3b82f6',
    },
    {
      name: 'Priya Sharma',
      role: 'member',
      desc: 'Standard create, edit, and collaborate',
      email: 'priya@taskflow.dev',
      color: '#10b981',
    },
    {
      name: 'Jordan Lee',
      role: 'member',
      desc: 'Design and task workflow management',
      email: 'jordan@taskflow.dev',
      color: '#8b5cf6',
    },
    {
      name: 'Taylor Chen',
      role: 'viewer',
      desc: 'Read-only viewer (auditing & dashboards)',
      email: 'taylor@taskflow.dev',
      color: '#f59e0b',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] border border-[#222] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3B82F6] flex items-center justify-center text-black font-black">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-white">
                {mode === 'login' ? 'SIGN IN TO TASKFLOW' : 'CREATE NEW ACCOUNT'}
                <span className="text-[#3B82F6]">.</span>
              </h2>
              <p className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Full-Stack JWT Authentication</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-[#666] hover:text-white hover:bg-[#1c1c1c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 1-Click Persona Switcher for Quick Evaluator Testing */}
          <div className="p-3.5 bg-[#141414] border border-[#222] space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888]">
              ⚡ 1-CLICK DEMO ACCOUNTS (SWITCH ROLES):
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {demoPresets.map((demo) => {
                const isActive = user?.email === demo.email;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={async () => {
                      await quickDemoLogin(demo.email);
                      setIsAuthModalOpen(false);
                    }}
                    className={`text-left p-2 border text-xs transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-[#0c1e3d] border-[#3B82F6] text-white font-bold'
                        : 'bg-[#101010] border-[#262626] hover:border-[#444] text-[#aaa] hover:text-white'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold truncate uppercase text-[11px]">{demo.name}</div>
                      <div className="text-[9px] font-mono text-[#666] uppercase">{demo.role}</div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-2.5 bg-[#2a0c0c] border border-[#7f1d1d] text-[#fca5a5] text-xs font-mono">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold placeholder-[#555]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@taskflow.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold placeholder-[#555]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold placeholder-[#555]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold uppercase"
                >
                  <option value="member" className="bg-[#111]">MEMBER (CAN CREATE, EDIT, AND COMMENT)</option>
                  <option value="admin" className="bg-[#111]">ADMIN (FULL ACCESS + WORKSPACE RESET)</option>
                  <option value="viewer" className="bg-[#111]">VIEWER (READ-ONLY OBSERVATION)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-black uppercase tracking-wider text-black bg-[#3B82F6] hover:bg-white disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'AUTHENTICATING...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          {/* Toggle login vs register */}
          <div className="text-center pt-2 border-t border-[#222] text-xs text-[#888]">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-black text-[#3B82F6] hover:underline uppercase"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-black text-[#3B82F6] hover:underline uppercase"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
