import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Sparkles,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { MobileNav } from './MobileNav';

export const Header: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    searchQuery,
    setSearchQuery,
    openAddTaskModal,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Context titles & breadcrumbs
  const routeLabels: Record<string, string> = {
    dashboard: 'Student Dashboard',
    tasks: 'My Tasks',
    calendar: 'Academic Calendar',
    'study-planner': 'Study Planner',
    'ai-planner': 'AI Study Planner',
    settings: 'Settings & Data',
  };

  const currentLabel = routeLabels[currentRoute] || 'Dashboard';

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-3.5 transition-all">
        <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap">
              <span>Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-900 font-semibold">{currentLabel}</span>
            </div>
          </div>

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Clean compact search bar */}
            <div className="relative hidden md:block w-52 lg:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks, subjects..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentRoute !== 'tasks' && currentRoute !== 'dashboard' && e.target.value) {
                    setCurrentRoute('tasks');
                  }
                }}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* AI Planner Action */}
            <button
              onClick={() => setCurrentRoute('ai-planner')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                currentRoute === 'ai-planner'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Planner</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => openAddTaskModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};
