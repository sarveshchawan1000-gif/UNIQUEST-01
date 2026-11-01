import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamItem, RevisionTopic } from '../../types';
import { INITIAL_EXAMS, INITIAL_REVISION_TOPICS } from '../../lib/academicData';
import {
  CalendarDays,
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  MapPin,
  FileCheck,
  Star,
  Trash2,
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const { addTask, addStudySession, showToast, setCurrentRoute } = useApp();

  const [activeTab, setActiveTab] = useState<'exams' | 'revision'>('exams');

  const [exams, setExams] = useState<ExamItem[]>(() => {
    const saved = localStorage.getItem('uniquest_exams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_EXAMS;
      }
    }
    return INITIAL_EXAMS;
  });

  const [revisionTopics, setRevisionTopics] = useState<RevisionTopic[]>(() => {
    const saved = localStorage.getItem('uniquest_revision_topics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_REVISION_TOPICS;
      }
    }
    return INITIAL_REVISION_TOPICS;
  });

  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);

  // New exam form state
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:30 AM');
  const [newLocation, setNewLocation] = useState('');
  const [newTopics, setNewTopics] = useState('');
  const [newWeightage, setNewWeightage] = useState('30% of grade');
  const [newTargetScore, setNewTargetScore] = useState('90/100');

  // New revision topic form state
  const [topicCourse, setTopicCourse] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicNextDate, setTopicNextDate] = useState('');

  useEffect(() => {
    localStorage.setItem('uniquest_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('uniquest_revision_topics', JSON.stringify(revisionTopics));
  }, [revisionTopics]);

  // Calculate days remaining
  const calculateDaysRemaining = (examDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(examDateStr);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Connect exam to Calendar and Study Planner
  const handleScheduleInCalendarAndPlanner = async (exam: ExamItem) => {
    try {
      // 1. Add as high-priority exam task on Calendar
      await addTask({
        title: `Exam: ${exam.title}`,
        description: `Topics: ${exam.topics.join(', ')}. Venue: ${exam.location}. Target: ${exam.targetScore}`,
        subjectName: exam.courseName,
        dueDate: exam.date,
        dueTime: exam.time.replace(/[^0-9:]/g, ''),
        priority: 'High',
        status: 'Pending',
      });

      // 2. Add an intensive study session 2 days prior
      const examDate = new Date(exam.date);
      examDate.setDate(examDate.getDate() - 2);
      const studyDateStr = examDate.toISOString().split('T')[0];

      await addStudySession({
        title: `Final Review for ${exam.courseName} Exam`,
        subjectName: exam.courseName,
        date: studyDateStr,
        startTime: '10:00 AM',
        duration: 90,
        notes: `Consolidate exam cheat sheet, formulas, and past papers.`,
        status: 'Scheduled',
      });

      showToast(
        'success',
        `Scheduled "${exam.title}" on Academic Calendar & pre-exam review session in Study Planner!`
      );
    } catch (err) {
      showToast('error', 'Failed to schedule exam in planner.');
    }
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const newExam: ExamItem = {
      id: `exam-${Date.now()}`,
      title: newTitle.trim(),
      courseName: newCourse.trim() || 'Core Subject',
      date: newDate,
      time: newTime.trim() || '09:00 AM',
      location: newLocation.trim() || 'Main Examination Hall',
      topics: newTopics.split(',').map((t) => t.trim()).filter(Boolean),
      weightage: newWeightage.trim() || '25% of grade',
      targetScore: newTargetScore.trim() || '85/100',
      status: 'upcoming',
    };

    setExams((prev) => [...prev, newExam].sort((a, b) => a.date.localeCompare(b.date)));
    setIsAddExamModalOpen(false);
    setNewTitle('');
    setNewCourse('');
    setNewDate('');
    setNewLocation('');
    setNewTopics('');
    showToast('success', `Added "${newExam.title}" to Exam Schedule.`);
  };

  const handleToggleRevisionRound = (topicId: string, round: 1 | 2 | 3) => {
    setRevisionTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        if (round === 1) return { ...t, round1Completed: !t.round1Completed };
        if (round === 2) return { ...t, round2Completed: !t.round2Completed };
        if (round === 3) return { ...t, round3Completed: !t.round3Completed };
        return t;
      })
    );
  };

  const handleSetConfidence = (topicId: string, confidence: number) => {
    setRevisionTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, confidence } : t))
    );
  };

  const handleAddRevisionTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;

    const newTopic: RevisionTopic = {
      id: `rev-${Date.now()}`,
      courseName: topicCourse.trim() || 'Core Course',
      topic: topicName.trim(),
      round1Completed: false,
      round2Completed: false,
      round3Completed: false,
      confidence: 3,
      nextRevisionDate: topicNextDate || new Date().toISOString().split('T')[0],
      notes: 'Active revision topic',
    };

    setRevisionTopics((prev) => [newTopic, ...prev]);
    setIsAddTopicModalOpen(false);
    setTopicName('');
    setTopicCourse('');
    setTopicNextDate('');
    showToast('success', `Added revision topic: ${newTopic.topic}`);
  };

  const handleDeleteExam = (id: string, title: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    showToast('info', `Removed exam "${title}".`);
  };

  const handleDeleteRevisionTopic = (id: string) => {
    setRevisionTopics((prev) => prev.filter((r) => r.id !== id));
    showToast('info', 'Removed revision topic.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Exam & Revision Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Exam schedules, live countdowns, syllabus checklists, and spaced repetition tracking.
          </p>
        </div>

        {/* Tab Switcher & CTA */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Exams ({exams.length})
            </button>
            <button
              onClick={() => setActiveTab('revision')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'revision'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revision Checklist ({revisionTopics.length})
            </button>
          </div>

          {activeTab === 'exams' ? (
            <button
              onClick={() => setIsAddExamModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exam</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddTopicModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Topic</span>
            </button>
          )}
        </div>
      </div>

      {/* EXAMS VIEW TAB */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {exams.map((exam) => {
              const daysLeft = calculateDaysRemaining(exam.date);
              const isUrgent = daysLeft >= 0 && daysLeft <= 7;
              const isPast = daysLeft < 0;

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Course Badge & Countdown */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                        {exam.courseName}
                      </span>
                      <div
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                          isPast
                            ? 'bg-slate-100 text-slate-500'
                            : isUrgent
                            ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isPast
                          ? 'Completed'
                          : daysLeft === 0
                          ? 'Today!'
                          : daysLeft === 1
                          ? 'Tomorrow'
                          : `in ${daysLeft} days`}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-3 leading-snug">
                      {exam.title}
                    </h3>

                    {/* Metadata Grid */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">
                          {exam.date} at {exam.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-600 truncate">{exam.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-600">
                          Weight: <strong className="text-slate-800">{exam.weightage}</strong> • Target:{' '}
                          <strong className="text-slate-800">{exam.targetScore}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Topics Checklist */}
                    {exam.topics && exam.topics.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Key Syllabus Topics
                        </div>
                        <ul className="space-y-1">
                          {exam.topics.map((t, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-600 flex items-start gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              <span className="leading-tight">{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions & Integration */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleScheduleInCalendarAndPlanner(exam)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                      title="Sync deadline to Academic Calendar & Study Planner"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Sync to Calendar & Planner</span>
                    </button>

                    <button
                      onClick={() => handleDeleteExam(exam.id, exam.title)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Remove exam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REVISION CHECKLIST TAB */}
      {activeTab === 'revision' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>3-Pass Active Recall Methodology:</strong> Round 1 (Thorough Read) → Round 2
                (Active Recall & Self-Quiz) → Round 3 (Past Exam Questions).
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md">
              {revisionTopics.filter((r) => r.round3Completed).length} / {revisionTopics.length} Mastered
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Subject & Topic</th>
                    <th className="py-3 px-3 text-center">Round 1 (Read)</th>
                    <th className="py-3 px-3 text-center">Round 2 (Recall)</th>
                    <th className="py-3 px-3 text-center">Round 3 (Past Papers)</th>
                    <th className="py-3 px-3 text-center">Confidence</th>
                    <th className="py-3 px-3">Next Scheduled</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revisionTopics.map((topic) => (
                    <tr key={topic.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 min-w-[200px]">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          {topic.courseName}
                        </span>
                        <span className="font-semibold text-slate-900 block mt-0.5">
                          {topic.topic}
                        </span>
                        {topic.notes && (
                          <span className="text-[11px] text-slate-500 italic block mt-0.5">
                            {topic.notes}
                          </span>
                        )}
                      </td>

                      {/* Round 1 Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleRevisionRound(topic.id, 1)}
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors cursor-pointer ${
                            topic.round1Completed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-transparent hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Round 2 Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleRevisionRound(topic.id, 2)}
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors cursor-pointer ${
                            topic.round2Completed
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-transparent hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Round 3 Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleRevisionRound(topic.id, 3)}
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors cursor-pointer ${
                            topic.round3Completed
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-transparent hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Confidence Stars */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleSetConfidence(topic.id, star)}
                              className="text-slate-300 hover:text-amber-400 cursor-pointer"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  star <= topic.confidence
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Next Scheduled Date */}
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {topic.nextRevisionDate}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteRevisionTopic(topic.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {isAddExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Add Upcoming Exam</h2>
            <form onSubmit={handleAddExam} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Examination: Algorithms"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course / Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures & Algorithms"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:30 AM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall B-101"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topics (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Trees, Graph algorithms, DP, Complexity"
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weightage</label>
                  <input
                    type="text"
                    placeholder="e.g. 30% of grade"
                    value={newWeightage}
                    onChange={(e) => setNewWeightage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Score</label>
                  <input
                    type="text"
                    placeholder="e.g. 90/100"
                    value={newTargetScore}
                    onChange={(e) => setNewTargetScore(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Revision Topic Modal */}
      {isAddTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Add Topic to Revision Checklist</h2>
            <form onSubmit={handleAddRevisionTopic} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems"
                  value={topicCourse}
                  onChange={(e) => setTopicCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B-Tree Indexing and Multi-level hashing"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Next Revision Date
                </label>
                <input
                  type="date"
                  value={topicNextDate}
                  onChange={(e) => setTopicNextDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTopicModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
