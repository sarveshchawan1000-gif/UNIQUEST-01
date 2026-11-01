import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { SessionStatus } from '../../types';
import { Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';

export const StudySessionModal: React.FC = () => {
  const {
    isAddSessionModalOpen,
    closeAddSessionModal,
    sessionModalInitialData,
    addStudySession,
    updateStudySession,
    subjects,
  } = useApp();

  const isEditing = Boolean(sessionModalInitialData?.id);

  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<SessionStatus>('Scheduled');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAddSessionModalOpen) {
      if (sessionModalInitialData) {
        setTitle(sessionModalInitialData.title || '');
        setSubjectName(sessionModalInitialData.subjectName || subjects[0]?.name || 'General');
        setSubjectId(sessionModalInitialData.subjectId || subjects[0]?.id);
        setDate(sessionModalInitialData.date || new Date().toISOString().split('T')[0]);
        setStartTime(sessionModalInitialData.startTime || '10:00 AM');
        setDuration(sessionModalInitialData.duration || 60);
        setNotes(sessionModalInitialData.notes || '');
        setStatus(sessionModalInitialData.status || 'Scheduled');
      } else {
        setTitle('');
        setSubjectName(subjects[0]?.name || 'Data Structures & Algorithms');
        setSubjectId(subjects[0]?.id);
        setDate(new Date().toISOString().split('T')[0]);
        setStartTime('02:00 PM');
        setDuration(60);
        setNotes('');
        setStatus('Scheduled');
      }
      setErrors({});
    }
  }, [isAddSessionModalOpen, sessionModalInitialData, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Session title is required';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    if (!startTime.trim()) {
      newErrors.startTime = 'Start time is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && sessionModalInitialData?.id) {
        await updateStudySession(sessionModalInitialData.id, {
          title: title.trim(),
          subjectName: subjectName.trim(),
          subjectId,
          date,
          startTime: startTime.trim(),
          duration: Number(duration),
          notes: notes.trim(),
          status,
        });
      } else {
        await addStudySession({
          title: title.trim(),
          subjectName: subjectName.trim(),
          subjectId,
          date,
          startTime: startTime.trim(),
          duration: Number(duration),
          notes: notes.trim(),
          status,
        });
      }
      closeAddSessionModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAddSessionModalOpen}
      onClose={closeAddSessionModal}
      title={isEditing ? 'Edit Study Session' : 'Schedule Study Session'}
      subtitle="Dedicate focused blocks of time for deep learning and retention."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Session Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g. Chapter 4 Practice Problems & Flashcards"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
              errors.title ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Subject
          </label>
          <div className="relative">
            <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <select
              value={subjectName}
              onChange={(e) => {
                setSubjectName(e.target.value);
                const s = subjects.find((subj) => subj.name === e.target.value);
                setSubjectId(s?.id);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Start Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.date ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Start Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 10:00 AM or 14:00"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Duration & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes (1 hr)</option>
              <option value={90}>90 minutes (1.5 hrs)</option>
              <option value={120}>120 minutes (2 hrs)</option>
              <option value={180}>180 minutes (3 hrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SessionStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Study Notes & Focus Areas
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key concepts to master, equations to derive, or practice questions to solve..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeAddSessionModal}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Schedule Session'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
