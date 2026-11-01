export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type SessionStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  collegeName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code?: string;
  color: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  subjectId?: string;
  subjectName: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  createdAt: string;
  completedAt?: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string;
  subjectName: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM" or "14:00"
  duration: number; // in minutes
  notes?: string;
  status: SessionStatus;
  createdAt: string;
}

export interface AISessionItem {
  id: string;
  day: string;
  date: string;
  subject: string;
  title: string;
  startTime: string;
  duration: number;
  topic: string;
  priority: Priority;
  reason: string;
  selected?: boolean;
}

export interface AIGeneratedPlan {
  overview: string;
  weeklyStrategy: string;
  sessions: AISessionItem[];
  tips: string[];
}

export type AppRoute =
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'study-planner'
  | 'ai-planner'
  | 'settings'
  | 'login'
  | 'signup'
  | 'forgot-password';
