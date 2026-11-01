import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AIGeneratedPlan, AISessionItem, Priority } from '../../types';
import {
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Save,
  AlertCircle,
  Lightbulb,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const AIPlannerView: React.FC = () => {
  const {
    subjects,
    tasks,
    user,
    saveAISessions,
    setCurrentRoute,
    showToast,
  } = useApp();

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() =>
    subjects.map((s) => s.name)
  );
  const [hoursPerDay, setHoursPerDay] = useState<number>(3);
  const [availableDays, setAvailableDays] = useState<string[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<AIGeneratedPlan | null>(null);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [metaInfo, setMetaInfo] = useState<{ source?: string; isAi?: boolean }>({});
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleSubject = (name: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleGenerate = async () => {
    setErrorMsg('');
    if (selectedSubjects.length === 0) {
      setErrorMsg('Please select at least one subject to include in your study plan.');
      return;
    }
    if (availableDays.length === 0) {
      setErrorMsg('Please select at least one available study day.');
      return;
    }

    setIsGenerating(true);

    const pendingTasks = tasks
      .filter((t) => t.status !== 'Completed')
      .map((t) => ({
        title: t.title,
        subject: t.subjectName,
        priority: t.priority,
        dueDate: t.dueDate,
        dueTime: t.dueTime,
        status: t.status,
      }));

    try {
      const response = await fetch('/api/ai/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: selectedSubjects,
          hoursPerDay,
          availableDays,
          preferredTime,
          pendingTasks,
          additionalNotes,
          studentName: user?.fullName || 'Student',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.warning || 'Failed to generate study plan');
      }

      setGeneratedPlan(data.data);
      setMetaInfo({ source: data.source, isAi: data.isAiGenerated });
      const allIds = new Set<string>((data.data.sessions || []).map((s: AISessionItem) => s.id));
      setSelectedSessionIds(allIds);
      showToast('success', 'Personalised weekly study plan generated!');
    } catch (err: any) {
      console.error('AI plan error:', err);
      setErrorMsg(err.message || 'Network error occurred while calling AI planner');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSessionSelection = (id: string) => {
    setSelectedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllSessions = () => {
    if (!generatedPlan) return;
    const all = new Set(generatedPlan.sessions.map((s) => s.id));
    setSelectedSessionIds(all);
  };

  const deselectAllSessions = () => {
    setSelectedSessionIds(new Set());
  };

  const handleSaveToPlanner = async () => {
    if (!generatedPlan) return;
    const toSave = generatedPlan.sessions.filter((s) => selectedSessionIds.has(s.id));
    if (toSave.length === 0) {
      showToast('info', 'Please select at least one session to add to your schedule.');
      return;
    }

    await saveAISessions(toSave);
    setCurrentRoute('study-planner');
  };

  const handleUpdateSession = (id: string, updates: Partial<AISessionItem>) => {
    if (!generatedPlan) return;
    setGeneratedPlan({
      ...generatedPlan,
      sessions: generatedPlan.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
    setEditingSessionId(null);
    showToast('info', 'Session adjusted in generated plan.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner - Sleek Dark Navy */}
      <div className="bg-[#172554] rounded-2xl p-6 sm:p-8 text-white shadow-xs border border-blue-950">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Academic Optimization</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Your personal AI study planner
          </h2>

          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed text-balance">
            Let UNIQUEST organise your week around your academic goals, enrolled courses, and approaching deadlines.
            Review the plan and save it directly to your study schedule.
          </p>
        </div>
      </div>

      {/* INPUT CONFIGURATION PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            1. Configure Weekly Availability & Pacing
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            UNIQUEST synchronizes these parameters with your pending tasks and deadlines.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target Subjects */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Target Courses <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedSubjects(subjects.map((s) => s.name))}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Select all
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedSubjects([])}
                  className="text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subjects.map((s) => {
                const isSelected = selectedSubjects.includes(s.name);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubject(s.name)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Study Hours & Time of Day */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Target Daily Study Load:
                </label>
                <span className="text-xs font-mono font-bold tabular-nums text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {hoursPerDay} {hoursPerDay === 1 ? 'hour' : 'hours'} / day
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                <span>1.0 hr</span>
                <span>3.0–4.0 hrs (Optimal)</span>
                <span>8.0 hrs (Exam Crunch)</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred Study Window
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'morning', label: 'Morning', hours: '08:00 - 12:00' },
                  { id: 'afternoon', label: 'Afternoon', hours: '13:00 - 17:00' },
                  { id: 'evening', label: 'Evening', hours: '18:00 - 22:00' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPreferredTime(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      preferredTime === opt.id
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">{opt.label}</div>
                    <div className={`text-[10px] mt-0.5 font-mono ${preferredTime === opt.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      {opt.hours}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Available Days Segmented Bar */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Available Study Days
          </label>
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
            {allWeekdays.map((day) => {
              const isSelected = availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Student Guidance & Specific Focus (Optional)
          </label>
          <textarea
            rows={2}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="e.g. Prioritize midterm review for Algorithms, solve problem set 4 before Thursday..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all resize-none"
          />
        </div>

        {/* Submit Action Bar */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Syncing <strong>{tasks.filter((t) => t.status !== 'Completed').length} pending deliverables</strong> into prompt context.
            </span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Personalised Weekly Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time schedule optimization progress */}
        {isGenerating && (
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Gemini 3.8 Flash Optimization Engine Active</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Structured JSON Schema</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-slate-300">
              <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/60">
                1. Filtering {tasks.filter((t) => t.status !== 'Completed').length} active deadlines & priority weights
              </div>
              <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/60">
                2. Calibrating {hoursPerDay}h/day study windows across {availableDays.length} days
              </div>
              <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/60">
                3. Synthesizing focused study blocks with AI logic
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GENERATED PLAN OUTPUT REVIEW */}
      {generatedPlan && (
        <div className="space-y-6">
          {/* Executive Strategy Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Plan Synthesis
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Weekly Academic Strategy
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratedPlan(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Weekly Focus Summary
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {generatedPlan.overview}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Pacing Strategy
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {generatedPlan.weeklyStrategy}
                </p>
              </div>
            </div>

            {/* Study Tips */}
            {generatedPlan.tips && generatedPlan.tips.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>High-Yield Study Recommendations</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {generatedPlan.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed"
                    >
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SESSIONS REVIEW SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Review & Save Proposed Sessions ({generatedPlan.sessions.length} study blocks)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select sessions to add to your calendar. You can also adjust individual session parameters.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={selectAllSessions}
                    className="text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={deselectAllSessions}
                    className="text-slate-500 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveToPlanner}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Selected ({selectedSessionIds.size}) to Schedule</span>
                </button>
              </div>
            </div>

            {/* List of Session Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {generatedPlan.sessions.map((session) => {
                const isSelected = selectedSessionIds.has(session.id);
                const isEditingThis = editingSessionId === session.id;

                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-white shadow-2xs ring-1 ring-slate-900/10'
                        : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSessionSelection(session.id)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span className="font-bold text-slate-900">{session.day}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{session.date}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-700">{session.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`font-semibold ${
                              session.priority === 'High'
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {session.priority}
                          </span>
                        </div>

                        <h5 className="text-sm font-bold text-slate-900 mt-1">
                          {session.title}
                        </h5>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          <strong>Topic:</strong> {session.topic}
                        </p>

                        {/* AI Rationale */}
                        <div className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                          <strong className="text-slate-700">Scheduling Rationale:</strong>{' '}
                          {session.reason}
                        </div>

                        {/* Unboxed Metadata Footer */}
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                          <div className="flex items-center gap-2 font-mono tabular-nums">
                            <span>{session.startTime}</span>
                            <span aria-hidden="true">·</span>
                            <span>{session.duration} mins</span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setEditingSessionId(isEditingThis ? null : session.id)
                            }
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            {isEditingThis ? 'Close' : 'Adjust'}
                          </button>
                        </div>

                        {/* Inline Quick Editor if toggled */}
                        {isEditingThis && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <div className="text-xs font-bold text-slate-700">Adjust Timing</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="text-[10px] text-slate-500">Start Time</label>
                                <input
                                  type="text"
                                  defaultValue={session.startTime}
                                  onBlur={(e) =>
                                    handleUpdateSession(session.id, { startTime: e.target.value })
                                  }
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500">Duration (mins)</label>
                                <input
                                  type="number"
                                  defaultValue={session.duration}
                                  onBlur={(e) =>
                                    handleUpdateSession(session.id, {
                                      duration: Number(e.target.value),
                                    })
                                  }
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save CTA */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveToPlanner}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save {selectedSessionIds.size} Sessions to Study Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
