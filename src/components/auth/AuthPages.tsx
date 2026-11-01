import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  School,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AuthPages: React.FC = () => {
  const { currentRoute, setCurrentRoute, login, signup, showToast, storageMode } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Quick Demo Autofill
  const handleQuickDemoFill = () => {
    setEmail('alex.rivera@stanford.edu');
    setPassword('student123');
    setFullName('Alex Rivera');
    setCollegeName('Stanford University');
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid student or personal email.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Please accept the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);
    const res = await signup(fullName, email, password, collegeName);
    setIsLoading(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
      showToast('success', `Password reset instructions sent to ${email}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-lg shadow-blue-500/20 mb-3">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172554] tracking-tight">
          UNIQUEST
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          One platform. Every student goal.
        </p>

        {/* Demo Mode Pill */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Academic SaaS Workspace • {storageMode === 'supabase' ? 'Supabase Connected' : 'Demo Ready'}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/40">
          {/* LOGIN VIEW (Default when unauthenticated or explicitly on /login) */}
          {currentRoute !== 'signup' && currentRoute !== 'forgot-password' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Sign in to your account</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Welcome back! Check today's study schedule and pending deadlines.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setCurrentRoute('forgot-password')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick 1-Click Demo Sign In for Hackathon Judges */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    await login('alex.rivera@stanford.edu', 'student123');
                    setIsLoading(false);
                  }}
                  className="w-full py-2.5 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>One-Click Demo Sign In (Alex Rivera, Stanford CS)</span>
                </button>
              </div>

              <div className="mt-6 text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  onClick={() => setCurrentRoute('signup')}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Create one now
                </button>
              </div>
            </div>
          )}

          {/* SIGNUP VIEW */}
          {currentRoute === 'signup' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Create your student account</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Join UNIQUEST to manage tasks, schedules, and AI study plans.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Maya Chen"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="maya@college.edu"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    College / University (Optional)
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. Berkeley / MIT / Stanford"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I agree to the <span className="text-blue-600 underline">Terms of Service</span> and academic guidelines.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  onClick={() => setCurrentRoute('login')}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {currentRoute === 'forgot-password' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Reset your password</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your student email and we'll send a secure password reset link.
                </p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="text-sm font-semibold text-emerald-900">
                    Reset Link Dispatched
                  </div>
                  <p className="text-xs text-emerald-700">
                    Check your inbox at <strong>{email}</strong> for instructions to reset your password.
                  </p>
                  <button
                    onClick={() => {
                      setResetSent(false);
                      setCurrentRoute('login');
                    }}
                    className="mt-3 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Student Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.edu"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentRoute('login')}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
