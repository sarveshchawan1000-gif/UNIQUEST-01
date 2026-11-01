import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Subject,
  Task,
  StudySession,
  AppRoute,
  AISessionItem,
  Priority,
  TaskStatus,
  SessionStatus,
} from '../types';
import {
  isSupabaseConfigured,
  supabase,
  DEFAULT_USER_PROFILE,
  INITIAL_DEMO_SUBJECTS,
  INITIAL_DEMO_TASKS,
  INITIAL_DEMO_SESSIONS,
} from '../lib/supabase';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  currentRoute: AppRoute;
  setCurrentRoute: (route: AppRoute) => void;
  storageMode: 'supabase' | 'demo_local';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Modals
  isAddTaskModalOpen: boolean;
  taskModalInitialData: Partial<Task> | null;
  openAddTaskModal: (initialData?: Partial<Task>) => void;
  closeAddTaskModal: () => void;
  isAddSessionModalOpen: boolean;
  sessionModalInitialData: Partial<StudySession> | null;
  openAddSessionModal: (initialData?: Partial<StudySession>) => void;
  closeAddSessionModal: () => void;
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, email: string, password: string, collegeName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  // Study session actions
  addStudySession: (session: Omit<StudySession, 'id' | 'userId' | 'createdAt'>) => Promise<StudySession>;
  updateStudySession: (id: string, updates: Partial<StudySession>) => Promise<StudySession>;
  deleteStudySession: (id: string) => Promise<void>;
  toggleSessionComplete: (id: string) => Promise<void>;
  saveAISessions: (aiSessions: AISessionItem[]) => Promise<number>;
  // Subject actions
  addSubject: (name: string, code?: string, color?: string) => Promise<Subject>;
  // Data management
  resetToDemoData: () => void;
  configureSupabase: (url: string, key: string) => Promise<{ success: boolean; error?: string }>;
  disconnectSupabase: () => void;
  // Toasts
  toasts: Toast[];
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storageMode, setStorageMode] = useState<'supabase' | 'demo_local'>(
    isSupabaseConfigured ? 'supabase' : 'demo_local'
  );
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('uniquest_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER_PROFILE;
      }
    }
    // Default authenticated demo student for seamless experience
    return DEFAULT_USER_PROFILE;
  });

  const isValidUUID = (id?: string): boolean => {
    if (!id) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  };

  const [currentRoute, setCurrentRouteState] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as AppRoute;
      const validRoutes: AppRoute[] = [
        'dashboard',
        'tasks',
        'calendar',
        'study-planner',
        'ai-planner',
        'attendance',
        'exams',
        'coding-practice',
        'notes',
        'career',
        'projects-teamwork',
        'campus-life',
        'focus-timer',
        'budget',
        'personal-organizer',
        'settings',
        'login',
        'signup',
        'forgot-password',
      ];
      if (hash && validRoutes.includes(hash)) return hash;
    }
    return 'dashboard';
  });

  const setCurrentRoute = (route: AppRoute) => {
    setCurrentRouteState(route);
    if (typeof window !== 'undefined') {
      window.location.hash = route;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppRoute;
      const validRoutes: AppRoute[] = [
        'dashboard',
        'tasks',
        'calendar',
        'study-planner',
        'ai-planner',
        'settings',
        'login',
        'signup',
        'forgot-password',
      ];
      if (hash && validRoutes.includes(hash)) {
        setCurrentRouteState(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskModalInitialData, setTaskModalInitialData] = useState<Partial<Task> | null>(null);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [sessionModalInitialData, setSessionModalInitialData] = useState<Partial<StudySession> | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('uniquest_subjects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_SUBJECTS;
      }
    }
    return INITIAL_DEMO_SUBJECTS;
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('uniquest_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_TASKS;
      }
    }
    return INITIAL_DEMO_TASKS;
  });

  // Study Sessions
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('uniquest_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_SESSIONS;
      }
    }
    return INITIAL_DEMO_SESSIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('uniquest_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('uniquest_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('uniquest_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('uniquest_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('uniquest_sessions', JSON.stringify(studySessions));
  }, [studySessions]);

  // Handle Supabase live session if available
  useEffect(() => {
    if (supabase && storageMode === 'supabase') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchSupabaseData(session.user.id);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchSupabaseData(session.user.id);
        } else {
          // If logged out on live supabase
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [storageMode]);

  const fetchSupabaseData = async (userId: string) => {
    if (!supabase) return;
    try {
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setUser({
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name,
          collegeName: profileData.college_name,
          avatarUrl: profileData.avatar_url,
          createdAt: profileData.created_at,
        });
      }

      // 2. Fetch Subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId);

      if (subjectsData && subjectsData.length > 0) {
        setSubjects(
          subjectsData.map((s) => ({
            id: s.id,
            userId: s.user_id,
            name: s.name,
            code: s.code,
            color: s.color,
            createdAt: s.created_at,
          }))
        );
      }

      // 3. Fetch Tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (tasksData) {
        setTasks(
          tasksData.map((t) => ({
            id: t.id,
            userId: t.user_id,
            subjectId: t.subject_id,
            subjectName: t.subject_name,
            title: t.title,
            description: t.description || '',
            priority: t.priority as Priority,
            status: t.status as TaskStatus,
            dueDate: t.due_date,
            dueTime: t.due_time,
            createdAt: t.created_at,
            completedAt: t.completed_at,
          }))
        );
      }

      // 4. Fetch Study Sessions
      const { data: sessionsData } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (sessionsData) {
        setStudySessions(
          sessionsData.map((s) => ({
            id: s.id,
            userId: s.user_id,
            subjectId: s.subject_id,
            subjectName: s.subject_name,
            title: s.title,
            date: s.date,
            startTime: s.start_time,
            duration: s.duration,
            notes: s.notes || '',
            status: s.status as SessionStatus,
            createdAt: s.created_at,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    }
  };

  // Auth Functions
  const login = async (email: string, password: string) => {
    if (supabase && storageMode === 'supabase') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        await fetchSupabaseData(data.user.id);
        setCurrentRoute('dashboard');
        showToast('success', `Welcome back, ${data.user.user_metadata?.full_name || 'Student'}!`);
        return { success: true };
      }
    }

    // Local authentication for demo/standalone
    if (email.trim() && password.length >= 6) {
      const loggedUser: UserProfile = {
        id: user?.id || 'demo-student-id',
        email: email.trim(),
        fullName: user?.fullName || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        collegeName: user?.collegeName || 'Stanford University',
        createdAt: user?.createdAt || new Date().toISOString(),
      };
      setUser(loggedUser);
      setCurrentRoute('dashboard');
      showToast('success', `Welcome back, ${loggedUser.fullName}!`);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password (minimum 6 characters).' };
  };

  const signup = async (fullName: string, email: string, password: string, collegeName?: string) => {
    if (supabase && storageMode === 'supabase') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            college_name: collegeName || '',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const newUser: UserProfile = {
          id: data.user.id,
          email: data.user.email!,
          fullName: fullName,
          collegeName: collegeName || '',
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        setCurrentRoute('dashboard');
        showToast('success', `Account created! Welcome to UNIQUEST, ${fullName}!`);
        return { success: true };
      }
    }

    // Local signup
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      fullName: fullName.trim(),
      collegeName: collegeName?.trim() || 'College of Engineering',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setCurrentRoute('dashboard');
    showToast('success', `Welcome to UNIQUEST, ${fullName}!`);
    return { success: true };
  };

  const logout = async () => {
    if (supabase && storageMode === 'supabase') {
      await supabase.auth.signOut();
    }
    setUser(null);
    setCurrentRoute('login');
    showToast('info', 'You have been signed out.');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: 'No user active' };
    const updated = { ...user, ...updates };
    setUser(updated);

    if (supabase && storageMode === 'supabase') {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.fullName,
            college_name: updated.collegeName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (err: any) {
        console.error('Error updating profile in Supabase:', err);
      }
    }

    showToast('success', 'Profile updated successfully.');
    return { success: true };
  };

  // Modals helpers
  const openAddTaskModal = (initialData?: Partial<Task>) => {
    setTaskModalInitialData(initialData || null);
    setIsAddTaskModalOpen(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setTaskModalInitialData(null);
  };

  const openAddSessionModal = (initialData?: Partial<StudySession>) => {
    setSessionModalInitialData(initialData || null);
    setIsAddSessionModalOpen(true);
  };

  const closeAddSessionModal = () => {
    setIsAddSessionModalOpen(false);
    setSessionModalInitialData(null);
  };

  // Task Operations
  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt'>): Promise<Task> => {
    const userId = user?.id || 'demo-student-id';
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    if (supabase && storageMode === 'supabase') {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            subject_id: isValidUUID(newTask.subjectId) ? newTask.subjectId : null,
            subject_name: newTask.subjectName,
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            status: newTask.status,
            due_date: newTask.dueDate,
            due_time: newTask.dueTime || null,
          })
          .select()
          .single();

        if (!error && data) {
          newTask.id = data.id;
        }
      } catch (err) {
        console.error('Error inserting task to Supabase:', err);
      }
    }

    setTasks((prev) => [newTask, ...prev]);
    showToast('success', `Task "${newTask.title}" added successfully.`);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedTask = { ...t, ...updates };
          return updatedTask;
        }
        return t;
      })
    );

    if (supabase && storageMode === 'supabase') {
      try {
        const supabaseUpdates: any = {};
        if (updates.title !== undefined) supabaseUpdates.title = updates.title;
        if (updates.description !== undefined) supabaseUpdates.description = updates.description;
        if (updates.subjectName !== undefined) supabaseUpdates.subject_name = updates.subjectName;
        if (updates.subjectId !== undefined) {
          supabaseUpdates.subject_id = isValidUUID(updates.subjectId) ? updates.subjectId : null;
        }
        if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
        if (updates.status !== undefined) supabaseUpdates.status = updates.status;
        if (updates.dueDate !== undefined) supabaseUpdates.due_date = updates.dueDate;
        if (updates.dueTime !== undefined) supabaseUpdates.due_time = updates.dueTime;
        if (updates.completedAt !== undefined) supabaseUpdates.completed_at = updates.completedAt;

        await supabase.from('tasks').update(supabaseUpdates).eq('id', id);
      } catch (err) {
        console.error('Error updating task in Supabase:', err);
      }
    }

    showToast('success', 'Task updated.');
    return updatedTask!;
  };

  const deleteTask = async (id: string): Promise<void> => {
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (supabase && storageMode === 'supabase') {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting task in Supabase:', err);
      }
    }

    showToast('info', `Task "${taskToDelete?.title || ''}" deleted.`);
  };

  const toggleTaskComplete = async (id: string): Promise<void> => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const newStatus: TaskStatus = target.status === 'Completed' ? 'Pending' : 'Completed';
    const completedAt = newStatus === 'Completed' ? new Date().toISOString() : undefined;

    await updateTask(id, { status: newStatus, completedAt });
    if (newStatus === 'Completed') {
      showToast('success', `Completed: "${target.title}"! Great job!`);
    }
  };

  // Study Session Operations
  const addStudySession = async (sessionData: Omit<StudySession, 'id' | 'userId' | 'createdAt'>): Promise<StudySession> => {
    const userId = user?.id || 'demo-student-id';
    const newSession: StudySession = {
      ...sessionData,
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    if (supabase && storageMode === 'supabase') {
      try {
        const { data, error } = await supabase
          .from('study_sessions')
          .insert({
            user_id: userId,
            subject_id: isValidUUID(newSession.subjectId) ? newSession.subjectId : null,
            subject_name: newSession.subjectName,
            title: newSession.title,
            date: newSession.date,
            start_time: newSession.startTime,
            duration: newSession.duration,
            notes: newSession.notes,
            status: newSession.status,
          })
          .select()
          .single();

        if (!error && data) {
          newSession.id = data.id;
        }
      } catch (err) {
        console.error('Error inserting session in Supabase:', err);
      }
    }

    setStudySessions((prev) => [newSession, ...prev]);
    showToast('success', `Study session "${newSession.title}" added to schedule.`);
    return newSession;
  };

  const updateStudySession = async (id: string, updates: Partial<StudySession>): Promise<StudySession> => {
    let updatedSession: StudySession | null = null;
    setStudySessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedSession = { ...s, ...updates };
          return updatedSession;
        }
        return s;
      })
    );

    if (supabase && storageMode === 'supabase') {
      try {
        const supabaseUpdates: any = {};
        if (updates.title !== undefined) supabaseUpdates.title = updates.title;
        if (updates.subjectName !== undefined) supabaseUpdates.subject_name = updates.subjectName;
        if (updates.date !== undefined) supabaseUpdates.date = updates.date;
        if (updates.startTime !== undefined) supabaseUpdates.start_time = updates.startTime;
        if (updates.duration !== undefined) supabaseUpdates.duration = updates.duration;
        if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
        if (updates.status !== undefined) supabaseUpdates.status = updates.status;

        await supabase.from('study_sessions').update(supabaseUpdates).eq('id', id);
      } catch (err) {
        console.error('Error updating session in Supabase:', err);
      }
    }

    showToast('success', 'Study session updated.');
    return updatedSession!;
  };

  const deleteStudySession = async (id: string): Promise<void> => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));

    if (supabase && storageMode === 'supabase') {
      try {
        await supabase.from('study_sessions').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting session in Supabase:', err);
      }
    }

    showToast('info', 'Study session removed.');
  };

  const toggleSessionComplete = async (id: string): Promise<void> => {
    const target = studySessions.find((s) => s.id === id);
    if (!target) return;

    const newStatus: SessionStatus = target.status === 'Completed' ? 'Scheduled' : 'Completed';
    await updateStudySession(id, { status: newStatus });
    if (newStatus === 'Completed') {
      showToast('success', `Completed study session: "${target.title}"! Keep the momentum!`);
    }
  };

  const saveAISessions = async (aiSessions: AISessionItem[]): Promise<number> => {
    const userId = user?.id || 'demo-student-id';
    const newSessions: StudySession[] = aiSessions.map((ai) => ({
      id: `session-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      subjectName: ai.subject,
      title: `${ai.title}: ${ai.topic}`,
      date: ai.date,
      startTime: ai.startTime,
      duration: ai.duration,
      notes: `AI Focus: ${ai.topic}. Strategy: ${ai.reason}`,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    }));

    if (supabase && storageMode === 'supabase') {
      try {
        await supabase.from('study_sessions').insert(
          newSessions.map((s) => ({
            user_id: userId,
            subject_name: s.subjectName,
            title: s.title,
            date: s.date,
            start_time: s.startTime,
            duration: s.duration,
            notes: s.notes,
            status: s.status,
          }))
        );
      } catch (err) {
        console.error('Error bulk inserting AI sessions to Supabase:', err);
      }
    }

    setStudySessions((prev) => [...newSessions, ...prev]);
    showToast('success', `Added ${newSessions.length} AI study sessions to your active Study Planner!`);
    return newSessions.length;
  };

  const addSubject = async (name: string, code?: string, color: string = '#2563EB'): Promise<Subject> => {
    const userId = user?.id || 'demo-student-id';
    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      userId,
      name: name.trim(),
      code: code?.trim() || '',
      color,
      createdAt: new Date().toISOString(),
    };

    if (supabase && storageMode === 'supabase') {
      try {
        const { data } = await supabase
          .from('subjects')
          .insert({
            user_id: userId,
            name: newSubj.name,
            code: newSubj.code,
            color: newSubj.color,
          })
          .select()
          .single();
        if (data) newSubj.id = data.id;
      } catch (err) {
        console.error('Error adding subject in Supabase:', err);
      }
    }

    setSubjects((prev) => [...prev, newSubj]);
    showToast('success', `Subject "${newSubj.name}" registered.`);
    return newSubj;
  };

  // Reset to demo data
  const resetToDemoData = () => {
    localStorage.removeItem('uniquest_tasks');
    localStorage.removeItem('uniquest_sessions');
    localStorage.removeItem('uniquest_subjects');
    localStorage.removeItem('uniquest_user');
    setUser(DEFAULT_USER_PROFILE);
    setTasks(INITIAL_DEMO_TASKS);
    setStudySessions(INITIAL_DEMO_SESSIONS);
    setSubjects(INITIAL_DEMO_SUBJECTS);
    showToast('info', 'Demo student workspace data restored to fresh sample state.');
  };

  const configureSupabase = async (url: string, key: string) => {
    try {
      localStorage.setItem('uniquest_supabase_url', url);
      localStorage.setItem('uniquest_supabase_key', key);
      window.location.reload();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const disconnectSupabase = () => {
    localStorage.removeItem('uniquest_supabase_url');
    localStorage.removeItem('uniquest_supabase_key');
    setStorageMode('demo_local');
    showToast('info', 'Switched to Local Demonstration storage mode.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        tasks,
        subjects,
        studySessions,
        currentRoute,
        setCurrentRoute,
        storageMode,
        searchQuery,
        setSearchQuery,
        isAddTaskModalOpen,
        taskModalInitialData,
        openAddTaskModal,
        closeAddTaskModal,
        isAddSessionModalOpen,
        sessionModalInitialData,
        openAddSessionModal,
        closeAddSessionModal,
        login,
        signup,
        logout,
        updateProfile,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        toggleSessionComplete,
        saveAISessions,
        addSubject,
        resetToDemoData,
        configureSupabase,
        disconnectSupabase,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
