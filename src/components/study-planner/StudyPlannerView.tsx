import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StudySession, SessionStatus } from '../../types';
import {
  Clock,
  Plus,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Sparkles,
  Award,
  Flame,
  Filter,
} from 'lucide-react';
import { formatLongDate } from '../../lib/dateUtils';

export const StudyPlannerView: React.FC = () => {
  const {
    studySessions,
    subjects,
    openAddSessionModal,
    deleteStudySession,
    toggleSessionComplete,
    setCurrentRoute,
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Stats
  const totalMinutes = studySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const completedMinutes = studySessions
    .filter((s) => s.status === 'Completed')
    .reduce((acc, s) => acc + (s.duration || 0), 0);

  const totalHours = (totalMinutes / 60).toFixed(1);
  const completedHours = (completedMinutes / 60).toFixed(1);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return studySessions
      .filter((s) => {
        if (selectedSubject !== 'All' && s.subjectName !== selectedSubject) return false;
        if (filterStatus !== 'All' && s.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [studySessions, selectedSubject, filterStatus]);

  // Group by Date for weekly timeline
  const groupedSessions = useMemo(() => {
    const groups: Record<string, StudySession[]> = {};
    filteredSessions.forEach((s) => {
      if (!groups[s.date]) {
        groups[s.date] = [];
      }
      groups[s.date].push(s);
    });
    return groups;
  }, [filteredSessions]);

  const sortedDates = Object.keys(groupedSessions).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Study Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organise deep work blocks, deliberate practice, and track cumulative study hours.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentRoute('ai-planner')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Auto-Plan</span>
          </button>

          <button
            onClick={() => openAddSessionModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Session</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar with Strict Tabular Numerals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Planned Hours
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalHours} hrs
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {studySessions.length} registered study blocks
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Completed Hours
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
            {completedHours} hrs
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {studySessions.filter((s) => s.status === 'Completed').length} study blocks finished
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Weekly Completion
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalMinutes > 0 ? `${Math.round((completedMinutes / totalMinutes) * 100)}%` : '0%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Goal: 15 hrs / week benchmark
          </div>
        </div>
      </div>

      {/* Filter and Subject Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Course Filter:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="All">All Subjects ({studySessions.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['All', 'Scheduled', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterStatus === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Timeline by Date */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No study sessions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Schedule focused study blocks manually or launch our AI Study Planner to auto-generate a balanced schedule.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => openAddSessionModal()}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              + Add Session
            </button>
            <button
              onClick={() => setCurrentRoute('ai-planner')}
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use AI Planner</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => {
            const dateSessions = groupedSessions[dateStr];
            const formattedDate = formatLongDate(dateStr);

            return (
              <div key={dateStr} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <h3 className="text-sm font-bold text-slate-900">{formattedDate}</h3>
                  <span className="text-xs text-slate-400 font-mono tabular-nums">
                    · {dateSessions.length} {dateSessions.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dateSessions.map((session) => {
                    const isDone = session.status === 'Completed';

                    return (
                      <div
                        key={session.id}
                        className={`bg-white p-4 rounded-2xl border transition-all ${
                          isDone
                            ? 'border-slate-200/70 bg-slate-50/50 opacity-70'
                            : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => toggleSessionComplete(session.id)}
                              className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                              title={isDone ? 'Mark as Scheduled' : 'Mark as Completed'}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            <div>
                              <h4
                                className={`text-sm font-bold ${
                                  isDone ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {session.title}
                              </h4>
                              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                                {session.subjectName}
                              </div>
                            </div>
                          </div>

                          {/* Action icons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openAddSessionModal(session)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                              title="Edit session"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteStudySession(session.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {session.notes && (
                          <p className="text-xs text-slate-500 mt-2 pl-7.5 leading-relaxed bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                            {session.notes}
                          </p>
                        )}

                        {/* Unboxed Metadata with · separator */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100 pl-7.5">
                          <span className="font-mono tabular-nums">{session.startTime}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{session.duration} mins</span>
                          <span aria-hidden="true">·</span>
                          <span className={isDone ? 'font-semibold text-emerald-600' : 'font-medium text-slate-600'}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
