import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  Flame,
  BookOpen,
} from 'lucide-react';

export const FocusTimerView: React.FC = () => {
  const { subjects, tasks, addStudySession, showToast } = useApp();

  type Mode = 'pomodoro' | 'deep_work' | 'short_break' | 'long_break';
  const [mode, setMode] = useState<Mode>('pomodoro');

  // Time durations in seconds
  const durations: Record<Mode, number> = {
    pomodoro: 25 * 60,
    deep_work: 50 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  const [timeLeft, setTimeLeft] = useState<number>(durations.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(() => {
    const saved = localStorage.getItem('uniquest_focus_sessions_count');
    return saved ? Number(saved) : 3;
  });

  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.name || 'Data Structures & Algorithms');
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>('');

  // Audio Ambient Noise using Web Audio API
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'brown' | 'bell'>('none');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundSourceNodeRef = useRef<AudioNode | null>(null);

  // Stop ambient sound
  const stopAmbientAudio = () => {
    if (soundSourceNodeRef.current) {
      try {
        (soundSourceNodeRef.current as any).stop?.();
        soundSourceNodeRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      soundSourceNodeRef.current = null;
    }
  };

  // Play synthesized ambient sound via Web Audio API
  const startAmbientAudio = (type: 'none' | 'rain' | 'brown' | 'bell') => {
    stopAmbientAudio();
    if (type === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'bell') {
        // Play gentle harmonic singing bowl chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz Solfeggio frequency
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.6);
        return;
      }

      // Continuous buffer noise generator (Rain or Brown noise)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown') {
          // Brown noise integration
          lastOut = (lastOut + 0.02 * white) / 1.02;
          output[i] = lastOut * 3.5;
        } else {
          // Rain pinkish filter
          output[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = output[i];
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = type === 'brown' ? 380 : 1200;

      const gain = ctx.createGain();
      gain.gain.value = 0.15;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      soundSourceNodeRef.current = whiteNoise;
    } catch (e) {
      console.warn('Web Audio synthesis not supported in this environment', e);
    }
  };

  useEffect(() => {
    if (ambientSound !== 'none') {
      startAmbientAudio(ambientSound);
    } else {
      stopAmbientAudio();
    }
    return () => stopAmbientAudio();
  }, [ambientSound]);

  // Timer Tick
  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    // Play completion chime
    startAmbientAudio('bell');

    if (mode === 'pomodoro' || mode === 'deep_work') {
      const newCount = completedSessionsCount + 1;
      setCompletedSessionsCount(newCount);
      localStorage.setItem('uniquest_focus_sessions_count', newCount.toString());

      // Auto-log to real Study Planner
      const durationMins = mode === 'pomodoro' ? 25 : 50;
      try {
        await addStudySession({
          title: selectedTaskTitle ? `Focus: ${selectedTaskTitle}` : `Deep Focus Block (${selectedSubject})`,
          subjectName: selectedSubject,
          date: new Date().toISOString().split('T')[0],
          startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: durationMins,
          notes: 'Completed uninterrupted Pomodoro focus session.',
          status: 'Completed',
        });
        showToast('success', `Completed ${durationMins}m focus sprint! Logged to Study Planner.`);
      } catch (e) {
        showToast('success', `Completed ${durationMins}m focus session!`);
      }
    } else {
      showToast('info', 'Break completed! Ready for the next focus sprint.');
    }
  };

  const handleChangeMode = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(durations[newMode]);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  // Percentage for progress ring
  const totalDuration = durations[mode];
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Focus Timer & Ambient Study Room
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pomodoro interval cycles, synthesized ambient soundscapes, and auto-sync to your Study Planner.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200">
            <Flame className="w-4 h-4 fill-orange-500" />
            <span>{completedSessionsCount} Sprints Finished Today</span>
          </div>
        </div>
      </div>

      {/* Main Focus Console Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-6">
        {/* Mode Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => handleChangeMode('pomodoro')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'pomodoro' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            25m Pomodoro
          </button>
          <button
            onClick={() => handleChangeMode('deep_work')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'deep_work' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            50m Deep Work
          </button>
          <button
            onClick={() => handleChangeMode('short_break')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'short_break' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5m Short Break
          </button>
          <button
            onClick={() => handleChangeMode('long_break')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'long_break' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            15m Rest
          </button>
        </div>

        {/* Giant Timer Display with Circular Progress Meter */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              strokeWidth="6"
              className="text-slate-100 stroke-current"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              strokeWidth="6"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              className="text-blue-600 stroke-current transition-all duration-300"
              fill="transparent"
            />
          </svg>

          {/* Time Counter Inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {isRunning ? 'Flow State Active' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetTimer}
            className="p-3 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Soundscapes Synthesizer */}
        <div className="pt-6 border-t border-slate-100 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-slate-400" />
              Ambient Audio Synthesizer:
            </span>
            <span className="capitalize font-mono text-blue-600">{ambientSound}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { id: 'none', label: 'Mute' },
                { id: 'rain', label: 'Rain' },
                { id: 'brown', label: 'Brown Noise' },
                { id: 'bell', label: 'Singing Bowl' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setAmbientSound(s.id)}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  ambientSound === s.id
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Context Linkage (Subject & Task) */}
        <div className="pt-4 border-t border-slate-100 max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Link to Course
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Link to Pending Task (Optional)
            </label>
            <select
              value={selectedTaskTitle}
              onChange={(e) => setSelectedTaskTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">No specific task</option>
              {tasks
                .filter((t) => t.status !== 'Completed')
                .map((t) => (
                  <option key={t.id} value={t.title}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
