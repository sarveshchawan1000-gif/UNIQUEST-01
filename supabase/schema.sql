-- ============================================================================
-- UNIQUEST Supabase Database Schema & Row Level Security (RLS) Policies
-- Migration: 20261101_init_uniquest.sql
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

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

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
  ON public.subjects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  subject_name TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- duration in minutes
  notes TEXT DEFAULT '',
  status TEXT CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')) NOT NULL DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study sessions"
  ON public.study_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, college_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'college_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
