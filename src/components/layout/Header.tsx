import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AppRoute } from '../../types';
import {
  Search,
  Plus,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Check,
  Home,
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Clock,
  Settings,
  CheckCircle,
  CalendarRange,
  Code2,
  FileText,
  Briefcase,
  FolderKanban,
  Building2,
  Timer,
  Wallet,
  ListTodo,
} from 'lucide-react';
import { MobileNav } from './MobileNav';

export const Header: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    searchQuery,
    setSearchQuery,
    openAddTaskModal,
    tasks,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const pendingCount = tasks.filter((t) => t.status !== 'Completed').length;

  const routesList: {
    route: AppRoute;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }[] = [
    { route: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { route: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: pendingCount > 0 ? pendingCount : undefined },
    { route: 'calendar', label: 'Academic Calendar', icon: CalendarDays },
    { route: 'study-planner', label: 'Study Planner', icon: Clock },
    { route: 'ai-planner', label: 'AI Study Planner', icon: Sparkles },
    { route: 'attendance', label: 'Attendance Tracker', icon: CheckCircle },
    { route: 'exams', label: 'Exams & Revision', icon: CalendarRange },
    { route: 'coding-practice', label: 'Coding Practice', icon: Code2 },
    { route: 'notes', label: 'Course Notes', icon: FileText },
    { route: 'career', label: 'Career Hub', icon: Briefcase },
    { route: 'projects-teamwork', label: 'Projects & Teams', icon: FolderKanban },
    { route: 'campus-life', label: 'Campus & Clubs', icon: Building2 },
    { route: 'focus-timer', label: 'Focus Timer', icon: Timer },
    { route: 'budget', label: 'Student Budget', icon: Wallet },
    { route: 'personal-organizer', label: 'Personal Organizer', icon: ListTodo },
    { route: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  // Context titles & breadcrumbs
  const routeLabels: Record<string, string> = {
    dashboard: 'Student Dashboard',
    tasks: 'My Tasks',
    calendar: 'Academic Calendar',
    'study-planner': 'Study Planner',
    'ai-planner': 'AI Study Planner',
    attendance: 'Attendance Tracker',
    exams: 'Exams & Revision Hub',
    'coding-practice': 'Coding Practice & DSA',
    notes: 'Course Notes',
    career: 'Career & Placement Hub',
    'projects-teamwork': 'Projects & Teamwork',
    'campus-life': 'Campus & Clubs',
    'focus-timer': 'Focus Timer',
    budget: 'Student Budget',
    'personal-organizer': 'Personal Organizer',
    settings: 'Settings & Data',
  };

  const currentLabel = routeLabels[currentRoute] || 'Student Dashboard';

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-3.5 transition-all">
        <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
            {/* Breadcrumb Trail with workable buttons */}
            <div className="relative flex items-center gap-1.5 text-xs font-medium text-slate-500 whitespace-nowrap" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentRoute('dashboard');
                  setIsDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 active:bg-slate-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                  currentRoute === 'dashboard' ? 'text-slate-700 font-medium' : ''
                }`}
                title="Go to Workspace Dashboard"
              >
                <Home className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                <span>Workspace</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 select-none" />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg font-semibold text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                    isDropdownOpen ? 'bg-slate-100 text-blue-700 ring-1 ring-slate-200' : ''
                  }`}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                  title="Switch workspace view"
                >
                  <span>{currentLabel}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {/* Workspace Views Switcher Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch Workspace View
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      {routesList.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = currentRoute === item.route;
                        return (
                          <button
                            key={item.route}
                            type="button"
                            onClick={() => {
                              setCurrentRoute(item.route);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                              isCurrent
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon
                                className={`w-4 h-4 ${
                                  isCurrent ? 'text-blue-600' : 'text-slate-400'
                                }`}
                              />
                              <span>{item.label}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.badge !== undefined && (
                                <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  {item.badge}
                                </span>
                              )}
                              {isCurrent && (
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
