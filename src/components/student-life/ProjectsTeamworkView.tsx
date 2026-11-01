import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectWorkspace } from '../../types';
import { INITIAL_PROJECT_WORKSPACES } from '../../lib/studentLifeData';
import {
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Calendar,
  AlertCircle,
  Trash2,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export const ProjectsTeamworkView: React.FC = () => {
  const { showToast } = useApp();

  const [projects, setProjects] = useState<ProjectWorkspace[]>(() => {
    const saved = localStorage.getItem('uniquest_project_workspaces');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PROJECT_WORKSPACES;
      }
    }
    return INITIAL_PROJECT_WORKSPACES;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || '');
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // New project form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  useEffect(() => {
    localStorage.setItem('uniquest_project_workspaces', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Progress calculation
  const totalTasks = activeProject?.tasks.length || 0;
  const doneTasks = activeProject?.tasks.filter((t) => t.status === 'Done').length || 0;
  const progressPct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const handleToggleMilestone = (milestoneId: string) => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const updatedMilestones = proj.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        return { ...proj, milestones: updatedMilestones };
      })
    );
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    status: 'To Do' | 'In Progress' | 'Done'
  ) => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const updatedTasks = proj.tasks.map((t) =>
          t.id === taskId ? { ...t, status } : t
        );
        return { ...proj, tasks: updatedTasks };
      })
    );
    showToast('info', `Moved task to ${status}.`);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newTaskTitle.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignedTo: newTaskAssignee.trim() || 'Unassigned',
      status: 'To Do' as const,
      dueDate: newTaskDueDate || activeProject.dueDate,
    };

    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === activeProject.id
          ? { ...proj, tasks: [...proj.tasks, newTask] }
          : proj
      )
    );

    setIsAddTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setNewTaskDueDate('');
    showToast('success', `Added task "${newTask.title}".`);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj: ProjectWorkspace = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Collaborative team project.',
      courseOrCategory: newCategory.trim() || 'Group Assignment',
      dueDate: newDueDate || '2026-12-01',
      members: [{ name: 'Sarvesh Chawan', role: 'Team Lead', email: 'sarvesh@college.edu' }],
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Project Scoping & Architecture', dueDate: newDueDate, completed: false },
      ],
      tasks: [
        {
          id: `t-${Date.now()}-1`,
          title: 'Initial team kickoff meeting & task delegation',
          assignedTo: 'Sarvesh Chawan',
          status: 'In Progress',
          dueDate: newDueDate,
        },
      ],
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setIsAddProjectModalOpen(false);
    setNewTitle('');
    setNewCategory('');
    setNewDueDate('');
    setNewDescription('');
    showToast('success', `Created project workspace "${newProj.title}".`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Project Workspaces & Teamwork
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Group assignments, milestone deliverables, role delegation, and live task boards.
          </p>
        </div>

        <button
          onClick={() => setIsAddProjectModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Active Projects ({projects.length})
          </div>

          <div className="space-y-2">
            {projects.map((proj) => {
              const isSelected = activeProject?.id === proj.id;
              const pTasks = proj.tasks.length;
              const pDone = proj.tasks.filter((t) => t.status === 'Done').length;
              const pct = pTasks === 0 ? 0 : Math.round((pDone / pTasks) * 100);

              return (
                <div
                  key={proj.id}
                  onClick={() => setActiveProjectId(proj.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      {proj.courseOrCategory}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Due: {proj.dueDate}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                    {proj.title}
                  </h3>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {proj.members.length} members
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      {pct}% Completed
                    </span>
                  </div>

                  {/* Tiny progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Workspace & Task Board */}
        {activeProject && (
          <div className="lg:col-span-8 space-y-6">
            {/* Project Overview Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                    {activeProject.courseOrCategory}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-1.5">
                    {activeProject.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {activeProject.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">Deliverable Deadline</span>
                  <span className="text-sm font-mono font-bold text-slate-900">
                    {activeProject.dueDate}
                  </span>
                </div>
              </div>

              {/* Team Members List */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Team Members & Roles
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeProject.members.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block leading-tight">
                          {m.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          {m.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Key Milestones ({activeProject.milestones.filter((m) => m.completed).length} /{' '}
                  {activeProject.milestones.length})
                </span>
                <div className="space-y-1.5">
                  {activeProject.milestones.map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs cursor-pointer hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={m.completed}
                          onChange={() => handleToggleMilestone(m.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span
                          className={`font-medium ${
                            m.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{m.dueDate}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Kanban-Style Shared Task Columns */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Shared Team Task Board
                </h3>
                <button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Task</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* To Do Column */}
                {(['To Do', 'In Progress', 'Done'] as const).map((colStatus) => {
                  const colTasks = activeProject.tasks.filter((t) => t.status === colStatus);
                  const headerColor =
                    colStatus === 'To Do'
                      ? 'text-slate-700 bg-slate-100'
                      : colStatus === 'In Progress'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-emerald-700 bg-emerald-50';

                  return (
                    <div
                      key={colStatus}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${headerColor}`}>
                          {colStatus} ({colTasks.length})
                        </span>
                      </div>

                      <div className="space-y-2 min-h-[140px]">
                        {colTasks.length === 0 ? (
                          <div className="p-4 text-center text-[11px] text-slate-400 italic">
                            No tasks
                          </div>
                        ) : (
                          colTasks.map((t) => (
                            <div
                              key={t.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2 hover:border-slate-200 transition-all shadow-2xs"
                            >
                              <p className="font-semibold text-slate-900 leading-snug">
                                {t.title}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
                                <span className="font-medium text-slate-700">{t.assignedTo}</span>
                                <span className="font-mono">{t.dueDate}</span>
                              </div>

                              {/* Status Mover */}
                              <div className="flex gap-1 pt-1">
                                {colStatus !== 'To Do' && (
                                  <button
                                    onClick={() => handleUpdateTaskStatus(t.id, 'To Do')}
                                    className="text-[10px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
                                  >
                                    To Do
                                  </button>
                                )}
                                {colStatus !== 'In Progress' && (
                                  <button
                                    onClick={() => handleUpdateTaskStatus(t.id, 'In Progress')}
                                    className="text-[10px] text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                  >
                                    In Progress
                                  </button>
                                )}
                                {colStatus !== 'Done' && (
                                  <button
                                    onClick={() => handleUpdateTaskStatus(t.id, 'Done')}
                                    className="text-[10px] text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
                                  >
                                    Done
                                  </button>
                                )}
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
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Create Project Workspace</h2>
            <form onSubmit={handleCreateProject} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Database Capstone"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Capstone"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scope & Deliverables
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of project requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Assign Team Task</h2>
            <form onSubmit={handleAddTask} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement ROS2 subscriber node"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assignee Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Patel"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
