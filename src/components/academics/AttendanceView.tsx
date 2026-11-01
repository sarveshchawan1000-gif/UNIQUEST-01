import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord } from '../../types';
import { INITIAL_ATTENDANCE, getAttendanceStats } from '../../lib/academicData';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Sliders,
  Calendar,
  BookOpen,
  Info,
  Clock,
  Trash2,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { showToast } = useApp();

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('uniquest_attendance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ATTENDANCE;
      }
    }
    return INITIAL_ATTENDANCE;
  });

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newMinTarget, setNewMinTarget] = useState(75);

  useEffect(() => {
    localStorage.setItem('uniquest_attendance', JSON.stringify(records));
  }, [records]);

  // Log attendance for today
  const handleLogAttendance = (recordId: string, status: 'present' | 'absent' | 'cancelled') => {
    const todayStr = new Date().toISOString().split('T')[0];
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;

        const updatedHistory = [
          {
            id: `h-${Date.now()}`,
            date: todayStr,
            status,
            notes: `Logged class on ${todayStr}`,
          },
          ...rec.history,
        ];

        let attended = rec.attendedClasses;
        let total = rec.totalClasses;

        if (status === 'present') {
          attended += 1;
          total += 1;
        } else if (status === 'absent') {
          total += 1;
        }
        // cancelled does not increment total or attended

        return {
          ...rec,
          attendedClasses: attended,
          totalClasses: total,
          history: updatedHistory,
        };
      })
    );

    showToast(
      status === 'present' ? 'success' : status === 'absent' ? 'info' : 'info',
      `Marked ${status} for course.`
    );
  };

  const handleUpdateTarget = (recordId: string, newTarget: number) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, minTargetPercentage: Math.max(50, Math.min(100, newTarget)) } : r))
    );
  };

  const handleAddNewCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      courseName: newCourseName.trim(),
      courseCode: newCourseCode.trim() || 'ACAD 101',
      attendedClasses: 0,
      totalClasses: 0,
      minTargetPercentage: newMinTarget,
      history: [],
    };

    setRecords((prev) => [newRecord, ...prev]);
    setIsAddModalOpen(false);
    setNewCourseName('');
    setNewCourseCode('');
    showToast('success', `Added ${newRecord.courseName} to attendance tracker.`);
  };

  const handleDeleteCourse = (id: string, name: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecordId === id) setSelectedRecordId(null);
    showToast('info', `Removed ${name} from tracker.`);
  };

  // Overall aggregate
  const totalClassesSum = records.reduce((acc, r) => acc + r.totalClasses, 0);
  const attendedClassesSum = records.reduce((acc, r) => acc + r.attendedClasses, 0);
  const overallPercentage = totalClassesSum === 0 ? 100 : Math.round((attendedClassesSum / totalClassesSum) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Course Attendance Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track attended lectures, maintain target minimums, and calculate safe absence margins.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Attendance Rate
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {overallPercentage}%
            </span>
            <span
              className={`text-xs font-semibold ${
                overallPercentage >= 75 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {overallPercentage >= 75 ? 'Compliant' : 'Attention Required'}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {attendedClassesSum} of {totalClassesSum} total sessions attended
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tracked Courses
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-2">
            {records.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {records.filter((r) => getAttendanceStats(r).isSafe).length} courses meeting target
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Institutional Minimum
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-2">
            75%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Configurable per-course threshold
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((record) => {
          const { percentage, isSafe, marginText } = getAttendanceStats(record);
          const isSelected = selectedRecordId === record.id;

          return (
            <div
              key={record.id}
              className={`p-5 rounded-2xl bg-white border transition-all ${
                isSelected
                  ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                  : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {record.courseCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {record.courseName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">
                      {record.attendedClasses} / {record.totalClasses} classes
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-slate-400" />
                      Target: {record.minTargetPercentage}%
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-2xl font-black font-mono tabular-nums ${
                      isSafe ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {percentage}%
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${
                      isSafe ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isSafe ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    <span>{marginText}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
                  {/* Target line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                    style={{ left: `${record.minTargetPercentage}%` }}
                    title={`Target: ${record.minTargetPercentage}%`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSafe ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions: Log attendance today */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">Log today:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleLogAttendance(record.id, 'present')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                    title="Mark Present (+1 class attended)"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  <button
                    onClick={() => handleLogAttendance(record.id, 'absent')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                    title="Mark Absent (+1 missed)"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>

                  <button
                    onClick={() => handleLogAttendance(record.id, 'cancelled')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Class Cancelled / Holiday"
                  >
                    <span>No Class</span>
                  </button>

                  <button
                    onClick={() => setSelectedRecordId(isSelected ? null : record.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
                    title="View Log History & Target Slider"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expandable History and Target Setting */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <label className="font-semibold text-slate-700">
                      Minimum Attendance Target:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="50"
                        max="90"
                        step="5"
                        value={record.minTargetPercentage}
                        onChange={(e) => handleUpdateTarget(record.id, Number(e.target.value))}
                        className="w-24 accent-blue-600 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-slate-900 w-8 text-right">
                        {record.minTargetPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* History Logs */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Recent Attendance Records
                    </div>
                    {record.history.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No class sessions recorded yet.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {record.history.slice(0, 5).map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <span className="font-mono text-slate-600">{h.date}</span>
                            <span className="text-slate-500 truncate max-w-[140px]">
                              {h.notes || 'Lecture session'}
                            </span>
                            <span
                              className={`text-[11px] font-semibold capitalize px-1.5 py-0.5 rounded ${
                                h.status === 'present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : h.status === 'absent'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {h.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDeleteCourse(record.id, record.courseName)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove course</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Add Enrolled Course to Tracker</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the course name, catalog code, and institutional minimum threshold.
            </p>

            <form onSubmit={handleAddNewCourse} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS 305"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Target Attendance: {newMinTarget}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={newMinTarget}
                  onChange={(e) => setNewMinTarget(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
