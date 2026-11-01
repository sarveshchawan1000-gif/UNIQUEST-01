import {
  ProjectWorkspace,
  CampusPlace,
  CampusClub,
  LostAndFoundItem,
  BudgetItem,
  RoutineHabit,
  PersonalReminder,
} from '../types';

export const INITIAL_PROJECT_WORKSPACES: ProjectWorkspace[] = [
  {
    id: 'proj-work-1',
    title: 'Senior Capstone: Autonomous Campus Drone Navigation',
    description: 'Developing stereo vision SLAM algorithm for indoor GPS-denied navigation in college engineering building corridors.',
    courseOrCategory: 'Senior Design Project',
    dueDate: '2026-12-15',
    members: [
      { name: 'Sarvesh Chawan', role: 'Team Lead & SLAM Pipeline', email: 'sarvesh@college.edu' },
      { name: 'Ananya Sharma', role: 'Embedded Systems & Motor Control', email: 'ananya@college.edu' },
      { name: 'Rohan Patel', role: 'Computer Vision & Point Cloud', email: 'rohan@college.edu' },
      { name: 'Chloe Dubois', role: 'Simulation & Safety Telemetry', email: 'chloe@college.edu' },
    ],
    milestones: [
      { id: 'm-1', title: 'Hardware Bill of Materials & Sensor Calibration', dueDate: '2026-10-15', completed: true },
      { id: 'm-2', title: 'ROS2 Node Telemetry & Odometry Pipeline', dueDate: '2026-11-05', completed: true },
      { id: 'm-3', title: 'Corridor Obstacle Avoidance Demonstration', dueDate: '2026-11-20', completed: false },
      { id: 'm-4', title: 'Final Defense Presentation & Technical Report', dueDate: '2026-12-10', completed: false },
    ],
    tasks: [
      { id: 't-1', title: 'Integrate Intel RealSense D435i depth stream with ROS2', assignedTo: 'Sarvesh Chawan', status: 'Done', dueDate: '2026-10-28' },
      { id: 't-2', title: 'Benchmark EKF pose estimation drift on floor 2 corridor', assignedTo: 'Rohan Patel', status: 'In Progress', dueDate: '2026-11-04' },
      { id: 't-3', title: 'Program emergency fail-safe kill switch on RC transmitter', assignedTo: 'Ananya Sharma', status: 'In Progress', dueDate: '2026-11-06' },
      { id: 't-4', title: 'Draft Section 3 (Methodology) in LaTeX capstone template', assignedTo: 'Chloe Dubois', status: 'To Do', dueDate: '2026-11-12' },
    ],
  },
  {
    id: 'proj-work-2',
    title: 'Inter-Collegiate Hackathon: MedConnect Mobile App',
    description: '36-hour sprint building offline-first patient medical appointment queue and digital triage app for student clinic.',
    courseOrCategory: 'Hackathon Sprint',
    dueDate: '2026-11-08',
    members: [
      { name: 'Sarvesh Chawan', role: 'Full-Stack Developer', email: 'sarvesh@college.edu' },
      { name: 'Liam Chen', role: 'UI/UX Designer', email: 'liam@college.edu' },
    ],
    milestones: [
      { id: 'm-5', title: 'Figma Interactive Mockup & User Flow', dueDate: '2026-11-06', completed: true },
      { id: 'm-6', title: 'React Native + SQLite Local Sync Prototype', dueDate: '2026-11-07', completed: false },
      { id: 'm-7', title: '3-Minute Video Pitch & Slide Deck', dueDate: '2026-11-08', completed: false },
    ],
    tasks: [
      { id: 't-5', title: 'Set up Express REST routes with SQLite storage', assignedTo: 'Sarvesh Chawan', status: 'Done', dueDate: '2026-11-06' },
      { id: 't-6', title: 'Polish appointment booking calendar component', assignedTo: 'Liam Chen', status: 'In Progress', dueDate: '2026-11-07' },
    ],
  },
];

export const INITIAL_CAMPUS_PLACES: CampusPlace[] = [
  {
    id: 'place-1',
    name: 'W.E.B. Du Bois Central Library',
    category: 'Library',
    location: 'Central Quad, 28 Floors',
    hours: '24/7 during semester; Floors 2-5 designated silent study',
    contact: 'library-help@college.edu | (555) 019-2831',
    notes: 'High-speed Wi-Fi, reserved group study rooms bookable via portal, free book scanning.',
  },
  {
    id: 'place-2',
    name: 'Turing Computer Systems & Robotics Lab',
    category: 'Lab',
    location: 'Engineering Tower, Room 302',
    hours: 'Mon-Sun: 07:00 AM – 11:30 PM (Keycard access after 8 PM)',
    contact: 'cs-systems-lab@college.edu',
    notes: 'Dual 4K monitors, GPU compute cluster workstations with Linux/CUDA pre-installed.',
  },
  {
    id: 'place-3',
    name: 'Student Health & Wellness Care Center',
    category: 'Health',
    location: 'West Campus Promenade, Building D',
    hours: 'Mon-Fri: 08:30 AM – 05:00 PM; 24hr Nurse Triage Line',
    contact: 'healthcenter@college.edu | (555) 019-4911',
    notes: 'Walk-in urgent care, free confidential mental health counseling, travel vaccination clinic.',
  },
  {
    id: 'place-4',
    name: 'University Registrar & Academic Records',
    category: 'Admin',
    location: 'Whitmore Administration Building, Room 213',
    hours: 'Mon-Fri: 09:00 AM – 04:30 PM',
    contact: 'registrar@college.edu | (555) 019-3300',
    notes: 'Official transcript requests, graduation audit clearances, course add/drop verification.',
  },
  {
    id: 'place-5',
    name: 'Berkshire Dining Commons & Late Night Cafe',
    category: 'Dining',
    location: 'South Residential Quad',
    hours: '07:00 AM – 12:00 Midnight Daily',
    contact: 'dining@college.edu',
    notes: 'Halal, vegan, allergen-free stations; espresso bar open until midnight.',
  },
];

export const INITIAL_CAMPUS_CLUBS: CampusClub[] = [
  {
    id: 'club-1',
    name: 'ACM Student Chapter & Algorithmic Club',
    category: 'Academic & Tech',
    description: 'Weekly LeetCode interview problem workshops, guest tech talks with FAANG alumni, and collegiate programming contests.',
    lead: 'Vikram Joshi (President)',
    meetingTime: 'Wednesdays at 6:00 PM (CS Building Rm 140)',
    upcomingEvent: {
      title: 'Winter Mock Coding Competition & Pizza Night',
      date: '2026-11-14',
      location: 'Engineering Hall 101',
    },
    isMember: true,
  },
  {
    id: 'club-2',
    name: 'Robotics & Automation Society (RAS)',
    category: 'Engineering',
    description: 'Designing autonomous battlebots, rover prototypes, and hosting hands-on soldering and PCB fabrication bootcamps.',
    lead: 'Maya Kowalski',
    meetingTime: 'Saturdays at 11:00 AM (Robotics Maker Bay)',
    upcomingEvent: {
      title: 'Autonomous Navigation Rover Live Test Run',
      date: '2026-11-21',
      location: 'South Lawn Courtyard',
    },
    isMember: false,
  },
  {
    id: 'club-3',
    name: 'Collegiate Debate Union',
    category: 'Public Speaking & Politics',
    description: 'Parliamentary debate tournaments, rhetoric workshops, and inter-university policy showcases.',
    lead: 'Sophia Vance',
    meetingTime: 'Tuesdays & Thursdays at 7:00 PM (Campus Center 904)',
    upcomingEvent: {
      title: 'Tri-State Inter-Collegiate Invitational Debate',
      date: '2026-12-02',
      location: 'Campus Center Ballroom',
    },
    isMember: false,
  },
];

export const INITIAL_LOST_AND_FOUND: LostAndFoundItem[] = [
  {
    id: 'lf-1',
    title: 'Apple AirPods Pro in White Case with Navy Blue Strap',
    type: 'found',
    location: 'W.E.B. Du Bois Library, 3rd Floor Quiet Cubicle',
    date: '2026-10-31',
    category: 'Electronics',
    description: 'Turned into 3rd floor library service desk. Case has small star scratch near charging port.',
    contactEmail: 'library-lostfound@college.edu',
    claimed: false,
  },
  {
    id: 'lf-2',
    title: 'TI-84 Plus CE Graphing Calculator (Black)',
    type: 'lost',
    location: 'Mathematics Building, Lecture Hall 120',
    date: '2026-10-29',
    category: 'Electronics',
    description: 'Left on desk row 4 after Discrete Math lecture. Name sticker on rear battery compartment.',
    contactEmail: 'student-math-rep@college.edu',
    claimed: false,
  },
  {
    id: 'lf-3',
    title: 'Navy Blue Hydro Flask Water Bottle with Stickers',
    type: 'found',
    location: 'Student Health & Wellness Gym',
    date: '2026-10-27',
    category: 'Other',
    description: 'Stickers from GitHub, NASA, and Patagonia. Kept at front reception check-in.',
    contactEmail: 'campus-rec@college.edu',
    claimed: true,
  },
];

export const INITIAL_BUDGET_ITEMS: BudgetItem[] = [
  { id: 'b-1', title: 'Monthly Graduate Assistant Stipend', amount: 1650, type: 'income', category: 'Allowance', date: '2026-10-01', notes: 'Direct deposit' },
  { id: 'b-2', title: 'Off-Campus Apartment Rent Share', amount: 750, type: 'expense', category: 'Housing', date: '2026-10-02', notes: 'Includes heat & water' },
  { id: 'b-3', title: 'Monthly Grocery & Trader Joes haul', amount: 285, type: 'expense', category: 'Food', date: '2026-10-14', notes: 'Bi-weekly meal prep' },
  { id: 'b-4', title: 'Required Course Textbook (Computer Networks)', amount: 65, type: 'expense', category: 'Books & Tech', date: '2026-10-08', notes: 'Used copy' },
  { id: 'b-5', title: 'Campus Dining Cafe & Coffee reload', amount: 45, type: 'expense', category: 'Food', date: '2026-10-18', notes: 'Late night study snacks' },
  { id: 'b-6', title: 'Local Transit / Bus Semester Pass', amount: 35, type: 'expense', category: 'Transport', date: '2026-10-05', notes: 'Subsidized student rate' },
  { id: 'b-7', title: 'Cloud Hosting & GitHub Student Subscription', amount: 15, type: 'expense', category: 'Books & Tech', date: '2026-10-20', notes: 'Domain & VPS' },
];

export const INITIAL_ROUTINES: RoutineHabit[] = [
  { id: 'h-1', title: 'Hydrate with 500ml water & 5 min light stretching', timeOfDay: 'Morning', streak: 12, completedToday: true, category: 'Wellness' },
  { id: 'h-2', title: 'Review today priority tasks & calendar deadlines', timeOfDay: 'Morning', streak: 18, completedToday: true, category: 'Planning' },
  { id: 'h-3', title: 'Solve 1 algorithmic coding problem or 20m code review', timeOfDay: 'Afternoon', streak: 7, completedToday: false, category: 'Study' },
  { id: 'h-4', title: 'Log daily expenses and review tomorrow morning schedule', timeOfDay: 'Evening', streak: 14, completedToday: false, category: 'Planning' },
  { id: 'h-5', title: 'Screen shutdown 30 mins before sleep & read 15 pages', timeOfDay: 'Evening', streak: 5, completedToday: false, category: 'Wellness' },
];

export const INITIAL_PERSONAL_REMINDERS: PersonalReminder[] = [
  { id: 'rem-1', title: 'Schedule dental check-up before winter break', category: 'Health', dueDate: '2026-11-06', completed: false },
  { id: 'rem-2', title: 'Pick up dry cleaning & suit for internship career fair', category: 'Errands', dueDate: '2026-11-04', completed: true },
  { id: 'rem-3', title: 'Submit financial aid renewal document to bursar', category: 'Finance', dueDate: '2026-11-15', completed: false },
  { id: 'rem-4', title: 'Call grandma for birthday', category: 'Social', dueDate: '2026-11-03', completed: false },
];
