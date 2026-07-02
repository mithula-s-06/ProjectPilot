import React, { useState, useEffect } from 'react';
import { FiX, FiArrowRight } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import TeamLeaderNavbar from '../components/TeamLeaderNavbar';
import TeamLeaderSidebar from '../components/TeamLeaderSidebar';
import AIInsights from '../components/AIInsights';

// Pages
import Projects from './Projects';
import ProjectDetails from './ProjectDetails';
import TeamMembers from './TeamMembers';
import Tasks from './Tasks';
import Milestones from './Milestones';
import WeeklyReports from './WeeklyReports';
import Performance from './Performance';
import Settings from './Settings';
import Profile from './Profile';
import NotificationsPage from './NotificationsPage';
import SubmitReport from './SubmitReport';
import ChatGuru from './ChatGuru';

// Mock Notification list
import { initialNotifications } from '../utils/mockData';

const TeamLeaderDashboard = () => {
  const { navigateTo } = usePage();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Set up projects dynamically based on the team the leader leads
  const [projects, setProjects] = useState(() => {
    const allMockProjects = [
      {
        id: 'proj-1',
        name: 'Smart Attendance System',
        domain: 'Computer Vision / OpenCV',
        description: 'AI-powered classroom attendance register using facial recognition models.',
        phase: 'Integration Phase',
        mentor: 'Dr. Kumar',
        health: 94,
        progress: 82,
        status: 'Active',
        healthDetails: {
          scores: [90, 92, 94],
          months: ['Apr', 'May', 'Jun'],
          aiSummary: 'GitHub commits and reports are active. Model inference latency is stabilized.'
        },
        riskDetails: {
          riskLevel: 'Low Risk',
          factors: [],
          aiExplanation: 'Active indicators stable. Zero warnings.',
          prediction: 2
        },
        tasks: [
          { id: 't1-1', name: 'Optimize OpenCV facial landmarks', assignedDate: '2026-06-15', deadline: '2026-06-25', priority: 'High', status: 'Completed' },
          { id: 't1-2', name: 'Deploy dashboard UI views', assignedDate: '2026-06-20', deadline: '2026-07-05', priority: 'Medium', status: 'In Progress' }
        ],
        milestones: [
          { id: 'm1-1', name: 'Facial Mesh Detection accuracy 95%', dueDate: '2026-06-22', progress: 100, status: 'Completed' },
          { id: 'm1-2', name: 'WASM edge compilation tests', dueDate: '2026-07-10', progress: 40, status: 'Pending' }
        ],
        weeklyReports: [
          { id: 'w1-1', week: 'Week 1 (Mesh Fitting)', submissionStatus: 'Verified', submittedDate: '2026-06-21', remarks: 'Good accuracy logs.', fileUrl: '#' }
        ],
        github: { commits: 142, prs: 18, issuesClosed: 14, contributionPercentage: 40, repoUrl: 'https://github.com/projectpilot/smart-attendance' },
        mentorFeedback: { latestFeedback: 'Accuracy rates verified. Optimizations completed.', date: '2026-06-21', allComments: [] }
      },
      {
        id: 'proj-2',
        name: 'Deep Learning Image Segmentation',
        domain: 'Deep Learning / U-Net',
        description: 'Medical image cell boundary segmentation using modified neural networks.',
        phase: 'Testing Phase',
        mentor: 'Prof. Sharma',
        health: 88,
        progress: 64,
        status: 'Active',
        healthDetails: {
          scores: [80, 85, 88],
          months: ['Apr', 'May', 'Jun'],
          aiSummary: 'Weekly report completion rate is 100%. Code revisions are verified.'
        },
        riskDetails: {
          riskLevel: 'Low Risk',
          factors: [],
          aiExplanation: 'Minor delay in sprint milestones. Overall risk is low.',
          prediction: 4
        },
        tasks: [],
        milestones: [],
        weeklyReports: [],
        github: { commits: 96, prs: 10, issuesClosed: 8, contributionPercentage: 25, repoUrl: 'https://github.com/projectpilot/deep-segmentation' },
        mentorFeedback: { latestFeedback: 'Validation loss graph looks consistent. Proceed with cloud tests.', date: '2026-06-19', allComments: [] }
      },
      {
        id: 'proj-3',
        name: 'IoT Home Gateway Hub',
        domain: 'IoT / Hardware',
        description: 'Distributed smart home nodes coordinating gateway sensor packets.',
        phase: 'Development Phase',
        mentor: 'Dr. Priya',
        health: 76,
        progress: 48,
        status: 'Active',
        healthDetails: {
          scores: [85, 80, 76],
          months: ['Apr', 'May', 'Jun'],
          aiSummary: 'Decline due to low hardware activity this week. BLE pairing is in progress.'
        },
        riskDetails: {
          riskLevel: 'Medium Risk',
          factors: ['Low Git Commits'],
          aiExplanation: 'Low commit volume from dev nodes. Sprints have minor bottlenecks.',
          prediction: 15
        },
        tasks: [],
        milestones: [],
        weeklyReports: [],
        github: { commits: 64, prs: 6, issuesClosed: 4, contributionPercentage: 20, repoUrl: 'https://github.com/projectpilot/iot-home-gateway' },
        mentorFeedback: { latestFeedback: 'Address BLE latency spikes in gateway pairing.', date: '2026-06-18', allComments: [] }
      },
      {
        id: 'proj-4',
        name: 'Edge Security Diagnostics',
        domain: 'Cybersecurity / Router',
        description: 'Decentralized hardware firewall security log crawler.',
        phase: 'Planning Phase',
        mentor: 'Not Assigned',
        health: 50,
        progress: 20,
        status: 'Active',
        healthDetails: {
          scores: [60, 55, 50],
          months: ['Apr', 'May', 'Jun'],
          aiSummary: 'Decline due to two missed task deadlines and pending mentor feedback.'
        },
        riskDetails: {
          riskLevel: 'High Risk',
          factors: ['Missed Deadlines', 'Low Activity'],
          aiExplanation: 'Unassigned mentor. Missed two weekly milestones. Immediate action required.',
          prediction: 42
        },
        tasks: [],
        milestones: [],
        weeklyReports: [],
        github: { commits: 28, prs: 2, issuesClosed: 1, contributionPercentage: 15, repoUrl: 'https://github.com/projectpilot/edge-security' },
        mentorFeedback: { latestFeedback: 'Awaiting first document submission.', date: '--', allComments: [] }
      }
    ];

    try {
      const stored = localStorage.getItem('projects');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';

      if (myTeamName && myTeamName !== 'Not Assigned') {
        const sourceProjects = stored ? JSON.parse(stored) : allMockProjects;
        const matchingProject = sourceProjects.find(p => 
          (p.teamName && p.teamName.toLowerCase() === myTeamName.toLowerCase()) ||
          (myTeamName === 'Team Alpha' && (p.name.includes('Attendance') || p.name.includes('Alpha'))) ||
          (myTeamName === 'Team Beta' && (p.name.includes('Health') || p.name.includes('Beta'))) ||
          (myTeamName === 'Team Gamma' && (p.name.includes('Plagiarism') || p.name.includes('Gamma'))) ||
          (myTeamName === 'Team Delta' && (p.name.includes('Irrigation') || p.name.includes('Delta'))) ||
          (myTeamName === 'Team Omega' && (p.name.includes('Voting') || p.name.includes('Blockchain') || p.name.includes('Omega'))) ||
          (p.name && p.name.toLowerCase().includes(myTeamName.toLowerCase()))
        );
        if (matchingProject) {
          return [matchingProject];
        }
        
        return [{
          id: `proj-${Date.now()}`,
          name: `${myTeamName} Project`,
          domain: 'Development / Research',
          description: `Active project dashboard for ${myTeamName}.`,
          phase: 'Planning Phase',
          mentor: 'Dr. Kumar',
          health: 80,
          progress: 10,
          status: 'Active',
          healthDetails: { scores: [80], months: ['Jun'], aiSummary: 'Project setup completed successfully.' },
          riskDetails: { riskLevel: 'Low Risk', factors: [], aiExplanation: 'Initial project setup stable.', prediction: 0 },
          tasks: [],
          milestones: [],
          weeklyReports: [],
          github: { commits: 0, prs: 0, issuesClosed: 0, contributionPercentage: 100 },
          mentorFeedback: { latestFeedback: 'No feedback submitted yet.', date: '--', allComments: [] }
        }];
      }
    } catch (err) {
      console.error(err);
    }

    return [];
  });

  const myTeamName = (() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      return myUserRecord ? myUserRecord.team : 'Not Assigned';
    } catch (e) {
      return 'Not Assigned';
    }
  })();
  const myProject = projects[0] || null;

  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submittingTask, setSubmittingTask] = useState(null);

  const handleSubmitTaskReport = (projectId, reportData) => {
    const newReport = {
      id: `rep-${Date.now()}`,
      week: reportData.title || `Task Report: ${reportData.taskName}`,
      submissionStatus: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      remarks: reportData.description,
      fileName: reportData.fileName,
      fileSize: reportData.fileSize,
      fileUrl: reportData.fileUrl || '#'
    };
    
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedTasks = (p.tasks || []).map((t) => {
            if (t.name === reportData.taskName) {
              return {
                ...t,
                reportSubmitted: true,
                reportDetails: newReport,
                isReassigned: false
              };
            }
            return t;
          });
          
          const cleanReports = (p.weeklyReports || []).filter(r => 
            !updatedTasks.some(t => t.name === reportData.taskName && t.reportDetails && t.reportDetails.id === r.id)
          );

          return {
            ...p,
            tasks: updatedTasks,
            weeklyReports: [...cleanReports, newReport]
          };
        }
        return p;
      })
    );

    setSelectedProject((prev) => {
      if (prev && prev.id === projectId) {
        const updatedTasks = (prev.tasks || []).map((t) => {
          if (t.name === reportData.taskName) {
            return {
              ...t,
              reportSubmitted: true,
              reportDetails: newReport,
              isReassigned: false
            };
          }
          return t;
        });
        
        const cleanReports = (prev.weeklyReports || []).filter(r => 
          !updatedTasks.some(t => t.name === reportData.taskName && t.reportDetails && t.reportDetails.id === r.id)
        );

        return {
          ...prev,
          tasks: updatedTasks,
          weeklyReports: [...cleanReports, newReport]
        };
      }
      return prev;
    });

    setActiveTab('project-details');
  };

  const [notifications, setNotifications] = useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const email = currentUser.email?.toLowerCase();
      
      const stored = localStorage.getItem('notifications');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';

      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.filter(n => 
          !n.targetEmail || 
          n.targetEmail.toLowerCase() === email ||
          (n.targetTeam && myTeamName && n.targetTeam.toLowerCase() === myTeamName.toLowerCase())
        );
      } else {
        const seeded = initialNotifications.map(n => ({ 
          ...n, 
          targetEmail: email,
          targetTeam: myTeamName ? myTeamName.toLowerCase() : ''
        }));
        localStorage.setItem('notifications', JSON.stringify(seeded));
        return seeded;
      }
    } catch (e) {
      console.error(e);
      return initialNotifications;
    }
  });

  const [newTeamNameInput, setNewTeamNameInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [teamNameUpdated, setTeamNameUpdated] = useState(false);

  const handleCreateTeamSubmit = () => {
    if (!newTeamNameInput.trim()) {
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const oldTeamName = currentUser.team;
      const newTeamName = newTeamNameInput.trim();
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIdx = registeredUsers.findIndex(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());

      if (userIdx !== -1) {
        registeredUsers[userIdx].team = newTeamName;
        
        if (oldTeamName && oldTeamName !== 'Not Assigned') {
          registeredUsers.forEach(u => {
            if (u.team && u.team.toLowerCase() === oldTeamName.toLowerCase()) {
              u.team = newTeamName;
            }
          });
        }

        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        currentUser.team = newTeamName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      setSuccessMsg(`Team "${newTeamNameInput}" was successfully created!`);
      
      setProjects([{
        id: `proj-${Date.now()}`,
        name: `${newTeamNameInput.trim()} Project`,
        domain: 'Development / Research',
        description: `Active project dashboard for ${newTeamNameInput.trim()}.`,
        phase: 'Planning Phase',
        mentor: 'Not Assigned',
        health: 80,
        progress: 10,
        status: 'Active',
        healthDetails: { scores: [80], months: ['Jun'], aiSummary: 'Project setup completed successfully.' },
        riskDetails: { riskLevel: 'Low Risk', factors: [], aiExplanation: 'Initial project setup stable.', prediction: 0 },
        tasks: [],
        milestones: [],
        weeklyReports: [],
        github: { commits: 0, prs: 0, issuesClosed: 0, contributionPercentage: 100 },
        mentorFeedback: { latestFeedback: 'No feedback submitted yet.', date: '--', allComments: [] }
      }]);

      setNewTeamNameInput('');
      setTeamNameUpdated(true);

      setTimeout(() => {
        setSuccessMsg('');
      }, 3500);

    } catch (err) {
      console.error(err);
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const saveProjectsToStorage = (updatedProjectsList) => {
    try {
      const stored = localStorage.getItem('projects');
      if (stored) {
        const allProj = JSON.parse(stored);
        const nextProj = allProj.map(p => {
          const match = updatedProjectsList.find(up => up.id === p.id);
          return match ? match : p;
        });
        updatedProjectsList.forEach(up => {
          if (!allProj.some(p => p.id === up.id)) {
            nextProj.push(up);
          }
        });
        localStorage.setItem('projects', JSON.stringify(nextProj));
      } else {
        localStorage.setItem('projects', JSON.stringify(updatedProjectsList));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (projects && projects.length > 0) {
      saveProjectsToStorage(projects);
    }
  }, [projects]);

  useEffect(() => {
    const handleFocus = () => {
      try {
        const stored = localStorage.getItem('projects');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
        const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';

        if (myTeamName && myTeamName !== 'Not Assigned' && stored) {
          const sourceProjects = JSON.parse(stored);
          const matchingProject = sourceProjects.find(p => 
            (p.teamName && p.teamName.toLowerCase() === myTeamName.toLowerCase() && p.name !== `${myTeamName} Project`)
          ) || sourceProjects.find(p => 
            (p.teamName && p.teamName.toLowerCase() === myTeamName.toLowerCase()) ||
            (myTeamName === 'Team Alpha' && (p.name.includes('Attendance') || p.name.includes('Alpha'))) ||
            (myTeamName === 'Team Beta' && (p.name.includes('Health') || p.name.includes('Beta'))) ||
            (myTeamName === 'Team Gamma' && (p.name.includes('Plagiarism') || p.name.includes('Gamma'))) ||
            (myTeamName === 'Team Delta' && (p.name.includes('Irrigation') || p.name.includes('Delta'))) ||
            (myTeamName === 'Team Omega' && (p.name.includes('Voting') || p.name.includes('Blockchain') || p.name.includes('Omega'))) ||
            (p.name && p.name.toLowerCase().includes(myTeamName.toLowerCase()))
          );
          if (matchingProject) {
            setProjects([matchingProject]);
          }
        }

        const storedNotifs = localStorage.getItem('notifications');
        if (storedNotifs && currentUser.email) {
          const parsed = JSON.parse(storedNotifs);
          setNotifications(parsed.filter(n => 
            !n.targetEmail || 
            n.targetEmail.toLowerCase() === currentUser.email.toLowerCase() ||
            (n.targetTeam && myTeamName && n.targetTeam.toLowerCase() === myTeamName.toLowerCase())
          ));
        }
      } catch (err) {
        console.error(err);
      }
    };

    const handleStorageChange = (e) => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
        const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';

        if (e.key === 'notifications' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (currentUser.email) {
            setNotifications(parsed.filter(n => 
              !n.targetEmail || 
              n.targetEmail.toLowerCase() === currentUser.email.toLowerCase() ||
              (n.targetTeam && myTeamName && n.targetTeam.toLowerCase() === myTeamName.toLowerCase())
            ));
          }
        }

        if (e.key === 'projects' && e.newValue) {
          const allProj = JSON.parse(e.newValue);
          if (myTeamName && myTeamName !== 'Not Assigned') {
            const matchingProject = allProj.find(p => 
              (p.teamName && p.teamName.toLowerCase() === myTeamName.toLowerCase() && p.name !== `${myTeamName} Project`)
            ) || allProj.find(p => 
              (p.teamName && p.teamName.toLowerCase() === myTeamName.toLowerCase()) ||
              (myTeamName === 'Team Alpha' && (p.name.includes('Attendance') || p.name.includes('Alpha'))) ||
              (myTeamName === 'Team Beta' && (p.name.includes('Health') || p.name.includes('Beta'))) ||
              (myTeamName === 'Team Gamma' && (p.name.includes('Plagiarism') || p.name.includes('Gamma'))) ||
              (myTeamName === 'Team Delta' && (p.name.includes('Irrigation') || p.name.includes('Delta'))) ||
              (myTeamName === 'Team Omega' && (p.name.includes('Voting') || p.name.includes('Blockchain') || p.name.includes('Omega'))) ||
              (p.name && p.name.toLowerCase().includes(myTeamName.toLowerCase()))
            );
            if (matchingProject) {
              setProjects([matchingProject]);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleViewProject = (proj) => {
    try {
      const stored = localStorage.getItem('projects');
      if (stored) {
        const allProj = JSON.parse(stored);
        const freshProj = allProj.find(p => p.id === proj.id);
        if (freshProj) {
          setProjects(prev => prev.map(p => p.id === proj.id ? freshProj : p));
          setSelectedProject(freshProj);
          setActiveTab('project-details');
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setSelectedProject(proj);
    setActiveTab('project-details');
  };

  const handleUpdateTasks = (updatedTasks) => {
    setProjects(prev => prev.map((p, idx) => {
      if (idx === 0) {
        const cleanReports = (p.weeklyReports || []).filter(r => 
          !updatedTasks.some(t => t.reportDetails && t.reportDetails.id === r.id)
        );
        const activeTaskReports = updatedTasks
          .filter((t) => t.reportSubmitted && t.reportDetails)
          .map((t) => t.reportDetails);

        const nextP = { 
          ...p, 
          tasks: updatedTasks,
          weeklyReports: [...cleanReports, ...activeTaskReports]
        };
        if (selectedProject && selectedProject.id === p.id) {
          setSelectedProject(nextP);
        }
        return nextP;
      }
      return p;
    }));
  };

  const handleUpdateMilestones = (updatedMilestones) => {
    setProjects(prev => prev.map((p, idx) => {
      if (idx === 0) {
        const nextP = { ...p, milestones: updatedMilestones };
        if (selectedProject && selectedProject.id === p.id) {
          setSelectedProject(nextP);
        }
        return nextP;
      }
      return p;
    }));
  };

  const handleCreateProject = (newProj) => {
    setProjects(prev => [newProj, ...prev]);
  };

  const handleEditProject = (updatedProj) => {
    const oldProj = projects.find(p => p.id === updatedProj.id);
    const oldTeamName = oldProj ? oldProj.teamName : '';
    const newTeamName = updatedProj.teamName;

    if (oldTeamName && newTeamName && oldTeamName.toLowerCase() !== newTeamName.toLowerCase()) {
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        let updatedUsers = false;
        registeredUsers.forEach(u => {
          if (u.team && u.team.toLowerCase() === oldTeamName.toLowerCase()) {
            u.team = newTeamName;
            updatedUsers = true;
          }
        });
        if (updatedUsers) {
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.team && currentUser.team.toLowerCase() === oldTeamName.toLowerCase()) {
          currentUser.team = newTeamName;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      } catch (err) {
        console.error(err);
      }
    }

    setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    if (selectedProject && selectedProject.id === updatedProj.id) {
      setSelectedProject(updatedProj);
    }
  };

  const handleDeleteProject = (projId) => {
    setDeleteConfirm({
      type: 'project',
      message: 'Are you sure you want to delete this project? This will permanently delete the project and all related tasks and milestones.',
      onConfirm: () => {
        setProjects(prev => prev.filter(p => p.id !== projId));
        if (selectedProject && selectedProject.id === projId) {
          setSelectedProject(null);
          setActiveTab('projects');
        }
      }
    });
  };

  const handleSubmitWeeklyReport = (projectId, reportData) => {
    const newReport = {
      id: `rep-${Date.now()}`,
      week: reportData.weekNumber || 'Week 1',
      remarks: reportData.remarks || 'No remarks provided.',
      submissionStatus: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      fileName: reportData.fileName,
      fileSize: reportData.fileSize,
      fileUrl: '#'
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            weeklyReports: [...(p.weeklyReports || []), newReport]
          };
        }
        return p;
      })
    );

    setSelectedProject((prev) => {
      if (prev && prev.id === projectId) {
        return {
          ...prev,
          weeklyReports: [...(prev.weeklyReports || []), newReport]
        };
      }
      return prev;
    });
  };

  const renderDashboardMain = () => {
    // Show only the latest 3 projects
    const latestProjects = projects.slice(0, 3);

    return (
      <div className="space-y-8 animate-fade-in text-left">
        
        {/* Welcome Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Welcome 👋
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Manage your team's projects, assign tasks, monitor progress, and lead your team with AI-powered guidance.
          </p>
        </div>

        {/* Set Up Team Card if Not Assigned */}
        {myTeamName === 'Not Assigned' && (
          <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-brand-text">Set Up Your Team</h3>
            <p className="text-xs text-brand-text-muted leading-relaxed">
              You are not currently assigned to any team. Enter your team name below to initialize your team and start collaborating.
            </p>
            
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold animate-fade-in">
                {successMsg}
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Team Alpha"
                value={newTeamNameInput}
                onChange={(e) => setNewTeamNameInput(e.target.value)}
                className="flex-grow px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-primary/50 text-sm"
              />
              <button
                type="button"
                onClick={handleCreateTeamSubmit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 cursor-pointer"
              >
                Setup Team
              </button>
            </div>
          </div>
        )}

        {/* MY PROJECTS (LATEST 3) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/40">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-text">
              My Projects Overview
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer focus:outline-none"
            >
              View All Projects <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestProjects.map((proj) => (
              <div 
                key={proj.id} 
                className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex flex-col justify-between hover:border-primary/20 hover:shadow-glow-primary/5 transition-all duration-300 h-full text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-brand-text">{proj.name}</h4>
                      <span className="text-[10px] text-brand-text-muted font-semibold block mt-0.5">{proj.domain}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded border border-brand-border bg-slate-100/50 dark:bg-slate-900/20 text-[9px] font-bold text-brand-text-muted uppercase select-none">
                      {proj.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-semibold text-brand-text-muted">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider block text-brand-text-muted/60 mb-0.5">Health</span>
                      <strong className={proj.health >= 80 ? 'text-emerald-500' : proj.health >= 60 ? 'text-amber-500' : 'text-rose-500'}>
                        {proj.health}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider block text-brand-text-muted/60 mb-0.5">Progress</span>
                      <strong className="text-brand-text">{proj.progress}%</strong>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${proj.health >= 80 ? 'bg-emerald-500' : proj.health >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>

                  <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-xs">
                    <span className="text-brand-text-muted font-medium">Mentor: <strong className="text-brand-text">{proj.mentor}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleViewProject(proj)}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer focus:outline-none"
                    >
                      View Details <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI TEAM INSIGHTS */}
        <AIInsights />

      </div>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return (
          <Projects 
            projects={projects} 
            onViewProject={handleViewProject} 
            onAddProject={handleCreateProject} 
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      case 'project-details':
        return (
          <ProjectDetails 
            project={selectedProject} 
            onBack={() => setActiveTab('projects')} 
            onNavigateToSubmitReport={(task) => {
              setSubmittingTask(task);
              setActiveTab('submit-report');
            }}
            onNavigateToEditReport={(task) => {
              const freshTask = selectedProject?.tasks?.find(t => t.id === task.id) || task;
              setSubmittingTask(freshTask);
              setActiveTab('edit-report');
            }}
            onSubmitWeeklyReport={handleSubmitWeeklyReport}
            onUpdateTasks={handleUpdateTasks}
          />
        );
      case 'submit-report':
        return (
          <SubmitReport 
            task={submittingTask}
            onBack={() => setActiveTab('project-details')}
            onSubmit={(reportData) => {
              handleSubmitTaskReport(selectedProject.id, {
                taskName: submittingTask.name,
                title: reportData.title,
                description: reportData.description,
                fileName: reportData.fileName,
                fileSize: reportData.fileSize,
                fileUrl: reportData.fileUrl
              });
            }}
          />
        );
      case 'edit-report':
        return (
          <SubmitReport 
            task={submittingTask}
            isEdit={true}
            initialData={{
              title: submittingTask?.reportDetails?.week || '',
              description: submittingTask?.reportDetails?.remarks || '',
              fileName: submittingTask?.reportDetails?.fileName || '',
              fileSize: submittingTask?.reportDetails?.fileSize || ''
            }}
            onBack={() => setActiveTab('project-details')}
            onSubmit={(reportData) => {
              handleSubmitTaskReport(selectedProject.id, {
                taskName: submittingTask.name,
                title: reportData.title,
                description: reportData.description,
                fileName: reportData.fileName,
                fileSize: reportData.fileSize,
                fileUrl: reportData.fileUrl
              });
            }}
          />
        );
      case 'members':
        return <TeamMembers projects={projects} />;
      case 'tasks':
        return <Tasks project={myProject} teamName={myTeamName} onUpdateTasks={handleUpdateTasks} />;
      case 'milestones':
        return <Milestones project={myProject} teamName={myTeamName} onUpdateMilestones={handleUpdateMilestones} />;
      case 'reports':
        return (
          <WeeklyReports 
            project={myProject} 
            teamName={myTeamName} 
            onSubmitReport={handleSubmitWeeklyReport} 
          />
        );
      case 'performance':
        return <Performance project={myProject} teamName={myTeamName} />;
      case 'chat-guru':
        return <ChatGuru />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return (
          <NotificationsPage 
            notifications={notifications} 
            onClearAll={() => setNotifications([])} 
            onBack={() => setActiveTab('dashboard')} 
          />
        );
      case 'profile':
        return <Profile />;
      case 'dashboard':
      default:
        return renderDashboardMain();
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-brand-bg text-brand-text flex flex-col transition-colors duration-300">
      
      {/* Sticky Top Navbar */}
      <TeamLeaderNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        onLogout={handleLogout}
        notifications={notifications}
        onSeeAllNotifications={() => setActiveTab('notifications')}
      />

      {/* Frame wrapper */}
      <div className="flex flex-grow relative overflow-hidden">
        
        {/* DESKTOP FIXED SIDEBAR */}
        <TeamLeaderSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
        />

        {/* MOBILE DRAWER SIDEBAR OVERLAY */}
        {mobileSidebarOpen && (
          <>
            <div 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300"
            />
            <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-brand-card/95 border-r border-brand-border p-5 z-50 flex flex-col justify-between shadow-2xl animate-slide-right">
              <div className="space-y-6">
                
                {/* Brand title */}
                <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                  <span className="font-extrabold text-sm text-primary uppercase tracking-widest">
                    Portal Menu
                  </span>
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-full border border-brand-border text-brand-text-muted hover:text-brand-text focus:outline-none"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Menu items */}
                <div className="space-y-2.5">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'members', label: 'Team Members' },
                    { id: 'tasks', label: 'Tasks' },
                    { id: 'milestones', label: 'Milestones' },
                    { id: 'reports', label: 'Weekly Reports' },
                    { id: 'performance', label: 'Performance' },
                    { id: 'chat-guru', label: 'Chat Guru' },
                    { id: 'settings', label: 'Settings' },
                    { id: 'profile', label: 'Profile' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileSidebarOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        activeTab === tab.id ||
                        (tab.id === 'projects' && activeTab === 'project-details')
                          ? 'bg-gradient-to-r from-primary/20 to-secondary/15 text-primary border-l-4 border-primary'
                          : 'text-brand-text-muted hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Logout */}
              <button
                onClick={() => { setMobileSidebarOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-500/20 text-rose-500 font-bold text-xs uppercase tracking-wider hover:bg-rose-500/10 transition-all duration-300 cursor-pointer"
              >
                Logout Portal
              </button>
            </aside>
          </>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-grow transition-all duration-300 p-6 sm:p-8 h-[calc(100vh-76px)] overflow-y-auto flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full flex-grow">
            {renderActiveTabContent()}
          </div>
          {/* Footer */}
          <footer className="w-full py-4 text-center text-xs text-brand-text-muted/60 border-t border-brand-border/40 select-none mt-8">
            © {new Date().getFullYear()} ProjectPilot. All rights reserved.
          </footer>
        </main>

      </div>

      {/* Logout Confirmation Modal Box */}
      {showLogoutModal && (
        <>
          <div 
            onClick={() => setShowLogoutModal(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] transition-opacity duration-300 animate-fade-in" 
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[400px] rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 z-[10000] text-center animate-scale-up">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Are you sure you want to log out from the Team Leader portal? Any unsaved progress may be lost.
              </p>
              <div className="flex items-center gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(false);
                    navigateTo('landing');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white hover:brightness-110 font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {deleteConfirm && (
        <>
          <div 
            onClick={() => setDeleteConfirm(null)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] transition-opacity duration-300 animate-fade-in" 
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[400px] rounded-3xl border border-brand-border bg-brand-card shadow-2xl p-6 z-[10000] text-center animate-scale-up">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-brand-text">
                Confirm Deletion
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed max-w-xs">
                {deleteConfirm.message}
              </p>
              <div className="flex items-center gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-brand-border bg-brand-card text-brand-text font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConfirm.onConfirm();
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white hover:brightness-110 font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default TeamLeaderDashboard;
