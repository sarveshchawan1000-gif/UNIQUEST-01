import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CodingProblem } from '../../types';
import { INITIAL_CODING_PROBLEMS } from '../../lib/academicData';
import {
  Code2,
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  FileCode2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const CodingPracticeView: React.FC = () => {
  const { showToast } = useApp();

  const [problems, setProblems] = useState<CodingProblem[]>(() => {
    const saved = localStorage.getItem('uniquest_coding_problems');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CODING_PROBLEMS;
      }
    }
    return INITIAL_CODING_PROBLEMS;
  });

  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeProblem, setActiveProblem] = useState<CodingProblem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New problem form
  const [newTitle, setNewTitle] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newTopic, setNewTopic] = useState('Arrays & Hashing');
  const [newPlatform, setNewPlatform] = useState<'LeetCode' | 'HackerRank' | 'Codeforces' | 'NeetCode'>('LeetCode');
  const [newUrl, setNewUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('uniquest_coding_problems', JSON.stringify(problems));
  }, [problems]);

  // Solved Stats
  const solvedCount = problems.filter((p) => p.status === 'Solved').length;
  const easySolved = problems.filter((p) => p.difficulty === 'Easy' && p.status === 'Solved').length;
  const mediumSolved = problems.filter((p) => p.difficulty === 'Medium' && p.status === 'Solved').length;
  const hardSolved = problems.filter((p) => p.difficulty === 'Hard' && p.status === 'Solved').length;

  const topicsList = Array.from(new Set(problems.map((p) => p.topic)));

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'All' || p.topic === selectedTopic;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    return matchesSearch && matchesDifficulty && matchesTopic && matchesStatus;
  });

  const handleUpdateStatus = (problemId: string, status: CodingProblem['status']) => {
    setProblems((prev) =>
      prev.map((p) =>
        p.id === problemId
          ? {
              ...p,
              status,
              lastPracticed: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );
    if (activeProblem && activeProblem.id === problemId) {
      setActiveProblem((prev) => (prev ? { ...prev, status } : null));
    }
    showToast('success', `Updated status to ${status}.`);
  };

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProblem: CodingProblem = {
      id: `code-${Date.now()}`,
      title: newTitle.trim(),
      difficulty: newDifficulty,
      topic: newTopic,
      platform: newPlatform,
      status: 'Todo',
      solutionUrl: newUrl.trim() || undefined,
      notes: newNotes.trim() || undefined,
      lastPracticed: new Date().toISOString().split('T')[0],
    };

    setProblems((prev) => [newProblem, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewUrl('');
    setNewNotes('');
    showToast('success', `Added "${newProblem.title}" to practice list.`);
  };

  const handleDeleteProblem = (id: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
    if (activeProblem?.id === id) setActiveProblem(null);
    showToast('info', 'Problem removed.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Coding Practice & DSA Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curate problem sets, track time/space complexities, and monitor interview readiness.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Problem</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Solved
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {solvedCount}
            </span>
            <span className="text-xs text-slate-400">/ {problems.length} total</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Easy Problems
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums mt-1.5">
            {easySolved}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Medium Problems
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono tabular-nums mt-1.5">
            {mediumSolved}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
            Hard Problems
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-700 font-mono tabular-nums mt-1.5">
            {hardSolved}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search problems by name, topic, or complexity notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Topics</option>
            {topicsList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Solved">Solved</option>
            <option value="In Progress">In Progress</option>
            <option value="Review Needed">Review Needed</option>
            <option value="Todo">Todo</option>
          </select>
        </div>
      </div>

      {/* Problem Cards Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3">Topic</th>
                <th className="py-3 px-3">Complexity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Practiced</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProblems.map((prob) => {
                const diffColor =
                  prob.difficulty === 'Easy'
                    ? 'text-emerald-700 bg-emerald-50'
                    : prob.difficulty === 'Medium'
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-red-700 bg-red-50';

                const statusColor =
                  prob.status === 'Solved'
                    ? 'text-emerald-700 bg-emerald-50'
                    : prob.status === 'In Progress'
                    ? 'text-blue-700 bg-blue-50'
                    : prob.status === 'Review Needed'
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-slate-600 bg-slate-100';

                return (
                  <tr
                    key={prob.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setActiveProblem(prob)}
                  >
                    <td className="py-3 px-4 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900 hover:text-blue-600">
                          {prob.title}
                        </span>
                        {prob.solutionUrl && (
                          <a
                            href={prob.solutionUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-blue-600 ml-1"
                            title="Open Problem Link"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono ml-6 block">
                        Platform: {prob.platform}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${diffColor}`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                      {prob.topic}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {prob.timeComplexity ? `${prob.timeComplexity} / ${prob.spaceComplexity}` : '—'}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusColor}`}
                      >
                        {prob.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {prob.lastPracticed}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProblem(prob.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problem Details & Notes Modal */}
      {activeProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {activeProblem.topic} • {activeProblem.platform}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeProblem.title}
                </h2>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-md ${
                  activeProblem.difficulty === 'Easy'
                    ? 'bg-emerald-50 text-emerald-700'
                    : activeProblem.difficulty === 'Medium'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {activeProblem.difficulty}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold block text-slate-500 mb-1">Algorithmic Complexity</span>
                <div className="flex gap-4 font-mono text-[11px]">
                  <span>Time: <strong>{activeProblem.timeComplexity || 'O(n)'}</strong></span>
                  <span>Space: <strong>{activeProblem.spaceComplexity || 'O(1)'}</strong></span>
                </div>
              </div>

              {activeProblem.notes && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <span className="font-semibold block text-blue-900 mb-1">Key Insight / Pattern Notes</span>
                  <p className="text-slate-700 leading-relaxed">{activeProblem.notes}</p>
                </div>
              )}

              {activeProblem.solutionUrl && (
                <div>
                  <a
                    href={activeProblem.solutionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-semibold"
                  >
                    <span>View original problem & editorial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Update Practice Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Solved', 'In Progress', 'Review Needed', 'Todo'] as CodingProblem['status'][]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(activeProblem.id, st)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                          activeProblem.status === st
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveProblem(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Problem Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Add Coding Problem</h2>
            <form onSubmit={handleAddProblem} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subarray Sum Equals K"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Platform</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="NeetCode">NeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic / Data Structure
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prefix Sum & Hash Maps"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Problem URL Link
                </label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Intuition / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Prefix sum hash map to store frequencies of cumSum - k..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
