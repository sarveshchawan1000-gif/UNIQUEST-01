import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CourseNote } from '../../types';
import { INITIAL_COURSE_NOTES } from '../../lib/academicData';
import {
  FileText,
  Search,
  Plus,
  Pin,
  Tag,
  Copy,
  Check,
  Trash2,
  Edit3,
  BookOpen,
  Eye,
  Maximize2,
} from 'lucide-react';

export const NotesView: React.FC = () => {
  const { showToast } = useApp();

  const [notes, setNotes] = useState<CourseNote[]>(() => {
    const saved = localStorage.getItem('uniquest_course_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_COURSE_NOTES;
      }
    }
    return INITIAL_COURSE_NOTES;
  });

  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [activeNote, setActiveNote] = useState<CourseNote | null>(notes[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    localStorage.setItem('uniquest_course_notes', JSON.stringify(notes));
  }, [notes]);

  const coursesList = Array.from(new Set(notes.map((n) => n.courseName)));

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.topic.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      n.content.toLowerCase().includes(search.toLowerCase());

    const matchesCourse = selectedCourse === 'All' || n.courseName === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned === b.pinned) {
      return b.updatedAt.localeCompare(a.updatedAt);
    }
    return a.pinned ? -1 : 1;
  });

  const handleSelectNote = (note: CourseNote) => {
    setActiveNote(note);
    setIsEditing(false);
  };

  const handleStartEdit = (note: CourseNote) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditCourse(note.courseName);
    setEditTopic(note.topic);
    setEditTags(note.tags.join(', '));
    setEditContent(note.content);
    setIsEditing(true);
  };

  const handleStartNewNote = () => {
    const newNoteTemplate: CourseNote = {
      id: `note-${Date.now()}`,
      title: 'Untitled Lecture Note',
      courseName: coursesList[0] || 'Computer Science',
      topic: 'Lecture Summary',
      tags: ['Study'],
      content: `# Lecture Notes\n\n## 1. Core Concepts\n- Key takeaway point here.\n\n## 2. Code or Formulas\n\`\`\`ts\n// sample code snippet\nconst result = compute();\n\`\`\`\n\n## Summary\nReview before next lab.`,
      pinned: false,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setNotes((prev) => [newNoteTemplate, ...prev]);
    setActiveNote(newNoteTemplate);
    setEditTitle(newNoteTemplate.title);
    setEditCourse(newNoteTemplate.courseName);
    setEditTopic(newNoteTemplate.topic);
    setEditTags(newNoteTemplate.tags.join(', '));
    setEditContent(newNoteTemplate.content);
    setIsEditing(true);
    showToast('info', 'Created new note draft.');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote) return;

    const updated: CourseNote = {
      ...activeNote,
      title: editTitle.trim() || 'Untitled Note',
      courseName: editCourse.trim() || 'General',
      topic: editTopic.trim() || 'General',
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      content: editContent,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setActiveNote(updated);
    setIsEditing(false);
    showToast('success', `Saved "${updated.title}".`);
  };

  const handleTogglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
    if (activeNote?.id === noteId) {
      setActiveNote((prev) => (prev ? { ...prev, pinned: !prev.pinned } : null));
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (activeNote?.id === noteId) {
      const remaining = notes.filter((n) => n.id !== noteId);
      setActiveNote(remaining[0] || null);
      setIsEditing(false);
    }
    showToast('info', 'Note deleted.');
  };

  const handleCopyContent = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setIsCopied(true);
    showToast('success', 'Note copied to clipboard.');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Course Notes & Syllabus Summaries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organized academic repository with course tagging, markdown view, and instant search.
          </p>
        </div>

        <button
          onClick={handleStartNewNote}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main 2-Column Workspace: Sidebar list + Detail reader/editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notes Explorer List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes & tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Course Filter */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Courses ({notes.length})</option>
              {coursesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Notes Cards List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {sortedNotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No matching course notes found.
              </div>
            ) : (
              sortedNotes.map((n) => {
                const isSelected = activeNote?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                        {n.courseName}
                      </span>
                      {n.pinned && (
                        <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {n.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {n.content.replace(/[#*`_]/g, '')}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{n.topic}</span>
                      <span className="font-mono">{n.updatedAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Reader or Editor */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 min-h-[520px]">
          {activeNote ? (
            isEditing ? (
              /* Editing Mode */
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Editing Note
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Course Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editCourse}
                      onChange={(e) => setEditCourse(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={editTopic}
                      onChange={(e) => setEditTopic(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Content (Markdown Supported)
                  </label>
                  <textarea
                    rows={16}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              </form>
            ) : (
              /* Reading Mode */
              <div className="space-y-4">
                {/* Header Action Bar */}
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                      {activeNote.courseName}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-600">
                      {activeNote.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePin(activeNote.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        activeNote.pinned
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={activeNote.pinned ? 'Unpin note' : 'Pin note to top'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleCopyContent}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Copy Markdown"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleStartEdit(activeNote)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteNote(activeNote.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {activeNote.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {activeNote.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {t}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-400 ml-auto font-mono">
                      Last revised: {activeNote.updatedAt}
                    </span>
                  </div>
                </div>

                {/* Rendered Markdown Content */}
                <div className="pt-4 border-t border-slate-100 prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                  {activeNote.content}
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
              <BookOpen className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs">Select a note from the explorer or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
