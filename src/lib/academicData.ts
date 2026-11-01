import { AttendanceRecord, ExamItem, RevisionTopic, CodingProblem, CourseNote } from '../types';

// ==================== ATTENDANCE DATA ====================

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS 301',
    attendedClasses: 28,
    totalClasses: 32,
    minTargetPercentage: 75,
    history: [
      { id: 'h-1', date: '2026-10-28', status: 'present', notes: 'Binary Search Trees & Red-Black Trees' },
      { id: 'h-2', date: '2026-10-26', status: 'present', notes: 'AVL Trees & Rotations' },
      { id: 'h-3', date: '2026-10-21', status: 'absent', notes: 'Medical leave' },
      { id: 'h-4', date: '2026-10-19', status: 'present', notes: 'Heap Sort & Priority Queues' },
    ],
  },
  {
    id: 'att-2',
    courseName: 'Database Management Systems',
    courseCode: 'CS 304',
    attendedClasses: 22,
    totalClasses: 30,
    minTargetPercentage: 75,
    history: [
      { id: 'h-5', date: '2026-10-29', status: 'present', notes: 'ACID Properties & Transactions' },
      { id: 'h-6', date: '2026-10-27', status: 'absent', notes: 'Missed early morning bus' },
      { id: 'h-7', date: '2026-10-22', status: 'absent', notes: 'Project submission clash' },
      { id: 'h-8', date: '2026-10-20', status: 'present', notes: 'Normalization (BCNF & 4NF)' },
    ],
  },
  {
    id: 'att-3',
    courseName: 'Computer Networks',
    courseCode: 'CS 306',
    attendedClasses: 26,
    totalClasses: 28,
    minTargetPercentage: 80,
    history: [
      { id: 'h-9', date: '2026-10-30', status: 'present', notes: 'TCP Congestion Control & Reno' },
      { id: 'h-10', date: '2026-10-25', status: 'present', notes: 'DNS, DHCP & Application Layer' },
    ],
  },
  {
    id: 'att-4',
    courseName: 'Software Engineering',
    courseCode: 'SE 201',
    attendedClasses: 19,
    totalClasses: 22,
    minTargetPercentage: 75,
    history: [
      { id: 'h-11', date: '2026-10-28', status: 'present', notes: 'Agile vs Waterfall, Scrum Ceremonies' },
      { id: 'h-12', date: '2026-10-24', status: 'present', notes: 'Design Patterns: Factory & Observer' },
    ],
  },
];

export function getAttendanceStats(record: AttendanceRecord) {
  const percentage = record.totalClasses === 0 ? 100 : Math.round((record.attendedClasses / record.totalClasses) * 100);
  const target = record.minTargetPercentage;
  const isSafe = percentage >= target;

  // Calculate margin: how many classes can miss or need to attend
  let marginText = '';
  if (isSafe) {
    // How many classes can be missed consecutively before falling below target:
    // (attended) / (total + x) >= target/100  =>  x <= (attended * 100 / target) - total
    const canMiss = Math.floor((record.attendedClasses * 100) / target - record.totalClasses);
    marginText = canMiss > 0 ? `Can miss ${canMiss} class${canMiss > 1 ? 'es' : ''} safely` : 'On boundary margin';
  } else {
    // Classes needed: (attended + y) / (total + y) >= target/100
    // 100*attended + 100*y >= target*total + target*y
    // y*(100 - target) >= target*total - 100*attended
    const numerator = target * record.totalClasses - 100 * record.attendedClasses;
    const denominator = 100 - target;
    const needToAttend = Math.ceil(numerator / denominator);
    marginText = `Must attend next ${needToAttend} class${needToAttend > 1 ? 'es' : ''}`;
  }

  return { percentage, isSafe, marginText };
}

// ==================== EXAMS DATA ====================

export const INITIAL_EXAMS: ExamItem[] = [
  {
    id: 'exam-1',
    title: 'Midterm Examination: Algorithms & Data Structures',
    courseName: 'Data Structures & Algorithms',
    date: '2026-11-12',
    time: '09:30 AM',
    location: 'Auditorium Hall B',
    topics: ['Red-Black & AVL Trees', 'Graph Algorithms (Dijkstra, Bellman-Ford)', 'Dynamic Programming', 'NP-Completeness'],
    weightage: '30% of course grade',
    targetScore: '88/100',
    status: 'upcoming',
    notes: 'Permitted: Non-programmable calculator and 1 single-sided formula sheet.',
  },
  {
    id: 'exam-2',
    title: 'DBMS Laboratory Practical & Viva',
    courseName: 'Database Management Systems',
    date: '2026-11-18',
    time: '02:00 PM',
    location: 'Computer Systems Lab 4',
    topics: ['Complex SQL Joins', 'PL/pgSQL Triggers & Stored Procedures', 'B+ Tree Indexing Queries'],
    weightage: '20% of course grade',
    targetScore: '95/100',
    status: 'upcoming',
    notes: 'Bring student ID badge and verified lab record notebook.',
  },
  {
    id: 'exam-3',
    title: 'Computer Networks End-Term Theory',
    courseName: 'Computer Networks',
    date: '2026-11-26',
    time: '10:00 AM',
    location: 'Science Complex Room 102',
    topics: ['TCP Flow & Congestion Control', 'Subnetting IPv4/IPv6', 'Routing Protocols (BGP, OSPF)', 'TLS Handshake'],
    weightage: '40% of course grade',
    targetScore: '85/100',
    status: 'upcoming',
    notes: 'Thoroughly practice subnet calculation tables.',
  },
];

// ==================== REVISION DATA ====================

export const INITIAL_REVISION_TOPICS: RevisionTopic[] = [
  {
    id: 'rev-1',
    courseName: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming: Knapsack & Longest Common Subsequence',
    round1Completed: true,
    round2Completed: true,
    round3Completed: false,
    confidence: 4,
    nextRevisionDate: '2026-11-04',
    notes: 'Focus on state transitions and memory-efficient bottom-up tables.',
  },
  {
    id: 'rev-2',
    courseName: 'Data Structures & Algorithms',
    topic: 'Graph Theory: Kruskal, Prim, and Topological Sort',
    round1Completed: true,
    round2Completed: false,
    round3Completed: false,
    confidence: 3,
    nextRevisionDate: '2026-11-03',
    notes: 'Review disjoint set union with path compression.',
  },
  {
    id: 'rev-3',
    courseName: 'Database Management Systems',
    topic: 'Relational Algebra & Query Optimization Execution Plans',
    round1Completed: true,
    round2Completed: true,
    round3Completed: true,
    confidence: 5,
    nextRevisionDate: '2026-11-10',
    notes: 'Mastered! Just quick 10-minute scan before exams.',
  },
  {
    id: 'rev-4',
    courseName: 'Computer Networks',
    topic: 'TCP Three-Way Handshake & FIN Wait State Machine',
    round1Completed: true,
    round2Completed: false,
    round3Completed: false,
    confidence: 3,
    nextRevisionDate: '2026-11-05',
    notes: 'Draw out state diagram on whiteboard.',
  },
  {
    id: 'rev-5',
    courseName: 'Software Engineering',
    topic: 'Design Patterns: Factory, Singleton, Strategy, Decorator',
    round1Completed: false,
    round2Completed: false,
    round3Completed: false,
    confidence: 2,
    nextRevisionDate: '2026-11-02',
    notes: 'Code implementation in TypeScript for each pattern.',
  },
];

// ==================== CODING PRACTICE DATA ====================

export const INITIAL_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'code-1',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    platform: 'LeetCode',
    status: 'Solved',
    solutionUrl: 'https://leetcode.com/problems/two-sum/',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    notes: 'Use a hash map to look up complementary difference in single pass.',
    lastPracticed: '2026-10-30',
  },
  {
    id: 'code-2',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    platform: 'LeetCode',
    status: 'Solved',
    solutionUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    notes: 'Sliding window with character index map. Update left pointer to max(left, prev_idx + 1).',
    lastPracticed: '2026-10-28',
  },
  {
    id: 'code-3',
    title: 'Course Schedule (Cycle Detection)',
    difficulty: 'Medium',
    topic: 'Graphs',
    platform: 'LeetCode',
    status: 'Solved',
    solutionUrl: 'https://leetcode.com/problems/course-schedule/',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    notes: 'Topological sort via Kahn Algorithm with in-degree array, or 3-color DFS.',
    lastPracticed: '2026-10-25',
  },
  {
    id: 'code-4',
    title: 'LRU Cache',
    difficulty: 'Medium',
    topic: 'Linked Lists',
    platform: 'LeetCode',
    status: 'In Progress',
    solutionUrl: 'https://leetcode.com/problems/lru-cache/',
    timeComplexity: 'O(1) get/put',
    spaceComplexity: 'O(capacity)',
    notes: 'Doubly linked list with dummy head & tail + hash map pointing to nodes.',
    lastPracticed: '2026-10-31',
  },
  {
    id: 'code-5',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    platform: 'LeetCode',
    status: 'Review Needed',
    solutionUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    notes: 'Two pointer approach tracking maxLeft and maxRight boundaries.',
    lastPracticed: '2026-10-20',
  },
  {
    id: 'code-6',
    title: 'Coin Change',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    platform: 'LeetCode',
    status: 'Todo',
    solutionUrl: 'https://leetcode.com/problems/coin-change/',
    timeComplexity: 'O(amount * coins)',
    spaceComplexity: 'O(amount)',
    notes: 'Bottom-up array initialized to infinity; dp[i] = min(dp[i], dp[i - c] + 1).',
    lastPracticed: '2026-10-15',
  },
];

// ==================== NOTES DATA ====================

export const INITIAL_COURSE_NOTES: CourseNote[] = [
  {
    id: 'note-1',
    title: 'B-Trees & Indexing Mechanics in Relational Databases',
    courseName: 'Database Management Systems',
    topic: 'Indexing',
    tags: ['B-Tree', 'Storage', 'Postgres', 'Query Optimization'],
    content: `# B-Trees and Database Indexing

## 1. Why B-Trees over Binary Search Trees?
- **Disk I/O Block Efficiency:** Memory is fetched in 4KB/8KB pages. Binary trees have depth O(log2 N), triggering a disk read per level. B-Trees have wide branching factor (e.g., M=100), keeping tree height strictly 3-4 levels for billions of rows.
- **Node Structure:** Each internal node holds up to $M-1$ sorted keys and $M$ child pointers.
- **B+ Tree Variant:** All actual values/row pointers reside only in leaf nodes connected as a doubly linked list, optimizing range scans (\`WHERE age BETWEEN 20 AND 30\`).

\`\`\`sql
-- Creating an index in PostgreSQL
CREATE INDEX idx_student_gpa ON profiles(gpa) WHERE status = 'enrolled';
\`\`\`

## Key Takeaways
- Equality lookups: O(log_M N)
- Range scans: Sequential traversal along linked leaf nodes.`,
    pinned: true,
    updatedAt: '2026-10-30',
  },
  {
    id: 'note-2',
    title: 'TCP Congestion Control: Reno, Tahoe & Cubic',
    courseName: 'Computer Networks',
    topic: 'Transport Layer',
    tags: ['TCP', 'Networking', 'AIMD', 'Congestion Window'],
    content: `# Transport Layer Congestion Control

## The 4 Phases:
1. **Slow Start:** Exponential growth of Congestion Window (\`cwnd\`). cwnd doubles every RTT until reaching \`ssthresh\`.
2. **Congestion Avoidance (AIMD):** Additive increase of 1 MSS per RTT.
3. **Fast Retransmit:** Triggered when 3 duplicate ACKs are received before timeout occurs.
4. **Fast Recovery:** Halve \`ssthresh\`, set \`cwnd = ssthresh + 3*MSS\`, retransmit lost segment without resetting to 1 MSS.

### TCP Cubic Note:
- Used in Linux by default. Window growth is a cubic function of time since last congestion epoch, minimizing sensitivity to RTT.`,
    pinned: false,
    updatedAt: '2026-10-27',
  },
  {
    id: 'note-3',
    title: 'Asymptotic Analysis & Master Theorem Cheat Sheet',
    courseName: 'Data Structures & Algorithms',
    topic: 'Complexity',
    tags: ['Algorithms', 'Complexity', 'Big-O'],
    content: `# Master Theorem for Recurrence Relations

Format: $T(n) = aT(n/b) + f(n)$ where $a \\ge 1, b > 1$

- **Case 1:** If $f(n) = O(n^{\\log_b a - \\epsilon})$, then $T(n) = \\Theta(n^{\\log_b a})$. (Root dominated)
- **Case 2:** If $f(n) = \\Theta(n^{\\log_b a})$, then $T(n) = \\Theta(n^{\\log_b a} \\log n)$. (Balanced)
- **Case 3:** If $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$, then $T(n) = \\Theta(f(n))$. (Leaves/work dominated)

### Examples:
- Merge Sort: $T(n) = 2T(n/2) + O(n) \\rightarrow \\Theta(n \\log n)$
- Binary Search: $T(n) = T(n/2) + O(1) \\rightarrow \\Theta(\\log n)$`,
    pinned: true,
    updatedAt: '2026-10-25',
  },
];
