import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Priority, TaskStatus } from '../../types';
import { Plus, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const {
    isAddTaskModalOpen,
    closeAddTaskModal,
    taskModalInitialData,
    addTask,
    updateTask,
    subjects,
    addSubject,
  } = useApp();

  const isEditing = Boolean(taskModalInitialData?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick new subject state
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');

  // Populate when modal opens
  useEffect(() => {
    if (isAddTaskModalOpen) {
      if (taskModalInitialData) {
        setTitle(taskModalInitialData.title || '');
        setDescription(taskModalInitialData.description || '');
        setSubjectName(taskModalInitialData.subjectName || (subjects[0]?.name || 'General Studies'));
        setSubjectId(taskModalInitialData.subjectId || subjects[0]?.id);
        setPriority(taskModalInitialData.priority || 'Medium');
        setStatus(taskModalInitialData.status || 'Pending');
        setDueDate(taskModalInitialData.dueDate || new Date().toISOString().split('T')[0]);
        setDueTime(taskModalInitialData.dueTime || '23:59');
      } else {
        // Reset defaults
        setTitle('');
        setDescription('');
        setSubjectName(subjects[0]?.name || 'Data Structures & Algorithms');
        setSubjectId(subjects[0]?.id);
        setPriority('Medium');
        setStatus('Pending');
        setDueDate(new Date().toISOString().split('T')[0]);
        setDueTime('23:59');
      }
      setErrors({});
      setIsAddingNewSubject(false);
    }
  }, [isAddTaskModalOpen, taskModalInitialData, subjects]);

  const handleSubjectChange = (name: string) => {
    if (name === '__add_new__') {
      setIsAddingNewSubject(true);
      return;
    }
    setSubjectName(name);
    const found = subjects.find((s) => s.name === name);
    setSubjectId(found?.id);
  };

  const handleCreateQuickSubject = async () => {
    if (!newSubjectName.trim()) return;
    const created = await addSubject(newSubjectName.trim(), newSubjectCode.trim());
    setSubjectName(created.name);
    setSubjectId(created.id);
    setIsAddingNewSubject(false);
    setNewSubjectName('');
    setNewSubjectCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (!subjectName.trim()) {
      newErrors.subjectName = 'Please select or add a subject';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && taskModalInitialData?.id) {
        await updateTask(taskModalInitialData.id, {
          title: title.trim(),
          description: description.trim(),
          subjectName: subjectName.trim(),
          subjectId,
          priority,
          status,
          dueDate,
          dueTime: dueTime || undefined,
        });
      } else {
        await addTask({
          title: title.trim(),
          description: description.trim(),
          subjectName: subjectName.trim(),
          subjectId,
          priority,
          status,
          dueDate,
          dueTime: dueTime || undefined,
        });
      }
      closeAddTaskModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAddTaskModalOpen}
      onClose={closeAddTaskModal}
      title={isEditing ? 'Edit Academic Task' : 'Create New Academic Task'}
      subtitle="Organise your coursework, labs, homework, and exam prep."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g. Implement Dijkstra Algorithm & Benchmark"
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

        {/* Subject Selector & Quick Add */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Subject / Course <span className="text-red-500">*</span>
          </label>
          {!isAddingNewSubject ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={subjectName}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Subject...</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNewSubject(true)}
                className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors shrink-0"
              >
                + New
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-xs font-medium text-slate-700">Add New Subject</div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Subject Name (e.g. Physics)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="col-span-2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <input
                  type="text"
                  placeholder="Code (PHYS 101)"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNewSubject(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateQuickSubject}
                  className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Subject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(['Low', 'Medium', 'High'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      isSelected
                        ? p === 'High'
                          ? 'bg-red-600 text-white shadow-xs'
                          : p === 'Medium'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Due Date & Due Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.dueDate ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Due Time (Optional)
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description / Requirements
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add deliverables, grading rubric notes, link to portal, or textbook references..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeAddTaskModal}
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
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
