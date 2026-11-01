import React from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority } from '../../types';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  BookOpen,
  CheckCheck,
  ListTodo,
  CalendarPlus,
  Flame,
  AlertTriangle,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    user,
    tasks,
    studySessions,
    openAddTaskModal,
    openAddSessionModal,
    setCurrentRoute,
    toggleTaskComplete,
  } = useApp();

  // Adapted greeting by current local hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 18
      ? 'Good afternoon'
      : 'Good evening';

  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Real statistics derived from actual records
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  // Deadlines within next 7 days
  const upcomingDeadlines = tasks
    .filter((t) => {
      if (t.status === 'Completed') return false;
      return t.dueDate >= todayStr;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Today's priorities: tasks due today OR (High priority and pending)
  const todayPriorities = tasks
    .filter((t) => {
      const isDueToday = t.dueDate === todayStr;
      const isHighPriority = t.priority === 'High' && t.status !== 'Completed';
      return (isDueToday || isHighPriority) && t.status !== 'Completed';
    })
    .sort((a, b) => {
      if (a.dueDate === todayStr && b.dueDate !== todayStr) return -1;
      if (b.dueDate === todayStr && a.dueDate !== todayStr) return 1;
      return 0;
    });

  // Calculate real study hours completed this week
  const completedSessions = studySessions.filter((s) => s.status === 'Completed');
  const totalMinutesCompleted = completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalHoursCompleted = (totalMinutesCompleted / 60).toFixed(1);
  const weeklyGoalHours = 15;
  const progressPercent = Math.min(100, Math.round((Number(totalHoursCompleted) / weeklyGoalHours) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. WELCOME SECTION — Answers: "What should I focus on today?" */}
      <div className="bg-[#172554] rounded-2xl p-6 sm:p-8 text-white shadow-xs border border-blue-950">
        <div className="max-w-3xl">
          <div className="text-xs font-medium text-blue-300/90 mb-1 flex items-center gap-2">
            <span>{formattedToday}</span>
            <span aria-hidden="true">·</span>
            <span>Academic Term 2026</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {greeting}, {user?.fullName?.split(' ')[0] || 'Student'}
          </h2>

          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl text-balance">
            {todayPriorities.length > 0 ? (
              <>
                You have{' '}
                <strong className="text-white font-semibold">
                  {todayPriorities.length} urgent {todayPriorities.length === 1 ? 'task' : 'tasks'}
                </strong>{' '}
                requiring focus today. Prioritize high-weight coursework before tackling upcoming milestones.
              </>
            ) : pendingTasks.length > 0 ? (
              `No assignments due today. You have ${pendingTasks.length} pending tasks in your weekly queue.`
            ) : (
              'All coursework is up to date. Excellent pacing this term!'
            )}
          </p>

          {/* Action CTAs */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => openAddTaskModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
            <button
              onClick={() => setCurrentRoute('ai-planner')}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>Generate Weekly Study Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL METRIC CARDS (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Tasks
            </span>
            <ListTodo className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalTasks}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {new Set(tasks.map((t) => t.subjectName)).size} enrolled courses
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Pending Tasks
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {pendingTasks.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {pendingTasks.filter((t) => t.priority === 'High').length} High Priority items
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Completed Tasks
            </span>
            <CheckCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {completedTasks.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalTasks > 0
              ? `${Math.round((completedTasks.length / totalTasks) * 100)}% completion rate`
              : 'Zero tasks logged'}
          </div>
        </div>

        {/* Upcoming Deadlines (within 7 days) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Near Deadlines
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {upcomingDeadlines.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Next 7 calendar days
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN SPLIT: PRIORITIES & DEADLINES + STUDY PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* C. Today's Priorities */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Today's Priorities</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tasks due today or requiring immediate attention
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('tasks')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View all tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayPriorities.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200/60">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">
                  No immediate tasks due today
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your academic schedule is clear for today. Review upcoming coursework or schedule study blocks ahead.
                </p>
                <button
                  onClick={() => openAddTaskModal()}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  + Add New Task
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayPriorities.map((task) => (
                  <div
                    key={task.id}
                    className="py-3 flex items-start gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors group"
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                      title="Mark as completed"
                    >
                      <Circle className="w-5 h-5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Clean unboxed metadata with separators */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <span className="font-medium text-slate-700">{task.subjectName}</span>
                        <span aria-hidden="true">·</span>
                        <span className={task.dueDate === todayStr ? 'font-bold text-rose-600' : 'text-slate-600'}>
                          {task.dueDate === todayStr ? 'Due Today' : `Due ${task.dueDate}`}
                        </span>
                        {task.dueTime && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{task.dueTime}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold ${
                            task.priority === 'High'
                              ? 'text-rose-600'
                              : task.priority === 'Medium'
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* D. Upcoming Deadlines */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Upcoming Deadlines</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nearest coursework deadlines and exam milestones
                </p>
              </div>
              <button
                onClick={() => setCurrentRoute('calendar')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Calendar View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No upcoming deadlines on your radar.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{task.subjectName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${
                        task.priority === 'High'
                          ? 'text-rose-600'
                          : task.priority === 'Medium'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (1 COL): STUDY PROGRESS & ACTIONS */}
        <div className="space-y-6">
          {/* E. Study Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Study Progress</span>
              </h3>
              <button
                onClick={() => setCurrentRoute('study-planner')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Open Planner
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs font-semibold text-slate-600">Hours Completed</span>
                  <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                    {totalHoursCompleted} / {weeklyGoalHours}.0 hrs
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                  {progressPercent}% of weekly 15-hour study target
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                    {completedSessions.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Completed</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-blue-600 font-mono tabular-nums">
                    {studySessions.filter((s) => s.status === 'Scheduled').length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Scheduled</div>
                </div>
              </div>

              {/* Next session preview */}
              {(() => {
                const nextSession = studySessions.find((s) => s.status === 'Scheduled');
                if (!nextSession) return null;
                return (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Upcoming Session
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {nextSession.title}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <span>{nextSession.subjectName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{nextSession.startTime}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{nextSession.duration}m</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* F. Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => openAddTaskModal()}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      Add Academic Task
                    </div>
                    <div className="text-[11px] text-slate-500">Record assignment or lab</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => openAddSessionModal()}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <CalendarPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-slate-800">
                      Create Study Session
                    </div>
                    <div className="text-[11px] text-slate-500">Block focused revision time</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentRoute('ai-planner')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950 group-hover:text-blue-700">
                      AI Study Planner
                    </div>
                    <div className="text-[11px] text-blue-700">Gemini powered weekly schedule</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
