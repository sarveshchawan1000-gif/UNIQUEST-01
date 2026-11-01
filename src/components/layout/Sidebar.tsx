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
  LogOut,
  GraduationCap,
  Database,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentRoute, setCurrentRoute, tasks, user, logout, storageMode } = useApp();

  const pendingCount = tasks.filter((t) => t.status !== 'Completed').length;

  const navItems: { route: AppRoute; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    {
      route: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      route: 'tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      count: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      route: 'calendar',
      label: 'Academic Calendar',
      icon: CalendarDays,
    },
    {
      route: 'study-planner',
      label: 'Study Planner',
      icon: Clock,
    },
    {
      route: 'ai-planner',
      label: 'AI Study Planner',
      icon: Sparkles,
    },
    {
      route: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen sticky top-0 select-none z-30 shrink-0">
      {/* Top Branding Section */}
      <div>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#172554] flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-[#172554]">
                UNIQUEST
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                One platform. Every student goal.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => setCurrentRoute(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Storage Mode & Profile */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {/* Storage State Indicator - Clean & Professional */}
        <div
          onClick={() => setCurrentRoute('settings')}
          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-colors cursor-pointer group"
          title="Click to view Supabase connection details and SQL schema"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
              <span className="font-semibold text-slate-700">Data Layer</span>
            </div>
            <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900">
              {storageMode === 'supabase' ? 'Supabase RLS' : 'Local Demo'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>{storageMode === 'supabase' ? 'Live Cloud Sync' : 'Session Persistent'}</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Student Profile Card */}
        {user ? (
          <div className="p-2.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user.collegeName || user.email}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCurrentRoute('login')}
            className="w-full py-2 px-3 text-xs font-semibold text-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </aside>
  );
};
