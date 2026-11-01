import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppRoute } from '../../types';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Clock,
  Sparkles,
  Settings,
  X,
  GraduationCap,
  LogOut,
  Database,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { currentRoute, setCurrentRoute, tasks, user, logout, storageMode } = useApp();

  if (!isOpen) return null;

  const pendingCount = tasks.filter((t) => t.status !== 'Completed').length;

  const navItems: { route: AppRoute; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { route: 'tasks', label: 'My Tasks', icon: CheckSquare, count: pendingCount || undefined },
    { route: 'calendar', label: 'Academic Calendar', icon: CalendarDays },
    { route: 'study-planner', label: 'Study Planner', icon: Clock },
    { route: 'ai-planner', label: 'AI Study Planner', icon: Sparkles },
    { route: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (route: AppRoute) => {
    setCurrentRoute(route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-[#172554]">
                  UNIQUEST
                </span>
                <p className="text-[10px] text-slate-500 font-medium">
                  Every student goal.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavigate(item.route)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Storage */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              Storage:
            </span>
            <span className="text-[11px] font-semibold text-blue-600">
              {storageMode === 'supabase' ? 'Supabase Live' : 'Demo (Local)'}
            </span>
          </div>

          {user && (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {user.email}
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
