export const initialTeams = [
  {
    id: 'team-1',
    rank: 1,
    name: 'Team Alpha',
    project: 'AI Attendance System',
    health: 96,
    mentor: 'Dr. Kumar',
    status: 'Excellent',
    membersCount: 4,
    leaderName: 'Ankit Sharma',
  },
  {
    id: 'team-2',
    rank: 2,
    name: 'Team Beta',
    project: 'ProjectPilot SaaS',
    health: 92,
    mentor: 'Prof. Sharma',
    status: 'Very Good',
    membersCount: 5,
    leaderName: 'Rohan Patel',
  },
  {
    id: 'team-3',
    rank: 3,
    name: 'Team Gamma',
    project: 'Automated Plagiarism Bot',
    health: 85,
    mentor: 'Dr. Priya',
    status: 'Good',
    membersCount: 4,
    leaderName: 'Sameer Verma',
  },
  {
    id: 'team-4',
    rank: 4,
    name: 'Team Delta',
    project: 'Smart Irrigation IoT',
    health: 74,
    mentor: 'Not Assigned',
    status: 'Average',
    membersCount: 3,
    leaderName: 'Neha Gupta',
  },
  {
    id: 'team-5',
    rank: 5,
    name: 'Team Omega',
    project: 'Blockchain Voting',
    health: 48,
    mentor: 'Not Assigned',
    status: 'Poor',
    membersCount: 3,
    leaderName: 'Tanvi Rao',
  },
];

export const initialUsers = [
  {
    id: 'usr-1',
    name: 'Ankit Sharma',
    email: 'ankit.s@pp.edu',
    role: 'Student / Team Leader',
    team: 'Team Alpha',
    status: 'Active',
    avatarInitials: 'AS',
    avatarBg: 'bg-primary/20 text-primary',
  },
  {
    id: 'usr-2',
    name: 'Dr. Kumar',
    email: 'kumar@pp.edu',
    role: 'Mentor',
    team: 'Multiple',
    status: 'Active',
    avatarInitials: 'DK',
    avatarBg: 'bg-cyan-500/20 text-cyan-500',
  },
  {
    id: 'usr-3',
    name: 'Neha Gupta',
    email: 'neha.g@pp.edu',
    role: 'Student / Team Leader',
    team: 'Team Delta',
    status: 'Active',
    avatarInitials: 'NG',
    avatarBg: 'bg-amber-500/20 text-amber-500',
  },
  {
    id: 'usr-4',
    name: 'Sameer Verma',
    email: 'sameer.v@pp.edu',
    role: 'Student / Team Leader',
    team: 'Team Gamma',
    status: 'Active',
    avatarInitials: 'SV',
    avatarBg: 'bg-purple-500/20 text-purple-500',
  },
  {
    id: 'usr-5',
    name: 'Prof. Sharma',
    email: 'sharma@pp.edu',
    role: 'Mentor',
    team: 'Multiple',
    status: 'Active',
    avatarInitials: 'PS',
    avatarBg: 'bg-blue-500/20 text-blue-500',
  },
  {
    id: 'usr-6',
    name: 'Amit Mehta',
    email: 'amit.m@pp.edu',
    role: 'Student',
    team: 'Team Alpha',
    status: 'Active',
    avatarInitials: 'AM',
    avatarBg: 'bg-slate-500/20 text-slate-500',
  },
  {
    id: 'usr-7',
    name: 'Sneha Reddy',
    email: 'sneha.r@pp.edu',
    role: 'Student',
    team: 'Team Beta',
    status: 'Active',
    avatarInitials: 'SR',
    avatarBg: 'bg-rose-500/20 text-rose-500',
  },
  {
    id: 'usr-8',
    name: 'Dr. Priya',
    email: 'priya@pp.edu',
    role: 'Mentor',
    team: 'Multiple',
    status: 'Active',
    avatarInitials: 'DP',
    avatarBg: 'bg-emerald-500/20 text-emerald-500',
  },
  {
    id: 'usr-9',
    name: 'Dr. Jackson',
    email: 'jackson@pp.edu',
    role: 'Mentor',
    team: 'Multiple',
    status: 'Inactive',
    avatarInitials: 'DJ',
    avatarBg: 'bg-indigo-500/20 text-indigo-500',
  },
  {
    id: 'usr-10',
    name: 'Rahul Sen',
    email: 'rahul.s@pp.edu',
    role: 'Student',
    team: 'Team Gamma',
    status: 'Active',
    avatarInitials: 'RS',
    avatarBg: 'bg-sky-500/20 text-sky-500',
  },
];

export const initialMentors = [
  {
    id: 'mentor-1',
    name: 'Dr. Kumar',
    department: 'Computer Science & Engineering',
    currentTeamsAssigned: 2,
    avatarColor: 'bg-cyan-500 text-white',
    avatarInitials: 'DK',
  },
  {
    id: 'mentor-2',
    name: 'Prof. Sharma',
    department: 'Information Technology',
    currentTeamsAssigned: 1,
    avatarColor: 'bg-blue-500 text-white',
    avatarInitials: 'PS',
  },
  {
    id: 'mentor-3',
    name: 'Dr. Priya',
    department: 'Electrical Engineering',
    currentTeamsAssigned: 3,
    avatarColor: 'bg-purple-500 text-white',
    avatarInitials: 'DP',
  },
  {
    id: 'mentor-4',
    name: 'Dr. Jackson',
    department: 'Electronics & Communication',
    currentTeamsAssigned: 0,
    avatarColor: 'bg-emerald-500 text-white',
    avatarInitials: 'DJ',
  },
];

export const initialNotifications = [
  {
    id: 'notif-1',
    type: 'success',
    title: 'New Team Registered',
    message: 'Team Omega submitted registration request.',
    time: '5m ago',
  },
  {
    id: 'notif-2',
    type: 'info',
    title: 'Weekly Report Submitted',
    message: 'Team Alpha submitted Sprint 2 report.',
    time: '15m ago',
  },
  {
    id: 'notif-3',
    type: 'success',
    title: 'Mentor Assigned',
    message: 'Prof. Sharma assigned to Team Beta.',
    time: '1h ago',
  },
  {
    id: 'notif-4',
    type: 'warning',
    title: 'Project Risk Alert',
    message: 'Team Omega health score dropped below 50%.',
    time: '2h ago',
  },
  {
    id: 'notif-5',
    type: 'danger',
    title: 'Plagiarism Detected',
    message: 'Team Delta report has 40% copied text.',
    time: '1d ago',
  },
];

export const studentProjects = [
  {
    id: 'proj-1',
    name: 'AI Attendance Scanner',
    domain: 'Machine Learning / Computer Vision',
    health: 96,
    phase: 'Implementation Phase',
    mentor: 'Dr. Kumar',
    progress: 82,
    status: 'Healthy',
    description: 'An AI-powered attendance tracking system utilizing facial recognition and modern deep learning models to securely register student attendance in real time.',
    healthDetails: {
      scores: [78, 82, 85, 89, 93, 96],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      aiSummary: 'Project health is excellent. Code contributions are consistent, all core milestones are completed on time, and risk of delay is minimal.'
    },
    riskDetails: {
      riskLevel: 'Low Risk',
      factors: ['Vaporizer package dependency lag', 'Minor GPU cloud latency issues'],
      aiExplanation: 'Low risk classification is due to stable contribution charts and timely sprint updates.',
      prediction: 8
    },
    tasks: [
      { id: 't1-1', name: 'Set up OpenCV facial landmarks extraction pipeline', assignedDate: '2026-06-01', deadline: '2026-06-08', priority: 'High', status: 'Completed' },
      { id: 't1-2', name: 'Optimize CNN inference using WebGL/WASM', assignedDate: '2026-06-10', deadline: '2026-06-20', priority: 'High', status: 'Completed' },
      { id: 't1-3', name: 'Integrate dashboard API hooks', assignedDate: '2026-06-22', deadline: '2026-07-05', priority: 'Medium', status: 'In Progress' },
      { id: 't1-4', name: 'Write end-to-end integration tests', assignedDate: '2026-06-25', deadline: '2026-07-12', priority: 'Low', status: 'Pending' }
    ],
    milestones: [
      { id: 'm1-1', name: 'Requirement Analysis & Schema design', dueDate: '2026-06-05', progress: 100, status: 'Completed' },
      { id: 'm1-2', name: 'Core Facial Recognition Model Training', dueDate: '2026-06-18', progress: 100, status: 'Completed' },
      { id: 'm1-3', name: 'Integrate Web UI & Client dashboard', dueDate: '2026-07-02', progress: 60, status: 'Pending' },
      { id: 'm1-4', name: 'Deploy to Cloud & System Audit', dueDate: '2026-07-20', progress: 0, status: 'Pending' }
    ],
    weeklyReports: [
      { id: 'w1-1', week: 'Week 1 (Sprint 1 Summary)', submissionStatus: 'Submitted', submittedDate: '2026-06-07', remarks: 'Good progress on base schema setup.', fileUrl: '#' },
      { id: 'w1-2', week: 'Week 2 (Model Training Insights)', submissionStatus: 'Submitted', submittedDate: '2026-06-14', remarks: 'Model reached 94% accuracy. Verified.', fileUrl: '#' },
      { id: 'w1-3', week: 'Week 3 (Client Panel Wiring)', submissionStatus: 'Submitted', submittedDate: '2026-06-21', remarks: 'Client panel dashboard is fully connected.', fileUrl: '#' },
      { id: 'w1-4', week: 'Week 4 (System deployment preparation)', submissionStatus: 'Pending', submittedDate: '--', remarks: 'Awaiting submission.', fileUrl: '#' }
    ],
    github: {
      commits: 142,
      prs: 18,
      issuesClosed: 24,
      contributionPercentage: 72,
      repoUrl: 'https://github.com/projectpilot/smart-attendance'
    },
    mentorFeedback: {
      latestFeedback: 'Excellent progress on the facial recognition inference optimizer. Keep working on dashboard latency.',
      date: '2026-06-25',
      allComments: [
        { id: 'c1-1', author: 'Dr. Kumar', text: 'Facial landmarks logic is clean. Ensure correct lighting bounds checking.', date: '2026-06-08' },
        { id: 'c1-2', author: 'Dr. Kumar', text: 'CNN optimizer looks solid. Great job with WebGL acceleration.', date: '2026-06-19' },
        { id: 'c1-3', author: 'Dr. Kumar', text: 'Excellent progress on facial recognition inference. Keep it up!', date: '2026-06-25' }
      ]
    }
  },
  {
    id: 'proj-2',
    name: 'Smart Health Tracker',
    domain: 'IoT & Edge Computing',
    health: 92,
    phase: 'Integration Phase',
    mentor: 'Prof. Sharma',
    progress: 68,
    status: 'Healthy',
    description: 'An IoT smart health monitoring project using wearable sensors and an edge processing hub to track vital metrics like heart rate, oxygen levels, and body temp.',
    healthDetails: {
      scores: [82, 85, 84, 88, 90, 92],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      aiSummary: 'Device connectivity is stable. Average reporting delay is less than 5ms. Mentor feedback is positive.'
    },
    riskDetails: {
      riskLevel: 'Low Risk',
      factors: ['Edge device battery drainage', 'API threshold limits'],
      aiExplanation: 'Low risk classification is due to high redundancy in sensor readings and local cache fallbacks.',
      prediction: 12
    },
    tasks: [
      { id: 't2-1', name: 'Establish BLE communication channel', assignedDate: '2026-06-05', deadline: '2026-06-12', priority: 'High', status: 'Completed' },
      { id: 't2-2', name: 'Calibrate pulse oximeter readings', assignedDate: '2026-06-12', deadline: '2026-06-19', priority: 'High', status: 'Completed' },
      { id: 't2-3', name: 'Build dashboard widgets for vital signs', assignedDate: '2026-06-20', deadline: '2026-06-28', priority: 'Medium', status: 'Completed' },
      { id: 't2-4', name: 'Implement local caching on edge node', assignedDate: '2026-06-25', deadline: '2026-07-06', priority: 'Low', status: 'In Progress' }
    ],
    milestones: [
      { id: 'm2-1', name: 'Sensor calibration & BLE setup', dueDate: '2026-06-10', progress: 100, status: 'Completed' },
      { id: 'm2-2', name: 'Local Edge Gateway Processing', dueDate: '2026-06-22', progress: 100, status: 'Completed' },
      { id: 'm2-3', name: 'Cloud Dashboard Integration', dueDate: '2026-07-05', progress: 75, status: 'Pending' },
      { id: 'm2-4', name: 'Field Testing & System performance report', dueDate: '2026-07-25', progress: 0, status: 'Pending' }
    ],
    weeklyReports: [
      { id: 'w2-1', week: 'Week 1 (BLE Setup)', submissionStatus: 'Submitted', submittedDate: '2026-06-09', remarks: 'BLE pairing runs successfully.', fileUrl: '#' },
      { id: 'w2-2', week: 'Week 2 (Oximeter Calibration)', submissionStatus: 'Submitted', submittedDate: '2026-06-16', remarks: 'Readings match clinical benchmarks.', fileUrl: '#' },
      { id: 'w2-3', week: 'Week 3 (Vital Widgets Build)', submissionStatus: 'Submitted', submittedDate: '2026-06-23', remarks: 'Visual charts loaded.', fileUrl: '#' }
    ],
    github: {
      commits: 96,
      prs: 10,
      issuesClosed: 14,
      contributionPercentage: 60,
      repoUrl: 'https://github.com/projectpilot/smart-health'
    },
    mentorFeedback: {
      latestFeedback: 'Calibrations match baseline stats. Let us begin end-to-end load testing on the gateway.',
      date: '2026-06-24',
      allComments: [
        { id: 'c2-1', author: 'Prof. Sharma', text: 'Good start on pairing algorithms. Focus on battery power management.', date: '2026-06-11' },
        { id: 'c2-2', author: 'Prof. Sharma', text: 'Calibration metrics match expectations. Well done.', date: '2026-06-24' }
      ]
    }
  },
  {
    id: 'proj-3',
    name: 'Plagiarism Checking Agent',
    domain: 'Natural Language Processing',
    health: 78,
    phase: 'Review Phase',
    mentor: 'Dr. Priya',
    progress: 55,
    status: 'Review',
    description: 'An intelligent NLP-based plagiarism detection agent that analyzes document submissions, compares them to open web databases, and detects semantic shifts.',
    healthDetails: {
      scores: [72, 70, 75, 74, 76, 78],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      aiSummary: 'Semantic matching pipeline has minor latency concerns. Text tokenization speeds require optimization.'
    },
    riskDetails: {
      riskLevel: 'Medium Risk',
      factors: ['Web crawler rate limits', 'High token processing delays'],
      aiExplanation: 'Rate limit issues on target index domains are causing crawl backlog, resulting in a Medium Risk label.',
      prediction: 34
    },
    tasks: [
      { id: 't3-1', name: 'Train custom semantic embedder', assignedDate: '2026-06-02', deadline: '2026-06-10', priority: 'High', status: 'Completed' },
      { id: 't3-2', name: 'Establish web indexing database client', assignedDate: '2026-06-11', deadline: '2026-06-20', priority: 'High', status: 'In Progress' },
      { id: 't3-3', name: 'Design report generation parser', assignedDate: '2026-06-22', deadline: '2026-06-30', priority: 'Medium', status: 'In Progress' }
    ],
    milestones: [
      { id: 'm3-1', name: 'Document Parser & Embeddings Setup', dueDate: '2026-06-12', progress: 100, status: 'Completed' },
      { id: 'm3-2', name: 'Database Index Crawler Setup', dueDate: '2026-06-25', progress: 70, status: 'Pending' },
      { id: 'm3-3', name: 'Plagiarism Report Builder UI', dueDate: '2026-07-10', progress: 0, status: 'Pending' }
    ],
    weeklyReports: [
      { id: 'w3-1', week: 'Week 1 (NLP Embeddings)', submissionStatus: 'Submitted', submittedDate: '2026-06-11', remarks: 'Embedding accuracy reached 91%.', fileUrl: '#' },
      { id: 'w3-2', week: 'Week 2 (Web Database Crawls)', submissionStatus: 'Pending', submittedDate: '--', remarks: 'Backlog in crawl queues.', fileUrl: '#' }
    ],
    github: {
      commits: 64,
      prs: 6,
      issuesClosed: 9,
      contributionPercentage: 45,
      repoUrl: 'https://github.com/projectpilot/plagiarism-agent'
    },
    mentorFeedback: {
      latestFeedback: 'Web crawler is hitting rate limits. Use randomized headers and proxy pools to circumvent bottlenecks.',
      date: '2026-06-27',
      allComments: [
        { id: 'c3-1', author: 'Dr. Priya', text: 'Try switching to vector database index for faster lookups.', date: '2026-06-14' },
        { id: 'c3-2', author: 'Dr. Priya', text: ' Crawler throttling identified. Randomize header delays.', date: '2026-06-27' }
      ]
    }
  },
  {
    id: 'proj-4',
    name: 'Blockchain Vote Ledger',
    domain: 'Cybersecurity & Cryptography',
    health: 48,
    phase: 'Planning Phase',
    mentor: 'Dr. Jackson',
    progress: 20,
    status: 'Warning',
    description: 'A decentralized, auditable voting ledger project powered by blockchain technology to secure organizational elections and poll tracking.',
    healthDetails: {
      scores: [60, 58, 55, 52, 50, 48],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      aiSummary: 'Project is behind schedule. The planning phase has stalled due to cryptographic library conflicts.'
    },
    riskDetails: {
      riskLevel: 'High Risk',
      factors: ['Cryptographic incompatibility', 'Team contributions dropping', 'Milestone 1 overdue'],
      aiExplanation: 'The project is categorized as High Risk because of a complete lack of commit activity over the past 14 days and unresolved security library conflicts.',
      prediction: 78
    },
    tasks: [
      { id: 't4-1', name: 'Establish elliptic curve crypto library', assignedDate: '2026-06-01', deadline: '2026-06-10', priority: 'High', status: 'Pending' },
      { id: 't4-2', name: 'Write smart contract structure draft', assignedDate: '2026-06-10', deadline: '2026-06-25', priority: 'High', status: 'Pending' }
    ],
    milestones: [
      { id: 'm4-1', name: 'Cryptographic Protocol Choice', dueDate: '2026-06-08', progress: 20, status: 'Pending' },
      { id: 'm4-2', name: 'Smart Contract Local Deployments', dueDate: '2026-06-28', progress: 0, status: 'Pending' }
    ],
    weeklyReports: [
      { id: 'w4-1', week: 'Week 1 (Smart Contracts Plan)', submissionStatus: 'Pending', submittedDate: '--', remarks: 'Awaiting planning updates.', fileUrl: '#' }
    ],
    github: {
      commits: 12,
      prs: 1,
      issuesClosed: 2,
      contributionPercentage: 20,
      repoUrl: 'https://github.com/projectpilot/blockchain-ledger'
    },
    mentorFeedback: {
      latestFeedback: 'This project is critically falling behind. Please schedule a mandatory mentor review call to resolve setup conflicts.',
      date: '2026-06-26',
      allComments: [
        { id: 'c4-1', author: 'Dr. Jackson', text: 'Select EC cryptography libraries that compile with local WASM bindings.', date: '2026-06-12' },
        { id: 'c4-2', author: 'Dr. Jackson', text: 'Overdue reports noted. Please submit Week 1 updates immediately.', date: '2026-06-26' }
      ]
    }
  }
];

export const studentNotifications = [
  {
    id: 'snotif-1',
    type: 'success',
    title: 'Mentor Feedback Added',
    message: 'Dr. Kumar added feedback on AI Attendance Scanner.',
    time: '2m ago',
  },
  {
    id: 'snotif-2',
    type: 'warning',
    title: 'Weekly Report Due',
    message: 'Week 4 report for AI Attendance Scanner is due tomorrow.',
    time: '2h ago',
  },
  {
    id: 'snotif-3',
    type: 'info',
    title: 'Task Assigned',
    message: 'Integrate dashboard API hooks was assigned to you.',
    time: '1d ago',
  },
  {
    id: 'snotif-4',
    type: 'danger',
    title: 'Project Risk Warning',
    message: 'Blockchain Vote Ledger health score fell below 50%.',
    time: '3d ago',
  },
  {
    id: 'snotif-5',
    type: 'success',
    title: 'Project Health Updated',
    message: 'Smart Health Tracker health increased to 92%.',
    time: '4d ago',
  }
];
