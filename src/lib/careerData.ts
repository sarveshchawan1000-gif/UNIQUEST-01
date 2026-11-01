import {
  MockInterviewQuestion,
  SkillQuizQuestion,
  CareerRoadmap,
  MentorshipSession,
  PortfolioProject,
  ResumeAnalysisResult,
} from '../types';

export const SAMPLE_RESUME_TEXT = `SARVESH CHAWAN
Undergraduate Computer Science & Engineering Student
Email: sarvesh.chawan1000@gmail.com | GitHub: github.com/sarvesh-chawan | LinkedIn: linkedin.com/in/sarvesh-chawan

EDUCATION
B.Tech in Computer Science and Engineering | GPA: 3.82/4.00
Expected Graduation: May 2027

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript, Python, C++, SQL, Go
- Frameworks & Web: React 19, Next.js, Node.js, Express, Tailwind CSS, PostgreSQL, Supabase
- Developer Tools: Git, Docker, Linux, Postman, Vite, Vercel, RESTful APIs

ACADEMIC PROJECTS
UNIQUEST — AI Student Productivity & Study Management Platform
- Architected an end-to-end full-stack SaaS platform utilizing React, TypeScript, Express, and Supabase.
- Integrated Google Gemini 3.8 Flash structured output API with server-side validation to dynamically synthesize personalized weekly study schedules.
- Built responsive UI with Tailwind CSS following SaaS design principles, achieving sub-100ms client route transitions and local storage failover.

Distributed Key-Value Store
- Implemented a multi-threaded in-memory key-value cache in Go with Raft consensus protocol support.
- Handled concurrent client requests with read/write mutexes, sustaining 15,000 requests/sec with 99th percentile latency below 4ms.

WORK & LEADERSHIP EXPERIENCE
Undergraduate Teaching Assistant — Data Structures & Algorithms
- Mentored 60+ first-year undergraduates through weekly programming labs and problem-solving sessions in C++.
- Designed automated autograder test suites covering boundary conditions and memory leaks via Valgrind.

ACHIEVEMENTS & CERTIFICATIONS
- Dean's List Honor Roll (All consecutive semesters)
- 1st Runner-Up, Inter-Collegiate Hackathon 2026 (Built real-time collaborative whiteboard)`;

export const SAMPLE_RESUME_ANALYSIS: ResumeAnalysisResult = {
  score: 87,
  summary: 'Strong technical undergraduate resume with high-impact project bullet points and quantifiable metrics. Shows excellent frontend, backend, and distributed systems foundation.',
  identifiedSkills: [
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Express',
    'PostgreSQL',
    'Supabase',
    'Python',
    'C++',
    'Go',
    'Docker',
    'Git',
    'Gemini AI API',
    'RESTful APIs',
  ],
  missingSkills: [
    'CI/CD Pipelines (GitHub Actions / GitLab CI)',
    'Cloud Providers (AWS / GCP / Cloudflare Workers)',
    'Unit & Integration Testing (Jest, Vitest, Cypress)',
    'Redis / Caching Architecture',
    'System Monitoring & Logging (Prometheus / Grafana)',
  ],
  strengths: [
    'Uses active action verbs and quantitative metrics ("15,000 requests/sec", "sub-100ms", "60+ students").',
    'Clear XYZ formula in UNIQUEST and Distributed Store project descriptions.',
    'Clean, distraction-free single page structure optimized for ATS parsers.',
  ],
  improvements: [
    'Specify CI/CD experience (e.g. mention automated test workflows with GitHub Actions).',
    'Add test coverage metrics to projects (e.g., "Achieved 92% unit test coverage with Vitest").',
    'Include direct deployment or live demo links in the project headers.',
  ],
  bulletSuggestions: [
    {
      original: 'Integrated Google Gemini 3.8 Flash structured output API with server-side validation to dynamically synthesize personalized weekly study schedules.',
      improved: 'Engineered server-side Gemini 3.8 Flash pipeline with exponential backoff and structured JSON schemas, reducing schedule generation latency by 35% with zero dropped payloads.',
      reason: 'Adds explicit engineering resilience metrics (backoff, latency reduction, zero drops).',
    },
    {
      original: 'Mentored 60+ first-year undergraduates through weekly programming labs and problem-solving sessions in C++.',
      improved: 'Spearheaded weekly C++ labs for 60+ students, boosting class average mid-term scores by 14% and authoring automated Valgrind test suites.',
      reason: 'Connects mentorship directly to measurable student outcomes.',
    },
  ],
};

export const INITIAL_MOCK_QUESTIONS: MockInterviewQuestion[] = [
  {
    id: 'mock-1',
    category: 'Behavioral',
    role: 'Software Engineer',
    question: 'Describe a situation where a technical project deadline was at risk. How did you prioritize tasks and communicate with teammates?',
    tips: 'Use the STAR format (Situation, Task, Action, Result). Emphasize transparent communication and triage of MVP requirements vs nice-to-haves.',
    sampleAnswer: 'During our college hackathon project, our backend auth integration hit an unexpected OAuth redirect bug with 6 hours remaining. As project lead, I held a quick 10-minute standup: we de-scoped optional social logins, established a reliable token-based local fallback for judges, and pair-programmed the core workflow. We submitted 45 minutes ahead of deadline and won 1st Runner-Up.',
  },
  {
    id: 'mock-2',
    category: 'Frontend',
    role: 'Frontend / Full-Stack Engineer',
    question: 'How does React 19 reconcile state updates differently, and when would you use useActionState or useOptimistic?',
    tips: 'Discuss server actions integration, optimistic UI updates for instant perceived speed, and pending states without manual boolean flags.',
    sampleAnswer: 'In modern React, Actions handle async transitions natively. useOptimistic allows rendering immediate UI state before the server response returns, with automatic rollback if rejected. useActionState manages form submissions, errors, and pending state without manual useState boilerplate.',
  },
  {
    id: 'mock-3',
    category: 'System Design',
    role: 'Backend / Systems Engineer',
    question: 'Design a URL shortener service like Bitly that handles 100M new URLs per month. How do you handle encoding, storage, and collision resolution?',
    tips: 'Cover Base62 encoding, unique ID generation (Snowflake or auto-increment with distributed counter), read vs write ratio, and Redis caching for hot links.',
    sampleAnswer: 'With 100M writes/month, that is ~40 writes/sec and ~400 reads/sec. Using Base62 with 7 characters gives 62^7 (~3.5 trillion) combinations. We use distributed Snowflake IDs converted to Base62 to guarantee collision-free keys without database roundtrips. Hot URLs are cached in Redis with LRU eviction.',
  },
  {
    id: 'mock-4',
    category: 'Algorithms',
    role: 'Software Engineer',
    question: 'Walk through how you would detect a cycle in a directed graph, and explain the difference between Kahn algorithm and DFS.',
    tips: 'Mention 3-color DFS (White = unvisited, Gray = visiting/in stack, Black = visited) vs Topological Sort with in-degree array.',
    sampleAnswer: 'For a directed graph, a back-edge to a node currently in the recursion stack indicates a cycle. Using 3-color DFS, if we encounter a Gray node, there is a cycle. Alternatively, Kahn algorithm calculates in-degrees; if the final sorted count is less than V, a cycle prevented nodes with incoming edges from reaching degree zero.',
  },
];

export const INITIAL_SKILL_QUIZZES: {
  title: string;
  category: string;
  questions: SkillQuizQuestion[];
}[] = [
  {
    title: 'TypeScript & Modern React Web Development',
    category: 'Frontend',
    questions: [
      {
        id: 'q-1',
        question: 'What is the key difference between TypeScript `type` and `interface` regarding declaration merging?',
        options: [
          'Interfaces with the same name automatically merge declarations, while types will throw a duplicate identifier error.',
          'Types support declaration merging, interfaces do not.',
          'Neither supports declaration merging in TypeScript strict mode.',
          'Both behave identically with no differences.',
        ],
        correctIndex: 0,
        explanation: 'Interfaces in TypeScript are open and support declaration merging, making them ideal for library definitions, whereas type aliases cannot be reopened.',
      },
      {
        id: 'q-2',
        question: 'Which CSS property ensures tabular numbers maintain equal column widths in financial and timer interfaces?',
        options: [
          'font-variant-numeric: tabular-nums',
          'font-kerning: none',
          'text-align: justify-all',
          'letter-spacing: fixed',
        ],
        correctIndex: 0,
        explanation: '`font-variant-numeric: tabular-nums` (or Tailwind class `tabular-nums`) forces digits to occupy uniform horizontal space, preventing layout shift.',
      },
      {
        id: 'q-3',
        question: 'When should you choose `useCallback` in React?',
        options: [
          'On every single function declared inside a component.',
          'Only when passing a callback to an optimized child component that relies on reference equality (like React.memo) or as an effect dependency.',
          'To make asynchronous API calls run faster.',
          'To replace Redux actions.',
        ],
        correctIndex: 1,
        explanation: 'Indiscriminate useCallback introduces memory overhead. It is only useful when reference stability prevents heavy child re-renders or stabilizes dependency arrays.',
      },
      {
        id: 'q-4',
        question: 'What does the TypeScript `unknown` type represent compared to `any`?',
        options: [
          'Unknown is the type-safe counterpart of any. You cannot perform operations on it without type narrowing or assertions.',
          'Unknown is identical to void.',
          'Unknown bypasses all compiler type-checking like any.',
          'Unknown can only hold null or undefined.',
        ],
        correctIndex: 0,
        explanation: '`unknown` forces the developer to perform runtime checks (like typeof or instanceof) before using the value, eliminating accidental type errors.',
      },
    ],
  },
  {
    title: 'Databases, SQL & System Architecture',
    category: 'Backend',
    questions: [
      {
        id: 'q-5',
        question: 'What does the ACID property "Isolation" guarantee in a relational database?',
        options: [
          'Data is written to isolated disk sectors to prevent corruption.',
          'Concurrent transactions execute without interfering with each other, producing results equivalent to sequential execution.',
          'Transactions run in separate worker threads.',
          'The database cannot connect to external internet networks.',
        ],
        correctIndex: 1,
        explanation: 'Isolation ensures that intermediate transaction states are invisible to other concurrent transactions according to the chosen isolation level.',
      },
      {
        id: 'q-6',
        question: 'Why are B+ trees preferred over standard B-trees for relational database disk storage?',
        options: [
          'All data records/pointers are stored in leaves, enabling rapid sequential range scans via leaf linked pointers.',
          'B+ trees do not require disk seeks.',
          'B+ trees are strictly binary with height 2.',
          'B+ trees do not support indices.',
        ],
        correctIndex: 0,
        explanation: 'Because internal nodes only store navigation keys and leaves contain all values connected sequentially, range queries and cache locality are dramatically superior.',
      },
      {
        id: 'q-7',
        question: 'What is the purpose of Row Level Security (RLS) in PostgreSQL?',
        options: [
          'To encrypt column data with AES-256.',
          'To restrict which rows a user can SELECT, INSERT, UPDATE, or DELETE based on user security context like auth.uid().',
          'To automatically compress rows on disk.',
          'To prevent SQL injection in ORMs.',
        ],
        correctIndex: 1,
        explanation: 'RLS policies evaluate user identity on every query at the engine level, guaranteeing multi-tenant security even if client code is bypassed.',
      },
    ],
  },
];

export const INITIAL_CAREER_ROADMAPS: CareerRoadmap[] = [
  {
    id: 'road-1',
    title: 'Full-Stack Software Engineer',
    category: 'Engineering',
    description: 'End-to-end path covering modern frontend, robust server architectures, database engineering, and deployment pipelines.',
    stages: [
      {
        title: 'Stage 1: Core Computer Science Foundations',
        description: 'Algorithms, data structures, complexity analysis, and object-oriented design.',
        skills: [
          { name: 'Data Structures (Trees, Graphs, Hash Maps)', completed: true },
          { name: 'Time & Space Complexity (Big-O notation)', completed: true },
          { name: 'Git & GitHub Branching Workflows', completed: true },
          { name: 'Linux Command Line & Shell Scripting', completed: true },
        ],
      },
      {
        title: 'Stage 2: Modern Frontend & TypeScript',
        description: 'Building accessible, fast, production-grade responsive web apps.',
        skills: [
          { name: 'TypeScript Strict Mode & Generics', completed: true },
          { name: 'React 19, Hooks & State Management', completed: true },
          { name: 'Tailwind CSS & Design Systems', completed: true },
          { name: 'Next.js App Router & Server Components', completed: false },
        ],
      },
      {
        title: 'Stage 3: Backend & Database Architecture',
        description: 'REST & GraphQL APIs, relational database normalization, and auth.',
        skills: [
          { name: 'Node.js & Express / Fastify', completed: true },
          { name: 'PostgreSQL, B-Tree Indexing & RLS', completed: true },
          { name: 'OAuth 2.0 & JWT Authentication', completed: false },
          { name: 'Docker Containerization & Multi-stage builds', completed: false },
        ],
      },
      {
        title: 'Stage 4: Cloud & Production Readiness',
        description: 'CI/CD, observability, and scaling distributed applications.',
        skills: [
          { name: 'Automated Testing (Vitest & Playwright)', completed: false },
          { name: 'GitHub Actions CI/CD Pipeline', completed: false },
          { name: 'Redis Caching & Rate Limiting', completed: false },
          { name: 'Cloud Deployment (Vercel, AWS ECS, Cloud Run)', completed: false },
        ],
      },
    ],
  },
  {
    id: 'road-2',
    title: 'AI & Machine Learning Engineer',
    category: 'AI / Data',
    description: 'From mathematical foundations and deep learning models to production LLM agents and evaluation pipelines.',
    stages: [
      {
        title: 'Stage 1: Mathematics & Data Manipulation',
        description: 'Linear algebra, calculus, probability, NumPy, and Pandas.',
        skills: [
          { name: 'Linear Algebra (Eigendecomposition, SVD)', completed: true },
          { name: 'Multivariate Calculus & Gradients', completed: true },
          { name: 'Pandas & NumPy Data Wrangling', completed: true },
        ],
      },
      {
        title: 'Stage 2: Machine Learning Fundamentals',
        description: 'Classical algorithms, feature engineering, and validation metrics.',
        skills: [
          { name: 'Regression, Classification & Ensembles', completed: true },
          { name: 'Scikit-Learn Pipelines & Cross-Validation', completed: false },
          { name: 'PyTorch Neural Network Training Loops', completed: false },
        ],
      },
      {
        title: 'Stage 3: GenAI, LLMs & Agent Architectures',
        description: 'Working with frontier models, structured outputs, and embeddings.',
        skills: [
          { name: 'Gemini SDK Structured Output & Function Calling', completed: true },
          { name: 'Retrieval-Augmented Generation (RAG) & Vector DBs', completed: false },
          { name: 'Model Evaluation & Benchmarking (Evals)', completed: false },
        ],
      },
    ],
  },
];

export const INITIAL_MENTORSHIP_SESSIONS: MentorshipSession[] = [
  {
    id: 'mentor-1',
    mentorName: 'Dr. Evelyn Reed',
    mentorRole: 'Staff Software Architect',
    mentorCompany: 'Stripe',
    date: '2026-10-24',
    topics: 'Technical Resume Critique & Distributed Systems Interview Strategy',
    notes: 'Dr. Reed recommended highlighting the Raft consensus distributed store more prominently on the resume. Suggested reading "Designing Data-Intensive Applications" chapters 5 and 7 on replication and transactions.',
    actionItems: [
      { text: 'Add quantitative metrics to Raft key-value store project bullet', done: true },
      { text: 'Read DDIA Chapter 7: Transactions & Serializability', done: true },
      { text: 'Implement two LeetCode hard graph problems before next session', done: false },
    ],
  },
  {
    id: 'mentor-2',
    mentorName: 'Marcus Vance',
    mentorRole: 'Senior Engineering Manager',
    mentorCompany: 'Google',
    date: '2026-10-10',
    topics: 'College Hackathon Strategy & Summer Internship Application Cadence',
    notes: 'Marcus advised applying to internship roles by mid-November with a personalized outreach message on LinkedIn to university recruiters.',
    actionItems: [
      { text: 'Draft portfolio project summaries with video demo links', done: true },
      { text: 'Submit applications for 5 top target software engineering internships', done: false },
    ],
  },
];

export const INITIAL_PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-1',
    title: 'UNIQUEST — AI Student Productivity Platform',
    description: 'All-in-one student workspace unifying academic scheduling, assignment tracking, Gemini-powered study plans, and career prep.',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'Gemini AI', 'Supabase'],
    liveUrl: 'https://uniquest-01.vercel.app',
    githubUrl: 'https://github.com/sarvesh-chawan/uniquest',
    impactMetrics: 'Unified 7 student workflows into 1 portal; sub-100ms client transitions.',
    featured: true,
  },
  {
    id: 'proj-2',
    title: 'Raft-Backed Distributed In-Memory Cache',
    description: 'High-performance distributed key-value store implementing leader election, log replication, and client failover in Go.',
    technologies: ['Go', 'Raft Consensus', 'gRPC', 'Protobuf', 'Docker'],
    githubUrl: 'https://github.com/sarvesh-chawan/raft-kv-store',
    impactMetrics: 'Handles 15,000 req/sec with p99 latency < 4ms across 5-node cluster.',
    featured: true,
  },
  {
    id: 'proj-3',
    title: 'Algorithmic Subnet Calculator & Packet Visualizer',
    description: 'Interactive visualization tool for IPv4/IPv6 CIDR subnet allocation and TCP flow-control packet transmission simulation.',
    technologies: ['TypeScript', 'Canvas API', 'Vite', 'Tailwind CSS'],
    liveUrl: 'https://subnet-viz.demo.app',
    githubUrl: 'https://github.com/sarvesh-chawan/subnet-visualizer',
    impactMetrics: 'Adopted by 120+ classmates in CS 306 Computer Networks lab.',
    featured: false,
  },
];
