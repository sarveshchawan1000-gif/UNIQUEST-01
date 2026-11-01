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
  | 'attendance'
  | 'exams'
  | 'coding-practice'
  | 'notes'
  | 'career'
  | 'projects-teamwork'
  | 'campus-life'
  | 'focus-timer'
  | 'budget'
  | 'personal-organizer'
  | 'settings'
  | 'login'
  | 'signup'
  | 'forgot-password';

// --- Academics ---

export interface AttendanceRecord {
  id: string;
  courseName: string;
  courseCode: string;
  attendedClasses: number;
  totalClasses: number;
  minTargetPercentage: number; // e.g. 75
  history: {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'cancelled';
    notes?: string;
  }[];
}

export interface ExamItem {
  id: string;
  title: string;
  courseName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  location: string;
  topics: string[];
  weightage: string;
  targetScore: string;
  status: 'upcoming' | 'completed';
  notes?: string;
}

export interface RevisionTopic {
  id: string;
  courseName: string;
  topic: string;
  round1Completed: boolean; // First thorough read
  round2Completed: boolean; // Active recall & flashcards
  round3Completed: boolean; // Past exam questions
  confidence: number; // 1 to 5
  nextRevisionDate: string;
  notes?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  platform: 'LeetCode' | 'HackerRank' | 'Codeforces' | 'NeetCode';
  status: 'Solved' | 'In Progress' | 'Review Needed' | 'Todo';
  solutionUrl?: string;
  solutionCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  notes?: string;
  lastPracticed: string;
}

export interface CourseNote {
  id: string;
  title: string;
  courseName: string;
  topic: string;
  tags: string[];
  content: string;
  pinned: boolean;
  updatedAt: string;
}

// --- Career ---

export interface ResumeAnalysisResult {
  score: number;
  summary: string;
  identifiedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  bulletSuggestions: { original: string; improved: string; reason: string }[];
}

export interface MockInterviewQuestion {
  id: string;
  category: 'Behavioral' | 'Frontend' | 'Backend' | 'Algorithms' | 'System Design';
  role: string;
  question: string;
  tips: string;
  sampleAnswer: string;
}

export interface SkillQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CareerRoadmap {
  id: string;
  title: string;
  category: string;
  description: string;
  stages: {
    title: string;
    description: string;
    skills: { name: string; completed: boolean }[];
  }[];
}

export interface MentorshipSession {
  id: string;
  mentorName: string;
  mentorRole: string;
  mentorCompany: string;
  date: string;
  topics: string;
  notes: string;
  actionItems: { text: string; done: boolean }[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  impactMetrics: string;
  featured: boolean;
}

// --- Student Life & Productivity ---

export interface ProjectWorkspace {
  id: string;
  title: string;
  description: string;
  courseOrCategory: string;
  dueDate: string;
  members: { name: string; role: string; email: string }[];
  milestones: { id: string; title: string; dueDate: string; completed: boolean }[];
  tasks: {
    id: string;
    title: string;
    assignedTo: string;
    status: 'To Do' | 'In Progress' | 'Done';
    dueDate: string;
  }[];
}

export interface CampusPlace {
  id: string;
  name: string;
  category: 'Library' | 'Dining' | 'Health' | 'Admin' | 'Lab' | 'Recreation';
  location: string;
  hours: string;
  contact?: string;
  notes?: string;
}

export interface CampusClub {
  id: string;
  name: string;
  category: string;
  description: string;
  lead: string;
  meetingTime: string;
  upcomingEvent?: { title: string; date: string; location: string };
  isMember: boolean;
}

export interface LostAndFoundItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  location: string;
  date: string;
  category: 'Electronics' | 'IDs & Cards' | 'Clothing' | 'Books' | 'Other';
  description: string;
  contactEmail: string;
  claimed: boolean;
}

export interface BudgetItem {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'Tuition' | 'Books & Tech' | 'Food' | 'Housing' | 'Transport' | 'Entertainment' | 'Allowance' | 'Part-time';
  date: string;
  notes?: string;
}

export interface RoutineHabit {
  id: string;
  title: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  streak: number;
  completedToday: boolean;
  category: 'Wellness' | 'Study' | 'Planning';
}

export interface PersonalReminder {
  id: string;
  title: string;
  category: 'Health' | 'Errands' | 'Finance' | 'Social';
  dueDate: string;
  completed: boolean;
}
