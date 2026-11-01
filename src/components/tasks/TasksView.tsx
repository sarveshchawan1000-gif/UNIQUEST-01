import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, TaskStatus } from '../../types';
import { Modal } from '../ui/Modal';
import {
  Plus,
  Search,
  ArrowUpDown,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

type FilterType = 'All' | 'Pending' | 'In Progress' | 'Completed' | 'High Priority';
type SortType = 'dueDate' | 'priority' | 'recentlyCreated';

export const TasksView: React.FC = () => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    openAddTaskModal,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    subjects,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [activeSubject, setActiveSubject] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortType>('dueDate');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = task.description.toLowerCase().includes(q);
          const matchesSubject = task.subjectName.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesSubject) return false;
        }

        if (activeSubject !== 'All' && task.subjectName !== activeSubject) {
          return false;
        }

        switch (activeFilter) {
          case 'Pending':
            return task.status === 'Pending';
          case 'In Progress':
            return task.status === 'In Progress';
          case 'Completed':
            return task.status === 'Completed';
          case 'High Priority':
            return task.priority === 'High' && task.status !== 'Completed';
          case 'All':
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'priority') {
          const score = { High: 3, Medium: 2, Low: 1 };
          return score[b.priority] - score[a.priority];
        }
        if (sortBy === 'recentlyCreated') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [tasks, searchQuery, activeFilter, activeSubject, sortBy]);

  const confirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organise and track your academic deliverables, problem sets, and milestones.
          </p>
        </div>

        <button
          onClick={() => openAddTaskModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Control Bar: Segmented Filters, Subject, Sorting & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Tabs (Segmented Control) */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['All', 'Pending', 'In Progress', 'Completed', 'High Priority'] as FilterType[]).map(
              (filter) => {
                const count = tasks.filter((t) => {
                  if (filter === 'All') return true;
                  if (filter === 'Pending') return t.status === 'Pending';
                  if (filter === 'In Progress') return t.status === 'In Progress';
                  if (filter === 'Completed') return t.status === 'Completed';
                  if (filter === 'High Priority') return t.priority === 'High' && t.status !== 'Completed';
                  return true;
                }).length;

                const isActive = activeFilter === filter;

                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{filter}</span>
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-transparent text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* Subject & Sorting Dropdowns */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Subject Dropdown */}
            <select
              value={activeSubject}
              onChange={(e) => setActiveSubject(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="All">All Subjects ({subjects.length})</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="recentlyCreated">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, description or subject..."
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No tasks match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting another subject, or adding a new task.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => {
                setActiveFilter('All');
                setActiveSubject('All');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={() => openAddTaskModal()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              Add New Task
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            return (
              <div
                key={task.id}
                className={`bg-white p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'border-slate-200/70 bg-slate-50/50 opacity-70'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Completion checkbox */}
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>

                      {/* Status select & action icons */}
                      <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTask(task.id, {
                              status: e.target.value as TaskStatus,
                              completedAt:
                                e.target.value === 'Completed'
                                  ? new Date().toISOString()
                                  : undefined,
                            })
                          }
                          className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>

                        <button
                          onClick={() => openAddTaskModal(task)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit task"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Unboxed Metadata with · separator */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-700">
                        {task.subjectName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Due {task.dueDate}
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
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">
                        Status: <strong className="text-slate-600 font-medium">{task.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        title="Delete Task"
        subtitle="Are you sure you want to delete this task? This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold truncate">{taskToDelete?.title}</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setTaskToDelete(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
