import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Calendar,
  Clock,
  LayoutDashboard,
  Save,
  ArrowRight,
} from 'lucide-react';

export const DemoWalkthroughBar: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    openAddTaskModal,
    openAddSessionModal,
    resetToDemoData,
    tasks,
    studySessions,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);

  // Compute live step completion based on app state
  const hasAddedExtraTask = tasks.length > 6;
  const hasAddedExtraSession = studySessions.length > 4;
  const hasSavedAISessions = studySessions.some((s) => s.id.startsWith('session-ai'));

  const steps = [
    {
      num: 1,
      title: 'Student Authentication',
      desc: 'Signed in as Alex Rivera (Stanford CS).',
      done: true,
      actionLabel: 'Active',
      onClick: () => setCurrentRoute('settings'),
    },
    {
      num: 2,
      title: 'Dashboard Overview',
      desc: 'Answers "What should I focus on today?" with 4 real KPI metrics.',
      done: currentRoute === 'dashboard',
      actionLabel: 'View Dashboard',
      onClick: () => setCurrentRoute('dashboard'),
    },
    {
      num: 3,
      title: 'Add Academic Task',
      desc: 'Record a coursework deliverable with due date & priority.',
      done: hasAddedExtraTask,
      actionLabel: '+ Add Task',
      onClick: () =>
        openAddTaskModal({
          title: 'CS 312 Kernel Virtual Memory Lab',
          description: 'Implement page fault handler and inverted page table algorithm.',
          subjectName: 'Operating Systems',
          priority: 'High',
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          dueTime: '23:59',
        }),
    },
    {
      num: 4,
      title: 'View Calendar Deadlines',
      desc: 'Visualise submissions derived directly from task records.',
      done: currentRoute === 'calendar',
      actionLabel: 'Open Calendar',
      onClick: () => setCurrentRoute('calendar'),
    },
    {
      num: 5,
      title: 'Create Study Session',
      desc: 'Block focused time for deep work and problem sets.',
      done: hasAddedExtraSession,
      actionLabel: '+ Study Session',
      onClick: () =>
        openAddSessionModal({
          title: 'Kernel Memory Allocator Practice',
          subjectName: 'Operating Systems',
          date: new Date().toISOString().split('T')[0],
          startTime: '04:00 PM',
          duration: 90,
          notes: 'Review buddy allocator time complexity and test bench.',
        }),
    },
    {
      num: 6,
      title: 'Generate AI Study Plan',
      desc: 'Gemini 3.8 Flash synthesizes a tailored weekly roadmap.',
      done: currentRoute === 'ai-planner',
      actionLabel: 'Launch AI Planner',
      onClick: () => setCurrentRoute('ai-planner'),
    },
    {
      num: 7,
      title: 'Save AI Sessions',
      desc: 'Commit reviewed study blocks directly to the calendar.',
      done: hasSavedAISessions,
      actionLabel: 'Study Timetable',
      onClick: () => setCurrentRoute('study-planner'),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center font-bold text-[10px] text-white shrink-0">
            HQ
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">
              Live Hackathon Demo Flow
            </span>
            <span className="text-slate-400 hidden sm:inline">
              · {completedCount} of 7 demonstration milestones reached
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToDemoData}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Reset to fresh demo sample data"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden xs:inline">Reset Demo State</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1"
          >
            <span>{isExpanded ? 'Hide Steps' : 'View 7-Step Demo'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Walkthrough Tray */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto pt-3 pb-2 border-t border-slate-800 mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-in fade-in duration-150">
          {steps.map((step) => (
            <div
              key={step.num}
              onClick={step.onClick}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                step.done
                  ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-white text-[11px] truncate">
                    {step.num}. {step.title}
                  </span>
                  <span className="text-[10px] text-blue-400 hover:underline shrink-0">
                    {step.actionLabel} →
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-normal">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
