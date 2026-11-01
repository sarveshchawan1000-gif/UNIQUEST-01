import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  School,
  Database,
  Key,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Save,
  Code,
  ExternalLink,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateProfile,
    logout,
    resetToDemoData,
    storageMode,
    configureSupabase,
    disconnectSupabase,
    showToast,
  } = useApp();

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [collegeName, setCollegeName] = useState(user?.collegeName || '');
  const [email] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Supabase connection state
  const [supabaseUrl, setSupabaseUrl] = useState(() =>
    localStorage.getItem('uniquest_supabase_url') || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(() =>
    localStorage.getItem('uniquest_supabase_key') || ''
  );
  const [isCopiedSQL, setIsCopiedSQL] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateProfile({
      fullName: fullName.trim(),
      collegeName: collegeName.trim(),
    });
    setIsSavingProfile(false);
  };

  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      showToast('error', 'Please provide both Supabase Project URL and Anon Public Key.');
      return;
    }
    await configureSupabase(supabaseUrl.trim(), supabaseKey.trim());
  };

  const sqlSchemaSnippet = `-- ============================================================================
-- UNIQUEST Supabase Database Schema & Row Level Security (RLS) Policies
-- Paste into Supabase SQL Editor and click RUN
-- ============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  college_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT DEFAULT '',
  color TEXT DEFAULT '#2563EB',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subjects"
  ON public.subjects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  subject_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) NOT NULL DEFAULT 'Medium',
  status TEXT CHECK (status IN ('Pending', 'In Progress', 'Completed')) NOT NULL DEFAULT 'Pending',
  due_date DATE NOT NULL,
  due_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks"
  ON public.tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  subject_name TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  notes TEXT DEFAULT '',
  status TEXT CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')) NOT NULL DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study sessions"
  ON public.study_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`;

  const copySQL = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setIsCopiedSQL(true);
    showToast('success', 'Supabase SQL schema copied to clipboard!');
    setTimeout(() => setIsCopiedSQL(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings & Backend Persistence
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your student profile, configure persistent Supabase database, and inspect data storage.
        </p>
      </div>

      {/* 1. STUDENT PROFILE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Student Profile</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your university affiliation and personal identification.
          </p>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              College / University Name
            </label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. Stanford University (School of Engineering)"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. DATABASE PERSISTENCE STATUS & SUPABASE CONFIG */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>Database Persistence & Supabase Integration</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly adherence to Section 13: Live PostgreSQL backend with Row-Level Security.
            </p>
          </div>

          {/* Current Status Badge */}
          {storageMode === 'supabase' ? (
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700">
                Supabase Connected
              </span>
              <div className="text-[10px] text-slate-400 font-mono">PostgreSQL RLS Active</div>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900">
                Local Demonstration Mode
              </span>
              <div className="text-[10px] text-slate-400 font-mono">Browser Storage Persistent</div>
            </div>
          )}
        </div>

        {/* Informational callout per Section 13 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Persistence Architecture Details</span>
          </div>
          <p>
            UNIQUEST operates in <strong>Demonstration Mode (Local Storage)</strong> by default so
            that all tasks, schedules, and AI plans persist reliably across browser reloads without
            requiring external cloud credentials.
          </p>
          <p>
            To connect to a live Supabase PostgreSQL project with real Row Level Security (RLS), enter
            your project URL and anon public key below.
          </p>
        </div>

        {/* Supabase Connection Form */}
        <form onSubmit={handleConnectSupabase} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Supabase Anon Public Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={copySQL}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              {isCopiedSQL ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{isCopiedSQL ? 'SQL Copied!' : 'Copy Supabase SQL Schema'}</span>
            </button>

            <div className="flex items-center gap-2">
              {storageMode === 'supabase' && (
                <button
                  type="button"
                  onClick={disconnectSupabase}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Disconnect Supabase
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <span>Connect & Reload</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. DATA MANAGEMENT & SAMPLE DATA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Workspace Data Management</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset or refresh your collegiate sample records for demonstration and testing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-900">Restore Fresh Sample Records</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Re-populates 6 realistic coursework tasks and 4 study sessions for testing.
            </div>
          </div>
          <button
            type="button"
            onClick={resetToDemoData}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restore Sample Data</span>
          </button>
        </div>

        <div className="pt-2 flex justify-between items-center">
          <span className="text-xs text-slate-500">Need to switch accounts?</span>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
