import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Weekly Study Plan Generation Endpoint
app.post('/api/ai/generate-study-plan', async (req, res) => {
  try {
    const {
      subjects = [],
      hoursPerDay = 3,
      availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      preferredTime = 'afternoon',
      pendingTasks = [],
      additionalNotes = '',
      studentName = 'Student',
    } = req.body;

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({
        error: 'Please select at least one subject to generate your study plan.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment. Generating intelligent heuristic plan.');
      // Fallback deterministic scheduling when key is missing
      const fallbackPlan = generateFallbackPlan({
        subjects,
        hoursPerDay,
        availableDays,
        preferredTime,
        pendingTasks,
        additionalNotes,
        studentName,
      });
      return res.json({
        success: true,
        data: fallbackPlan,
        isAiGenerated: false,
        source: 'local_heuristic',
        message: 'Plan generated using intelligent local scheduler (Gemini API key not detected in Secrets).',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
You are UNIQUEST's Elite Academic AI Study Planner.
Generate a high-impact, realistic, and balanced weekly study schedule for student "${studentName}".

STUDENT PARAMETERS:
- Subjects enrolled: ${JSON.stringify(subjects)}
- Daily target study hours: ${hoursPerDay} hours per day
- Available study days: ${JSON.stringify(availableDays)}
- Preferred study time window: ${preferredTime} (morning: 08:00 - 12:00, afternoon: 13:00 - 17:00, evening: 18:00 - 22:00)
- Pending assignments & upcoming exams: ${JSON.stringify(pendingTasks)}
- Student specific guidance/goals: "${additionalNotes || 'Maximize retention and meet all deadlines smoothly.'}"

SCHEDULING RULES:
1. Prioritize pending assignments with approaching deadlines and High priority tasks first.
2. Distribute sessions evenly across the specified available days: ${availableDays.join(', ')}.
3. Do not exceed ${hoursPerDay} hours per study day. Realistic session lengths are 45, 60, 90, or 120 minutes with breaks.
4. Provide clear, concrete, syllabus-oriented topics for each session (not just "study chapter 1", but specific objectives).
5. For each session, provide an inspiring and rational "reason" explaining why it was placed on that day and time relative to upcoming deadlines or cognitive load.
6. Provide an executive weekly overview and 3 practical high-yield study tips.
`;

    const executeAiCall = async () => {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are UNIQUEST Academic AI, a world-class collegiate learning strategist. Provide structured, realistic, and highly motivating weekly study plans tailored to collegiate courses.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: {
                type: Type.STRING,
                description: 'Executive weekly strategic summary of workload and focus priorities.',
              },
              weeklyStrategy: {
                type: Type.STRING,
                description: 'Methodology used to balance high-stakes deadlines and regular review.',
              },
              sessions: {
                type: Type.ARRAY,
                description: 'List of individual daily study sessions.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    day: { type: Type.STRING },
                    date: { type: Type.STRING, description: 'Format YYYY-MM-DD' },
                    subject: { type: Type.STRING },
                    title: { type: Type.STRING },
                    startTime: { type: Type.STRING, description: 'e.g. 09:00 AM, 02:00 PM, 06:30 PM' },
                    duration: { type: Type.INTEGER, description: 'Duration in minutes (e.g. 60, 90, 120)' },
                    topic: { type: Type.STRING },
                    priority: { type: Type.STRING, description: 'High, Medium, or Low' },
                    reason: { type: Type.STRING, description: 'Why this session is scheduled at this time' },
                  },
                  required: [
                    'id',
                    'day',
                    'date',
                    'subject',
                    'title',
                    'startTime',
                    'duration',
                    'topic',
                    'priority',
                    'reason',
                  ],
                },
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 actionable study techniques tailored to the student workload.',
              },
            },
            required: ['overview', 'weeklyStrategy', 'sessions', 'tips'],
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API request timed out after 12s')), 12000)
      );

      return (await Promise.race([generatePromise, timeoutPromise])) as any;
    };

    let response: any;
    try {
      response = await executeAiCall();
    } catch (firstErr) {
      console.warn('Initial Gemini API call encountered transient failure, attempting retry after 1.5s...');
      await new Promise((r) => setTimeout(r, 1500));
      response = await executeAiCall();
    }

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini API');
    }

    const parsedData = JSON.parse(responseText);

    return res.json({
      success: true,
      data: parsedData,
      isAiGenerated: true,
      source: 'gemini-3.8-flash',
      message: 'Personalised weekly plan generated successfully by Gemini 3.8 Flash.',
    });
  } catch (error: any) {
    console.error('Error generating AI study plan:', error);
    // Provide graceful fallback if Gemini fails
    try {
      const fallbackPlan = generateFallbackPlan(req.body);
      return res.json({
        success: true,
        data: fallbackPlan,
        isAiGenerated: false,
        source: 'local_heuristic_fallback',
        warning: error.message || 'Gemini API call failed, generated backup plan.',
      });
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to generate study plan: ' + (error?.message || 'Internal server error'),
      });
    }
  }
});

// Helper for deterministic schedule fallback
function generateFallbackPlan(body: any) {
  const {
    subjects = ['Computer Science', 'Mathematics'],
    hoursPerDay = 3,
    availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    preferredTime = 'afternoon',
    pendingTasks = [],
    additionalNotes = '',
  } = body;

  const now = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const preferredStartTimes: Record<string, string[]> = {
    morning: ['09:00 AM', '10:30 AM', '11:45 AM'],
    afternoon: ['01:30 PM', '03:15 PM', '04:45 PM'],
    evening: ['06:00 PM', '07:30 PM', '09:00 PM'],
  };

  const startTimes = preferredStartTimes[preferredTime] || preferredStartTimes.afternoon;
  const sessions: any[] = [];

  // Generate for the upcoming 7 days matching availableDays
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayName = daysOfWeek[d.getDay()];

    if (!availableDays.includes(dayName)) continue;

    const dateStr = d.toISOString().split('T')[0];
    const sessionsPerDay = Math.max(1, Math.min(3, Math.round(hoursPerDay / 1.5)));
    const durationPerSession = Math.round((hoursPerDay * 60) / sessionsPerDay);

    for (let s = 0; s < sessionsPerDay; s++) {
      const subjectIndex = (i * 2 + s) % subjects.length;
      const subj = subjects[subjectIndex] || subjects[0] || 'Core Subject';
      const relatedTask = pendingTasks.find((t: any) => t.subject === subj && t.status !== 'Completed');

      sessions.push({
        id: `session-${i}-${s}-${Date.now().toString().slice(-4)}`,
        day: dayName,
        date: dateStr,
        subject: subj,
        title: relatedTask ? `Focus: ${relatedTask.title}` : `${subj} Deep Review & Practice`,
        startTime: startTimes[s % startTimes.length],
        duration: durationPerSession,
        topic: relatedTask
          ? `Work toward deadline (${relatedTask.dueDate}) - comprehensive prep`
          : `Core syllabus concepts, problem sets, and flashcard review`,
        priority: relatedTask?.priority === 'High' ? 'High' : s === 0 ? 'High' : 'Medium',
        reason: relatedTask
          ? `Urgent assignment deadline approaching on ${relatedTask.dueDate}.`
          : `Spaced repetition cadence for sustained academic retention in ${subj}.`,
      });
    }
  }

  return {
    overview: `Tailored ${hoursPerDay}-hour daily schedule across ${availableDays.length} days targeting your enrolled coursework.`,
    weeklyStrategy: `Balanced high-priority assignment deadlines with spaced retrieval intervals in the ${preferredTime} study window.`,
    sessions,
    tips: [
      'Use the 50/10 Pomodoro rhythm: 50 minutes focused work, 10 minutes screen-free break.',
      'Begin each block by reviewing summary notes from the previous session before diving into new problems.',
      'Keep active recall cards ready for quick revision at the end of every study block.',
    ],
  };
}

// Development or Production static serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 UNIQUEST Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
