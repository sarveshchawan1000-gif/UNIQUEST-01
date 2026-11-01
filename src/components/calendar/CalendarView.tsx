import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { tasks, openAddTaskModal, toggleTaskComplete } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (!map[t.dueDate]) {
        map[t.dueDate] = [];
      }
      map[t.dueDate].push(t);
    });
    return map;
  }, [tasks]);

  // Generate Month Grid
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const curDate = new Date(year, month, i);
      days.push({
        dateStr: curDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        dateStr: nextDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Generate Week Grid
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const firstDay = new Date(curr);
    firstDay.setDate(curr.getDate() - dayOfWeek);

    const days: { dateStr: string; dayNum: number; dayName: string }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        dayName: dayNames[i],
      });
    }
    return days;
  }, [currentDate]);

  const selectedDateTasks = tasksByDate[selectedDateStr] || [];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Calendar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Synchronized timeline of coursework deadlines, problem sets, and exams.
          </p>
        </div>

        {/* View Switcher & Quick Add */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week View
            </button>
          </div>

          <button
            onClick={() => openAddTaskModal({ dueDate: selectedDateStr })}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add on Date</span>
          </button>
        </div>
      </div>

      {/* Month Navigation Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-900">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid and Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Grid View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
          {viewMode === 'month' ? (
            <div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-xs font-semibold text-slate-400 py-1 uppercase tracking-wider">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {monthDays.map((item, idx) => {
                  const isSelected = item.dateStr === selectedDateStr;
                  const isToday = item.dateStr === todayStr;
                  const dayTasks = tasksByDate[item.dateStr] || [];

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDateStr(item.dateStr)}
                      className={`min-h-[78px] sm:min-h-[92px] p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50/80 ring-1 ring-slate-900/10'
                          : isToday
                          ? 'border-blue-400 bg-blue-50/20'
                          : item.isCurrentMonth
                          ? 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                          : 'border-slate-50 bg-slate-50/30 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold font-mono tabular-nums w-6 h-6 rounded-md flex items-center justify-center ${
                            isToday
                              ? 'bg-blue-600 text-white font-bold'
                              : isSelected
                              ? 'text-slate-900 font-extrabold'
                              : item.isCurrentMonth
                              ? 'text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {item.dayNum}
                        </span>
                        {dayTasks.length > 0 && (
                          <span className="text-[10px] font-mono tabular-nums text-slate-500 font-semibold">
                            {dayTasks.length}
                          </span>
                        )}
                      </div>

                      {/* Unboxed event rows with color bullets */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayTasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className={`text-[10px] truncate flex items-center gap-1 ${
                              t.status === 'Completed'
                                ? 'text-slate-400 line-through'
                                : 'text-slate-700 font-medium'
                            }`}
                            title={`${t.subjectName}: ${t.title}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                t.status === 'Completed'
                                  ? 'bg-slate-300'
                                  : t.priority === 'High'
                                  ? 'bg-rose-500'
                                  : t.priority === 'Medium'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <span className="truncate">{t.title}</span>
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-[9px] font-medium text-slate-500 pl-2.5">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Week View
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((item) => {
                const isSelected = item.dateStr === selectedDateStr;
                const isToday = item.dateStr === todayStr;
                const dayTasks = tasksByDate[item.dateStr] || [];

                return (
                  <div
                    key={item.dateStr}
                    onClick={() => setSelectedDateStr(item.dateStr)}
                    className={`min-h-[300px] p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50/60 ring-1 ring-slate-900/10'
                        : isToday
                        ? 'border-blue-400 bg-blue-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-center pb-2 border-b border-slate-100 mb-2">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {item.dayName}
                      </div>
                      <div
                        className={`text-sm font-bold font-mono tabular-nums w-7 h-7 mx-auto rounded-md flex items-center justify-center mt-1 ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : isSelected
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-800'
                        }`}
                      >
                        {item.dayNum}
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`p-2 rounded-lg text-left text-xs ${
                            t.status === 'Completed'
                              ? 'bg-slate-50 text-slate-400 line-through'
                              : 'bg-slate-50/90 border border-slate-200/80'
                          }`}
                        >
                          <div className="font-semibold text-slate-900 truncate">
                            {t.title}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {t.subjectName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Inspector Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Selected Day
              </span>
              <h4 className="text-base font-bold text-slate-900">
                {selectedDateStr === todayStr ? `Today (${selectedDateStr})` : selectedDateStr}
              </h4>
            </div>
            <button
              onClick={() => openAddTaskModal({ dueDate: selectedDateStr })}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              title="Add task for this date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {selectedDateTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CalendarIcon className="w-7 h-7 mx-auto text-slate-300" />
              <p className="text-xs text-slate-500">
                No tasks due on this date.
              </p>
              <button
                onClick={() => openAddTaskModal({ dueDate: selectedDateStr })}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Schedule a task or deadline
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-500">
                {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'} scheduled:
              </div>

              {selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 shrink-0"
                      >
                        {task.status === 'Completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={`text-xs font-bold ${
                          task.status === 'Completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold shrink-0 ${
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

                  <div className="text-[11px] text-slate-500 pl-6 flex items-center gap-2">
                    <span className="font-medium text-slate-700">{task.subjectName}</span>
                    {task.dueTime && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{task.dueTime}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
