import React, { useState, useEffect } from 'react';
import { FiX, FiArrowRight } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import { api, seedHistoricalNotifications, addNotification } from '../utils/api';
import { checkDeadlineReminders } from '../utils/reminders';
import StudentNavbar from '../components/StudentNavbar';
import StudentSidebar from '../components/StudentSidebar';
import ProjectCard from '../components/ProjectCard';

// Sub pages
import Projects from './Projects';
import ProjectDetails from './ProjectDetails';
import Settings from './Settings';
import Profile from './Profile';
import NotificationsPage from './NotificationsPage';
import SubmitReport from './SubmitReport';
import TeamMembers from './TeamMembers';

// Mock datasets
// Clear mock data imports

const StudentDashboard = () => {
  const { navigateTo } = usePage();

  // Active sub-page tab state ('dashboard', 'projects', 'project-details', 'settings', 'profile')
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Collapse / Drawer states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stateful databases
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('projects');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';

      if (myTeamName && myTeamName !== 'Not Assigned') {
        const sourceProjects = stored ? JSON.parse(stored) : [];
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
          return [matchingProject];
        }
        
        return [{
          id: `proj-${Date.now()}`,
          name: `${myTeamName} Project`,
          domain: 'Development / Research',
          description: `Active project dashboard for ${myTeamName}.`,
          progress: 25,
          status: 'Active',
          healthDetails: { scores: [80], months: ['Jun'], aiSummary: 'Project is active.' },
          riskDetails: { riskLevel: 'Low Risk', factors: [], aiExplanation: 'No risk factors detected.', prediction: 0 },
          mentor: 'Not Assigned',
          tasks: [],
          milestones: [],
          weeklyReports: [],
          github: { commits: 10, prs: 1, issuesClosed: 2, contributionPercentage: 100 },
          mentorFeedback: { latestFeedback: 'No comments yet.', date: '--', allComments: [] }
        }];
      }
    } catch (err) {
      console.error(err);
    }
    return [];
  });

  const [studentTeams, setStudentTeams] = useState([]);
  const [activeTeamName, setActiveTeamName] = useState('Not Assigned');

  const myProject = projects.find(p => p.teamName && activeTeamName && p.teamName.toLowerCase() === activeTeamName.toLowerCase()) || projects[0] || null;

  const [selectedProject, setSelectedProject] = useState(null);

  const [memberMetrics, setMemberMetrics] = useState([]);

  useEffect(() => {
    async function loadMetrics() {
      if (activeTeamName && activeTeamName !== 'Not Assigned') {
        try {
          const metrics = await api.getMemberMetricsByTeam(activeTeamName);
          setMemberMetrics(metrics || []);
        } catch (e) {
          console.warn('Failed to load member metrics:', e);
        }
      }
    }
    loadMetrics();
  }, [activeTeamName, projects]);

  const resolvedActiveProject = React.useMemo(() => {
    const proj = selectedProject || myProject;
    if (!proj) return null;
    
    let totalCommits = 0;
    let totalPRs = 0;
    memberMetrics.forEach(m => {
      totalCommits += m.commitsCount || 0;
      totalPRs += m.prsCount || 0;
    });
    
    return {
      ...proj,
      github: {
        ...(proj.github || {}),
        commits: totalCommits,
        prs: totalPRs
      }
    };
  }, [selectedProject, myProject, memberMetrics]);

  const [notifications, setNotifications] = useState(() => {
    try {
      seedHistoricalNotifications();
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const email = currentUser.email?.toLowerCase();
      
      const stored = localStorage.getItem('notifications');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';
      
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.filter(n => {
          const isTargetEmail = n.targetEmail && n.targetEmail.toLowerCase() === email;
          const isTargetTeam = !n.targetEmail && n.targetTeam && myTeamName && myTeamName.split(',').map(t => t.trim().toLowerCase()).includes(n.targetTeam.toLowerCase().trim());
          const isGeneral = !n.targetEmail && !n.targetTeam;
          
          if (!(isTargetEmail || isTargetTeam || isGeneral)) return false;

          const title = (n.title || '').toLowerCase();
          const message = (n.message || '').toLowerCase();
          return (
            title.includes('added') ||
            message.includes('added as a team member') ||
            title.includes('task assigned') ||
            message.includes('assigned a task') ||
            title.includes('milestone declared') ||
            message.includes('milestone') ||
            title.includes('approved') ||
            title.includes('rejected') ||
            title.includes('reassigned') ||
            message.includes('approved') ||
            message.includes('rejected') ||
            title.includes('comment') ||
            message.includes('comment') ||
            title.includes('removed') ||
            message.includes('removed from') ||
            title.includes('profile updated') ||
            title.includes('credentials changed') ||
            message.includes('profile changed') ||
            message.includes('data has been updated') ||
            title.includes('mentor assigned') ||
            message.includes('mentor has been assigned') ||
            message.includes('academic mentor')
          );
        });
      } else {
        localStorage.setItem('notifications', JSON.stringify([]));
        return [];
      }
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [submittingTask, setSubmittingTask] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleClearAllNotifications = async () => {
    try {
      for (const n of notifications) {
        await api.deleteNotification(n.id);
      }
    } catch (err) {
      console.warn('Failed to clear notifications on backend:', err);
    }
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        const remaining = parsed.filter(n => !notifications.some(vn => vn.id === n.id));
        localStorage.setItem('notifications', JSON.stringify(remaining));
      }
    } catch (err) {
      console.error(err);
    }
    setNotifications([]);
  };

  const saveProjectsToStorage = async (updatedProjectsList) => {
    try {
      const stored = localStorage.getItem('projects');
      let nextProj = [];
      if (stored) {
        const allProj = JSON.parse(stored);
        nextProj = allProj.map(p => {
          const match = updatedProjectsList.find(up => up.id === p.id);
          return match ? match : p;
        });
        updatedProjectsList.forEach(up => {
          if (!nextProj.some(p => p.id === up.id)) {
            nextProj.push(up);
          }
        });
      } else {
        nextProj = updatedProjectsList;
      }
      localStorage.setItem('projects', JSON.stringify(nextProj));

      // Async sync to MongoDB backend
      for (const proj of updatedProjectsList) {
        try {
          await api.updateProject(proj.id, proj);
        } catch (e) {
          console.warn(`Background sync failed for project ${proj.id}:`, e);
        }
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
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      
      if (myUserRecord && myUserRecord.team && myUserRecord.team !== 'Not Assigned') {
        if (currentUser.team !== myUserRecord.team) {
          currentUser.team = myUserRecord.team;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        const teamsList = myUserRecord.team.split(',').map(t => t.trim());
        setStudentTeams(teamsList);
        if (activeTeamName === 'Not Assigned' || !teamsList.includes(activeTeamName)) {
          setActiveTeamName(teamsList[0]);
        }

        const stored = localStorage.getItem('projects');
        const sourceProjects = stored ? JSON.parse(stored) : [];
        const matchingProjects = sourceProjects.filter(p => 
          p.teamName && teamsList.some(t => t.toLowerCase() === p.teamName.toLowerCase())
        );
        if (matchingProjects.length > 0) {
          setProjects(matchingProjects);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeTab, activeTeamName]);

  useEffect(() => {
    async function syncData() {
      try {
        const fetchedProj = await api.listProjects();
        localStorage.setItem('projects', JSON.stringify(fetchedProj || []));

        const fetchedUsers = await api.listUsers();
        const mappedUsers = (fetchedUsers || []).map(u => ({
          id: u.id,
          fullName: u.name,
          email: u.email,
          role: u.role === 'TEAM_LEADER' ? 'Team Leader' : u.role === 'MENTOR' ? 'Mentor' : 'Student',
          collegeName: u.collegeName || '',
          department: u.department || 'Computer Science & Engineering',
          status: 'Active',
          team: u.team || 'Not Assigned'
        }));
        localStorage.setItem('registeredUsers', JSON.stringify(mappedUsers));

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const myUserRecord = mappedUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
        
        if (myUserRecord) {
          currentUser.team = myUserRecord.team || 'Not Assigned';
          currentUser.collegeName = myUserRecord.collegeName || currentUser.collegeName || '';
          currentUser.department = myUserRecord.department || currentUser.department || 'Computer Science & Engineering';
          localStorage.setItem('currentUser', JSON.stringify(currentUser));

          const myTeamName = myUserRecord.team;
          if (myTeamName && myTeamName !== 'Not Assigned') {
            const teamsList = myTeamName.split(',').map(t => t.trim());
            setStudentTeams(teamsList);
            if (activeTeamName === 'Not Assigned' || !teamsList.includes(activeTeamName)) {
              setActiveTeamName(teamsList[0]);
            }
            
            const matchingProjects = (fetchedProj || []).filter(p => 
              p.teamName && teamsList.some(t => t.toLowerCase() === p.teamName.toLowerCase())
            );
            setProjects(matchingProjects);
          }
        }
      } catch (err) {
        console.warn('Student syncData failed:', err);
      }
    }
    syncData();
  }, [activeTeamName]);

  // LocalStorage mapping useEffect removed to consolidate in saveProjectsToStorage

  useEffect(() => {
    if (selectedProject) {
      const freshProj = projects.find(p => p.id === selectedProject.id);
      if (freshProj) {
        if (JSON.stringify(freshProj) !== JSON.stringify(selectedProject)) {
          setSelectedProject(freshProj);
        }
      }
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    const handleFocus = async () => {
      try {
        const stored = localStorage.getItem('projects');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (stored) {
          const allProj = JSON.parse(stored);
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
          const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';

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
        
        let liveNotifs = [];
        try {
          liveNotifs = await api.listNotifications() || [];
          localStorage.setItem('notifications', JSON.stringify(liveNotifs));
        } catch (apiErr) {
          console.warn('Failed to fetch notifications from backend inside student dashboard:', apiErr);
          const storedNotifs = localStorage.getItem('notifications');
          liveNotifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        }

        if (currentUser.email) {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
          const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';

          setNotifications(liveNotifs.filter(n => {
            const isTargetEmail = n.targetEmail && n.targetEmail.toLowerCase() === currentUser.email.toLowerCase();
            const isTargetTeam = !n.targetEmail && n.targetTeam && myTeamName && myTeamName.split(',').map(t => t.trim().toLowerCase()).includes(n.targetTeam.toLowerCase().trim());
            const isGeneral = !n.targetEmail && !n.targetTeam;
            
            if (!(isTargetEmail || isTargetTeam || isGeneral)) return false;

            const title = (n.title || '').toLowerCase();
            const message = (n.message || '').toLowerCase();
            return (
              title.includes('added') ||
              message.includes('added as a team member') ||
              title.includes('task assigned') ||
              message.includes('assigned a task') ||
              title.includes('milestone declared') ||
              message.includes('milestone') ||
              title.includes('approved') ||
              title.includes('rejected') ||
              title.includes('reassigned') ||
              message.includes('approved') ||
              message.includes('rejected') ||
              title.includes('comment') ||
              message.includes('comment') ||
              title.includes('removed') ||
              message.includes('removed from') ||
              title.includes('profile updated') ||
              title.includes('credentials changed') ||
              message.includes('profile changed') ||
              message.includes('data has been updated') ||
              title.includes('mentor assigned') ||
              message.includes('mentor has been assigned') ||
              message.includes('academic mentor')
            );
          }));
        }

        // Trigger background deadline reminders check
        if (stored) {
          const allProj = JSON.parse(stored);
          checkDeadlineReminders(allProj);
        }
      } catch (e) {
        console.error(e);
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
            const email = currentUser.email.toLowerCase();
            setNotifications(parsed.filter(n => {
              const isTargetEmail = n.targetEmail && n.targetEmail.toLowerCase() === email;
              const isTargetTeam = !n.targetEmail && n.targetTeam && myTeamName && myTeamName.split(',').map(t => t.trim().toLowerCase()).includes(n.targetTeam.toLowerCase().trim());
              const isGeneral = !n.targetEmail && !n.targetTeam;
              
              if (!(isTargetEmail || isTargetTeam || isGeneral)) return false;

              const title = (n.title || '').toLowerCase();
              const message = (n.message || '').toLowerCase();
              return (
                title.includes('added') ||
                message.includes('added as a team member') ||
                title.includes('task assigned') ||
                message.includes('assigned a task') ||
                title.includes('milestone declared') ||
                message.includes('milestone') ||
                title.includes('approved') ||
                title.includes('rejected') ||
                title.includes('reassigned') ||
                message.includes('approved') ||
                message.includes('rejected') ||
                title.includes('comment') ||
                message.includes('comment') ||
                title.includes('removed') ||
                message.includes('removed from') ||
                title.includes('profile updated') ||
                title.includes('credentials changed') ||
                message.includes('profile changed') ||
                message.includes('data has been updated') ||
                title.includes('mentor assigned') ||
                message.includes('mentor has been assigned') ||
                message.includes('academic mentor')
              );
            }));
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

  const handleSubmitReport = async (projectId, reportData) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newReport = {
      id: `rep-${Date.now()}`,
      week: reportData.title || `Task Report: ${reportData.taskName}`,
      submissionStatus: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      remarks: reportData.description,
      commitsCount: reportData.commitsCount || 0,
      prsCount: reportData.prsCount || 0,
      fileName: reportData.fileName,
      fileSize: reportData.fileSize,
      fileUrl: reportData.fileUrl || '#',
      fileId: reportData.fileId || null
    };
    
    const updatedTasks = (project.tasks || []).map((t) => {
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
    const cleanReports = (project.weeklyReports || []).filter(r => 
      !updatedTasks.some(t => t.name === reportData.taskName && t.reportDetails && t.reportDetails.id === r.id)
    );
    
    let overallCommits = 0;
    let overallPRs = 0;
    updatedTasks.forEach(t => {
      if (t.reportDetails) {
        overallCommits += parseInt(t.reportDetails.commitsCount || 0, 10);
        overallPRs += parseInt(t.reportDetails.prsCount || 0, 10);
      }
    });

    const updatedProj = {
      ...project,
      tasks: updatedTasks,
      commits: overallCommits,
      prs: overallPRs,
      github: {
        ...(project.github || {}),
        commits: overallCommits,
        prs: overallPRs
      },
      weeklyReports: [...cleanReports, newReport]
    };

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const studentName = currentUser.fullName || currentUser.name || '';
    const studentEmail = currentUser.email || '';
    
    let memberCommits = 0;
    let memberPRs = 0;
    updatedTasks.forEach(t => {
      if (t.student && t.student.toLowerCase() === studentName.toLowerCase()) {
        if (t.reportDetails) {
          memberCommits += parseInt(t.reportDetails.commitsCount || 0, 10);
          memberPRs += parseInt(t.reportDetails.prsCount || 0, 10);
        }
      }
    });

    try {
      await api.saveOrUpdateMemberMetric({
        memberName: studentName,
        memberEmail: studentEmail,
        teamName: project.teamName,
        commitsCount: memberCommits,
        prsCount: memberPRs
      });
    } catch (metricErr) {
      console.warn('Failed to save individual member metrics:', metricErr);
    }

    try {
      const updated = await api.updateProject(projectId, updatedProj);

      // Send task uploaded notification to team leader
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const isUserInTeam = (user, tName) => {
          if (!user || !user.team || !tName) return false;
          return user.team.split(',').map(t => t.trim().toLowerCase()).includes(tName.toLowerCase());
        };
        const teamLeader = registeredUsers.find(u => 
          (u.role === 'Team Leader' || u.role === 'TEAM_LEADER') && 
          isUserInTeam(u, project.teamName)
        );
        if (teamLeader) {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const studentName = currentUser.fullName || currentUser.name || 'A team member';
          await addNotification(
            'Task Report Uploaded',
            `Team member "${studentName}" uploaded a report for task "${reportData.taskName}" under project "${project.name}".`,
            teamLeader.email,
            project.teamName,
            'info'
          );
        }
      } catch (notifErr) {
        console.warn('Failed to send task uploaded notification to team leader:', notifErr);
      }

      // Send task uploaded notification to mentor
      try {
        const mentorName = project.mentor;
        if (mentorName && mentorName !== 'Not Assigned') {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const mentorUser = registeredUsers.find(u => 
            (u.role === 'Mentor' || u.role === 'MENTOR') && 
            (u.fullName?.trim().toLowerCase() === mentorName.trim().toLowerCase() || u.name?.trim().toLowerCase() === mentorName.trim().toLowerCase())
          );
          const mentorEmail = mentorUser ? mentorUser.email : null;
          if (mentorEmail) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const studentName = currentUser.fullName || currentUser.name || 'A team member';
            await addNotification(
              'New Report Uploaded',
              `Team member "${studentName}" uploaded a report for task "${reportData.taskName}" under project "${project.name}".`,
              mentorEmail,
              project.teamName,
              'info'
            );
          }
        }
      } catch (notifErr) {
        console.warn('Failed to send task uploaded notification to mentor:', notifErr);
      }

      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }
      setActiveTab('project-details');
    } catch (err) {
      console.error('Failed to submit task report to database:', err);
    }
  };

  const handleSubmitWeeklyReport = async (projectId, reportData) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newReport = {
      id: `rep-${Date.now()}`,
      week: reportData.week || reportData.weekNumber || 'Week 1',
      remarks: reportData.remarks || 'No remarks provided.',
      submissionStatus: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      fileName: reportData.fileName,
      fileSize: reportData.fileSize,
      fileUrl: reportData.fileUrl || '#'
    };

    const updatedProj = {
      ...project,
      weeklyReports: [...(project.weeklyReports || []), newReport]
    };

    try {
      const updated = await api.updateProject(projectId, updatedProj);

      // Send weekly report uploaded notification to mentor
      try {
        const mentorName = project.mentor;
        if (mentorName && mentorName !== 'Not Assigned') {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const mentorUser = registeredUsers.find(u => 
            (u.role === 'Mentor' || u.role === 'MENTOR') && 
            (u.fullName?.trim().toLowerCase() === mentorName.trim().toLowerCase() || u.name?.trim().toLowerCase() === mentorName.trim().toLowerCase())
          );
          const mentorEmail = mentorUser ? mentorUser.email : null;
          if (mentorEmail) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const studentName = currentUser.fullName || currentUser.name || 'A team member';
            await addNotification(
              'New Report Uploaded',
              `Team member "${studentName}" uploaded a weekly report for "${reportData.weekNumber || 'Week'}" under project "${project.name}".`,
              mentorEmail,
              project.teamName,
              'info'
            );
          }
        }
      } catch (notifErr) {
        console.warn('Failed to send weekly report uploaded notification to mentor:', notifErr);
      }

      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }
    } catch (err) {
      console.error('Failed to submit weekly report to database:', err);
    }
  };

  const handleUpdateTaskReports = async (projectId, updatedTasks) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    let overallCommits = 0;
    let overallPRs = 0;
    updatedTasks.forEach(t => {
      if (t.reportDetails) {
        overallCommits += parseInt(t.reportDetails.commitsCount || 0, 10);
        overallPRs += parseInt(t.reportDetails.prsCount || 0, 10);
      }
    });

    const updatedProj = {
      ...project,
      tasks: updatedTasks,
      commits: overallCommits,
      prs: overallPRs,
      github: {
        ...(project.github || {}),
        commits: overallCommits,
        prs: overallPRs
      }
    };

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const studentName = currentUser.fullName || currentUser.name || '';
    const studentEmail = currentUser.email || '';
    
    let memberCommits = 0;
    let memberPRs = 0;
    updatedTasks.forEach(t => {
      if (t.student && t.student.toLowerCase() === studentName.toLowerCase()) {
        if (t.reportDetails) {
          memberCommits += parseInt(t.reportDetails.commitsCount || 0, 10);
          memberPRs += parseInt(t.reportDetails.prsCount || 0, 10);
        }
      }
    });

    try {
      await api.saveOrUpdateMemberMetric({
        memberName: studentName,
        memberEmail: studentEmail,
        teamName: project.teamName,
        commitsCount: memberCommits,
        prsCount: memberPRs
      });
    } catch (metricErr) {
      console.warn('Failed to save individual member metrics:', metricErr);
    }

    try {
      const updated = await api.updateProject(projectId, updatedProj);
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }
    } catch (err) {
      console.error('Failed to update task reports in database:', err);
    }
  };

  // Render main dashboard tab panel
  const renderDashboardMain = () => {
    // Show only the latest 3 assigned projects!
    const latestProjects = projects.slice(0, 3);

    return (
      <div className="space-y-8 animate-fade-in text-left">
        
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
              Welcome 👋
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-muted">
              Continue your project journey with AI-powered guidance.
            </p>
          </div>

          {/* Active Project Switcher Dropdown */}
          {studentTeams.length > 1 && (
            <div className="flex items-center gap-2 p-2 rounded-xl border border-brand-border bg-brand-card shadow-sm self-start sm:self-auto">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">
                Active Team:
              </span>
              <select
                value={activeTeamName}
                onChange={(e) => {
                  const selectedTeam = e.target.value;
                  setActiveTeamName(selectedTeam);
                  
                  const matchedProj = projects.find(p => p.teamName && p.teamName.toLowerCase() === selectedTeam.toLowerCase());
                  if (matchedProj) {
                    setSelectedProject(matchedProj);
                  }
                }}
                className="text-xs font-bold bg-transparent text-brand-text border-none focus:ring-0 focus:outline-none cursor-pointer pr-8"
              >
                {studentTeams.map((team) => (
                  <option key={team} value={team} className="bg-brand-card text-brand-text">
                    {team}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* My Projects Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              My Projects
            </h3>
            {projects.length > 3 && (
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View All Projects <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestProjects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onViewDetails={() => handleViewProject(proj)}
              />
            ))}
          </div>
        </div>

      </div>
    );
  };

  // Render active tab contents
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return <Projects projects={projects} onViewProject={handleViewProject} />;
      case 'project-details':
        const activeProj = resolvedActiveProject;
        return (
          <ProjectDetails 
            project={activeProj} 
            onBack={() => setActiveTab('projects')} 
            onNavigateToSubmitReport={(task) => {
              setSubmittingTask(task);
              setActiveTab('submit-report');
            }}
            onNavigateToEditReport={(task) => {
              const freshTask = activeProj?.tasks?.find(t => t.id === task.id) || task;
              setSubmittingTask(freshTask);
              setActiveTab('edit-report');
            }}
            onSubmitWeeklyReport={handleSubmitWeeklyReport}
            onUpdateTasks={(updatedTasks) => handleUpdateTaskReports(activeProj.id, updatedTasks)}
          />
        );
      case 'submit-report':
        const submitProj = resolvedActiveProject;
        return (
          <SubmitReport 
            task={submittingTask}
            onBack={() => setActiveTab('project-details')}
            onSubmit={(reportData) => {
              handleSubmitReport(submitProj.id, {
                taskName: submittingTask.name,
                title: reportData.title,
                description: reportData.description,
                commitsCount: reportData.commitsCount,
                prsCount: reportData.prsCount,
                fileName: reportData.fileName,
                fileSize: reportData.fileSize,
                fileUrl: reportData.fileUrl,
                fileId: reportData.fileId
              });
            }}
          />
        );
      case 'edit-report':
        const editProj = resolvedActiveProject;
        return (
          <SubmitReport 
            task={submittingTask}
            isEdit={true}
            initialData={{
              title: submittingTask?.reportDetails?.week || '',
              description: submittingTask?.reportDetails?.remarks || '',
              commitsCount: submittingTask?.reportDetails?.commitsCount || 0,
              prsCount: submittingTask?.reportDetails?.prsCount || 0,
              fileName: submittingTask?.reportDetails?.fileName || '',
              fileSize: submittingTask?.reportDetails?.fileSize || '',
              fileUrl: submittingTask?.reportDetails?.fileUrl || '#',
              fileId: submittingTask?.reportDetails?.fileId || null
            }}
            onBack={() => setActiveTab('project-details')}
            onSubmit={(reportData) => {
              const updatedTasks = editProj.tasks.map(t => {
                if (t.id === submittingTask.id) {
                  return {
                    ...t,
                    reportDetails: {
                      ...t.reportDetails,
                      week: reportData.title,
                      remarks: reportData.description,
                      commitsCount: reportData.commitsCount,
                      prsCount: reportData.prsCount,
                      fileName: reportData.fileName || t.reportDetails.fileName,
                      fileSize: reportData.fileSize || t.reportDetails.fileSize,
                      fileUrl: reportData.fileUrl || t.reportDetails.fileUrl || '#',
                      fileId: reportData.fileId || t.reportDetails.fileId || null,
                      submittedDate: new Date().toISOString().split('T')[0]
                    }
                  };
                }
                return t;
              });
              handleUpdateTaskReports(editProj.id, updatedTasks);
              setActiveTab('project-details');
            }}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage 
            notifications={notifications} 
            onClearAll={handleClearAllNotifications} 
            onBack={() => setActiveTab('dashboard')} 
          />
        );
      case 'members':
        return <TeamMembers readOnly={true} projects={projects} />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      case 'dashboard':
      default:
        return renderDashboardMain();
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-brand-bg text-brand-text flex flex-col transition-colors duration-300">
      
      {/* Navbar header */}
      <StudentNavbar
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
        <StudentSidebar
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
            <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-brand-card border-r border-brand-border p-5 z-50 flex flex-col justify-between shadow-2xl animate-slide-right">
              <div className="space-y-6">
                
                {/* Brand title */}
                <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                  <span className="font-extrabold text-sm text-secondary uppercase tracking-widest">
                    Portal Menu
                  </span>
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-full border border-brand-border text-brand-text-muted hover:text-brand-text focus:outline-none"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Menu lists */}
                <div className="space-y-2.5">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'members', label: 'Team Members' },
                    { id: 'settings', label: 'Settings' },
                    { id: 'profile', label: 'Profile' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileSidebarOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        activeTab === tab.id || (tab.id === 'projects' && activeTab === 'project-details')
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

        {/* MAIN INDEPENDENTLY SCROLLING CONTENT AREA */}
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
                Are you sure you want to log out from the student portal? Any unsaved progress may be lost.
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

    </div>
  );
};

export default StudentDashboard;
