import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Subject, Task, StudySession } from '../types';

// Check if credentials exist in localStorage or Vite env
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('uniquest_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('uniquest_supabase_key') : null;

export const SUPABASE_URL = storedUrl || import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('your-project')
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabase = null;
  }
}

// Initial demo subjects
export const INITIAL_DEMO_SUBJECTS: Subject[] = [
  { id: 'subj-1', userId: 'demo-student-id', name: 'Data Structures & Algorithms', code: 'CS 301', color: '#2563EB', createdAt: new Date().toISOString() },
  { id: 'subj-2', userId: 'demo-student-id', name: 'Operating Systems', code: 'CS 312', color: '#7C3AED', createdAt: new Date().toISOString() },
  { id: 'subj-3', userId: 'demo-student-id', name: 'Computer Networks', code: 'CS 320', color: '#059669', createdAt: new Date().toISOString() },
  { id: 'subj-4', userId: 'demo-student-id', name: 'Linear Algebra', code: 'MATH 210', color: '#D97706', createdAt: new Date().toISOString() },
  { id: 'subj-5', userId: 'demo-student-id', name: 'Software Engineering', code: 'CS 340', color: '#DC2626', createdAt: new Date().toISOString() },
];

// Helper to get formatted relative dates (YYYY-MM-DD)
const getRelativeDateStr = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// Realistic initial tasks for a college student
export const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'task-1',
    userId: 'demo-student-id',
    subjectId: 'subj-1',
    subjectName: 'Data Structures & Algorithms',
    title: 'B-Tree & Red-Black Tree Coding Assignment',
    description: 'Implement insertion and rebalancing algorithms with unit test coverage.',
    priority: 'High',
    status: 'Pending',
    dueDate: getRelativeDateStr(0), // Today!
    dueTime: '23:59',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'task-2',
    userId: 'demo-student-id',
    subjectId: 'subj-2',
    subjectName: 'Operating Systems',
    title: 'Process Synchronization & Semaphore Lab',
    description: 'Solve the Dining Philosophers and Producer-Consumer concurrency problems using POSIX mutexes.',
    priority: 'High',
    status: 'In Progress',
    dueDate: getRelativeDateStr(1), // Tomorrow
    dueTime: '17:00',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'task-3',
    userId: 'demo-student-id',
    subjectId: 'subj-4',
    subjectName: 'Linear Algebra',
    title: 'Eigenvalues & Matrix Diagonalization Problem Set',
    description: 'Complete problems 14 through 28 in chapter 5 on symmetric matrices and quadratic forms.',
    priority: 'Medium',
    status: 'Pending',
    dueDate: getRelativeDateStr(2),
    dueTime: '14:00',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'task-4',
    userId: 'demo-student-id',
    subjectId: 'subj-3',
    subjectName: 'Computer Networks',
    title: 'TCP vs UDP Wireshark Packet Analysis Report',
    description: 'Capture packet traces during file download and video stream. Analyze TCP 3-way handshake and congestion window.',
    priority: 'Medium',
    status: 'Pending',
    dueDate: getRelativeDateStr(4),
    dueTime: '23:59',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'task-5',
    userId: 'demo-student-id',
    subjectId: 'subj-5',
    subjectName: 'Software Engineering',
    title: 'Sprint 2 Architectural Architecture Diagram & PR',
    description: 'Submit C4 architecture model and review pull requests for the backend REST API endpoints.',
    priority: 'Low',
    status: 'Completed',
    dueDate: getRelativeDateStr(-1),
    dueTime: '18:00',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'task-6',
    userId: 'demo-student-id',
    subjectId: 'subj-1',
    subjectName: 'Data Structures & Algorithms',
    title: 'Midterm Exam: Graph Theory & Shortest Path',
    description: 'Prepare Dijkstra, Bellman-Ford, Prim, and Kruskal proofs and time-complexity trade-offs.',
    priority: 'High',
    status: 'Pending',
    dueDate: getRelativeDateStr(6),
    dueTime: '09:00',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const INITIAL_DEMO_SESSIONS: StudySession[] = [
  {
    id: 'session-demo-1',
    userId: 'demo-student-id',
    subjectId: 'subj-1',
    subjectName: 'Data Structures & Algorithms',
    title: 'Red-Black Tree Balance Cases & Rotations',
    date: getRelativeDateStr(-2),
    startTime: '10:00 AM',
    duration: 90,
    notes: 'Mastered left-rotate and color flip rules. Need to write unit tests.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'session-demo-2',
    userId: 'demo-student-id',
    subjectId: 'subj-2',
    subjectName: 'Operating Systems',
    title: 'Virtual Memory & Page Replacement Algorithms',
    date: getRelativeDateStr(-1),
    startTime: '02:00 PM',
    duration: 60,
    notes: 'Reviewed LRU, Clock, and FIFO page fault rates.',
    status: 'Completed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'session-demo-3',
    userId: 'demo-student-id',
    subjectId: 'subj-1',
    subjectName: 'Data Structures & Algorithms',
    title: 'Assignment Debugging & Test Bench',
    date: getRelativeDateStr(0),
    startTime: '03:30 PM',
    duration: 90,
    notes: 'Fix edge cases when deleting nodes with two children.',
    status: 'Scheduled',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'session-demo-4',
    userId: 'demo-student-id',
    subjectId: 'subj-4',
    subjectName: 'Linear Algebra',
    title: 'Eigenvectors and Spectral Decomposition',
    date: getRelativeDateStr(1),
    startTime: '04:00 PM',
    duration: 60,
    notes: 'Solve textbook problems 15-20.',
    status: 'Scheduled',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'demo-student-id',
  email: 'alex.rivera@stanford.edu',
  fullName: 'Alex Rivera',
  collegeName: 'Stanford University (School of Engineering)',
  avatarUrl: '',
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
};
