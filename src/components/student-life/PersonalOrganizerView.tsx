import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RoutineHabit, PersonalReminder } from '../../types';
import { INITIAL_ROUTINES, INITIAL_PERSONAL_REMINDERS } from '../../lib/studentLifeData';
import {
  Sparkles,
  CheckCircle2,
  Flame,
  Plus,
  Calendar,
  Sun,
  Sunset,
  Moon,
  Trash2,
  Clock,
  Heart,
  Tag,
} from 'lucide-react';

export const PersonalOrganizerView: React.FC = () => {
  const { showToast } = useApp();

  const [habits, setHabits] = useState<RoutineHabit[]>(() => {
    const saved = localStorage.getItem('uniquest_habits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ROUTINES;
      }
    }
    return INITIAL_ROUTINES;
  });

  const [reminders, setReminders] = useState<PersonalReminder[]>(() => {
    const saved = localStorage.getItem('uniquest_personal_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PERSONAL_REMINDERS;
      }
    }
    return INITIAL_PERSONAL_REMINDERS;
  });

  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false);

  // New habit form
  const [habitTitle, setHabitTitle] = useState('');
  const [habitTime, setHabitTime] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [habitCategory, setHabitCategory] = useState<'Wellness' | 'Study' | 'Planning'>('Wellness');

  // New reminder form
  const [remTitle, setRemTitle] = useState('');
  const [remCategory, setRemCategory] = useState<'Health' | 'Errands' | 'Finance' | 'Social'>('Errands');
  const [remDueDate, setRemDueDate] = useState('');

  useEffect(() => {
    localStorage.setItem('uniquest_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('uniquest_personal_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const nextCompleted = !h.completedToday;
        return {
          ...h,
          completedToday: nextCompleted,
          streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
        };
      })
    );
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    const newH: RoutineHabit = {
      id: `h-${Date.now()}`,
      title: habitTitle.trim(),
      timeOfDay: habitTime,
      category: habitCategory,
      streak: 1,
      completedToday: false,
    };

    setHabits((prev) => [...prev, newH]);
    setIsAddHabitModalOpen(false);
    setHabitTitle('');
    showToast('success', `Added routine habit: "${newH.title}"`);
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;

    const newR: PersonalReminder = {
      id: `rem-${Date.now()}`,
      title: remTitle.trim(),
      category: remCategory,
      dueDate: remDueDate || new Date().toISOString().split('T')[0],
      completed: false,
    };

    setReminders((prev) => [newR, ...prev]);
    setIsAddReminderModalOpen(false);
    setRemTitle('');
    setRemDueDate('');
    showToast('success', `Added reminder: "${newR.title}"`);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    showToast('info', 'Habit removed.');
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    showToast('info', 'Reminder removed.');
  };

  const completedHabitsCount = habits.filter((h) => h.completedToday).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Personal Organizer & Daily Routines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build consistent morning/evening routines, track non-academic errands, and maintain habits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddHabitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Routine</span>
          </button>

          <button
            onClick={() => setIsAddReminderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Routine Habits Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Daily Habits & Routines ({completedHabitsCount} / {habits.length} Completed Today)
          </h3>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            {habits.length === 0 ? 0 : Math.round((completedHabitsCount / habits.length) * 100)}% Habit Adherence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Morning', 'Afternoon', 'Evening'] as const).map((tod) => {
            const todHabits = habits.filter((h) => h.timeOfDay === tod);
            const Icon = tod === 'Morning' ? Sun : tod === 'Afternoon' ? Sunset : Moon;

            return (
              <div
                key={tod}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-amber-500" />
                    {tod} Routine
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {todHabits.filter((h) => h.completedToday).length}/{todHabits.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {todHabits.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400 italic">
                      No habits set for {tod.toLowerCase()}.
                    </div>
                  ) : (
                    todHabits.map((h) => (
                      <div
                        key={h.id}
                        className={`p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-2.5 ${
                          h.completedToday
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                            : 'bg-slate-50/70 border-slate-100 text-slate-800'
                        }`}
                      >
                        <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                          <input
                            type="checkbox"
                            checked={h.completedToday}
                            onChange={() => handleToggleHabit(h.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
                          />
                          <span
                            className={`leading-snug ${
                              h.completedToday ? 'line-through text-slate-400' : 'font-medium'
                            }`}
                          >
                            {h.title}
                          </span>
                        </label>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <div
                            className="flex items-center gap-0.5 text-[10px] font-mono text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded"
                            title={`${h.streak} day streak`}
                          >
                            <Flame className="w-3 h-3 fill-orange-500" />
                            <span>{h.streak}d</span>
                          </div>

                          <button
                            onClick={() => handleDeleteHabit(h.id)}
                            className="p-1 text-slate-300 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Reminders Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Personal Errands & Life Reminders</h3>
            <p className="text-xs text-slate-500">Non-academic commitments, health appointments, and financial deadlines.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            {reminders.filter((r) => !r.completed).length} Pending
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-colors ${
                r.completed
                  ? 'bg-slate-50/60 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
                <input
                  type="checkbox"
                  checked={r.completed}
                  onChange={() => handleToggleReminder(r.id)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`font-semibold ${r.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {r.title}
                </span>
              </label>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {r.category}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{r.dueDate}</span>
                <button
                  onClick={() => handleDeleteReminder(r.id)}
                  className="p-1 text-slate-300 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Habit Modal */}
      {isAddHabitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Add Daily Routine Habit</h2>
            <form onSubmit={handleAddHabit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Habit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 15 pages or 20 min morning walk"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time of Day</label>
                  <select
                    value={habitTime}
                    onChange={(e) => setHabitTime(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Wellness">Wellness</option>
                    <option value="Study">Study & Code</option>
                    <option value="Planning">Planning</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddHabitModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {isAddReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Add Personal Reminder</h2>
            <form onSubmit={handleAddReminder} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule eye exam appointment"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={remCategory}
                    onChange={(e) => setRemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Health">Health & Medical</option>
                    <option value="Errands">Errands</option>
                    <option value="Finance">Finance</option>
                    <option value="Social">Social / Family</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={remDueDate}
                    onChange={(e) => setRemDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddReminderModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
