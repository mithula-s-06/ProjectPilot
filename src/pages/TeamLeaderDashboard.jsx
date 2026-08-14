import React, { useState, useEffect } from 'react';
import { FiX, FiArrowRight } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import { api, seedHistoricalNotifications, addNotification } from '../utils/api';
import { checkDeadlineReminders } from '../utils/reminders';
import TeamLeaderNavbar from '../components/TeamLeaderNavbar';
import TeamLeaderSidebar from '../components/TeamLeaderSidebar';

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

// Mock Notification list
// Clear mock data imports

const TeamLeaderDashboard = () => {
  const { navigateTo } = usePage();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Set up projects dynamically based on the team the leader leads
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
        }];
      }
    } catch (err) {
      console.error(err);
    }

    return [];
  });

  const [myTeamName, setMyTeamName] = useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      return myUserRecord && myUserRecord.team ? myUserRecord.team : 'Not Assigned';
    } catch {
      return 'Not Assigned';
    }
  });
  const [selectedProject, setSelectedProject] = useState(null);

  const [memberMetrics, setMemberMetrics] = useState([]);

  useEffect(() => {
    async function loadMetrics() {
      const activeTeam = selectedProject ? selectedProject.teamName : myTeamName;
      if (activeTeam && activeTeam !== 'Not Assigned') {
        try {
          const metrics = await api.getMemberMetricsByTeam(activeTeam);
          setMemberMetrics(metrics || []);
        } catch (e) {
          console.warn('Failed to load member metrics:', e);
        }
      }
    }
    loadMetrics();
  }, [selectedProject, myTeamName, projects]);

  const resolvedSelectedProject = React.useMemo(() => {
    if (!selectedProject) return null;
    
    let totalCommits = 0;
    let totalPRs = 0;
    memberMetrics.forEach(m => {
      totalCommits += m.commitsCount || 0;
      totalPRs += m.prsCount || 0;
    });
    
    return {
      ...selectedProject,
      github: {
        ...(selectedProject.github || {}),
        commits: totalCommits,
        prs: totalPRs
      }
    };
  }, [selectedProject, memberMetrics]);

  const [myTeamsList, setMyTeamsList] = useState([]);
  const myProject = selectedProject || projects[0] || null;

  const activeMembers = React.useMemo(() => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (myTeamName && myTeamName !== 'Not Assigned') {
        return registeredUsers.filter(u => u.team === myTeamName);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }, [myTeamName]);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submittingTask, setSubmittingTask] = useState(null);

  const handleSubmitTaskReport = async (projectId, reportData) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

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

    const updatedTasks = (proj.tasks || []).map((t) => {
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

    const cleanReports = (proj.weeklyReports || []).filter(r => 
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
      ...proj,
      tasks: updatedTasks,
      commits: overallCommits,
      prs: overallPRs,
      github: {
        ...(proj.github || {}),
        commits: overallCommits,
        prs: overallPRs
      },
      weeklyReports: [...cleanReports, newReport]
    };

    const targetTask = updatedTasks.find(t => t.name === reportData.taskName);
    const studentName = targetTask ? targetTask.student : '';
    if (studentName) {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const studentUser = registeredUsers.find(u => 
        u.fullName?.toLowerCase().trim() === studentName.toLowerCase().trim() || 
        u.name?.toLowerCase().trim() === studentName.toLowerCase().trim()
      );
      const studentEmail = studentUser ? studentUser.email : '';
      
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
          teamName: proj.teamName,
          commitsCount: memberCommits,
          prsCount: memberPRs
        });
      } catch (metricErr) {
        console.warn('Failed to save individual member metrics:', metricErr);
      }
    }

    try {
      const updated = await api.updateProject(projectId, updatedProj);

      // Send task report uploaded notification to mentor
      try {
        const mentorName = proj.mentor;
        if (mentorName && mentorName !== 'Not Assigned') {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const mentorUser = registeredUsers.find(u => 
            (u.role === 'Mentor' || u.role === 'MENTOR') && 
            (u.fullName?.trim().toLowerCase() === mentorName.trim().toLowerCase() || u.name?.trim().toLowerCase() === mentorName.trim().toLowerCase())
          );
          const mentorEmail = mentorUser ? mentorUser.email : null;
          if (mentorEmail) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const leaderName = currentUser.fullName || currentUser.name || 'Team Leader';
            await addNotification(
              'New Report Uploaded',
              `Team leader "${leaderName}" uploaded a report for task "${reportData.taskName}" under project "${proj.name}".`,
              mentorEmail,
              proj.teamName,
              'info'
            );
          }
        }
      } catch (notifErr) {
        console.warn('Failed to send task report notification to mentor:', notifErr);
      }

      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }
      setActiveTab('project-details');
    } catch (err) {
      console.error('Failed to submit task report on backend:', err);
    }
  };

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
          
          // Student notifications
          const isStudentRule = (
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
          if (isStudentRule) return true;

          // Extra Team Leader notifications
          const isExtraLeaderRule = (
            title.includes('task uploaded') ||
            title.includes('report uploaded') ||
            title.includes('new report') ||
            message.includes('uploaded a report') ||
            title.includes('reminder') ||
            title.includes('near') ||
            message.includes('due date') ||
            message.includes('deadline') ||
            message.includes('days left') ||
            message.includes('prior')
          );
          return isExtraLeaderRule;
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
    const handleFocus = async () => {
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
        const fetchedTeamName = myUserRecord && myUserRecord.team ? myUserRecord.team : 'Not Assigned';
        setMyTeamName(fetchedTeamName);

        // Fetch backend teams to populate teams this Team Leader leads
        let databaseTeams = [];
        try {
          databaseTeams = await api.listTeams() || [];
        } catch (dbErr) {
          console.warn('Failed to list teams inside TeamLeaderDashboard:', dbErr);
        }
        
        const myName = currentUser.fullName || currentUser.name || '';
        const filteredMyTeams = databaseTeams.filter(t => 
          (t.leaderName && myName && t.leaderName.toLowerCase() === myName.toLowerCase()) ||
          (t.name && fetchedTeamName && t.name.toLowerCase() === fetchedTeamName.toLowerCase())
        );
        setMyTeamsList(filteredMyTeams);

        // Sync currentUser local storage team value
        let needsUpdate = false;
        if (currentUser.team !== fetchedTeamName) {
          currentUser.team = fetchedTeamName;
          needsUpdate = true;
        }
        if (myUserRecord) {
          if (currentUser.collegeName !== myUserRecord.collegeName) {
            currentUser.collegeName = myUserRecord.collegeName || '';
            needsUpdate = true;
          }
          if (currentUser.department !== myUserRecord.department) {
            currentUser.department = myUserRecord.department || 'Computer Science & Engineering';
            needsUpdate = true;
          }
        }
        if (needsUpdate) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        // Find all projects belonging to any of the Team Leader's teams
        const myTeamNames = filteredMyTeams.map(t => t.name.toLowerCase());
        const matchingProjects = (fetchedProj || []).filter(p => 
          p.teamName && myTeamNames.includes(p.teamName.toLowerCase())
        );

        if (matchingProjects.length > 0) {
          setProjects(matchingProjects);
        } else if (fetchedTeamName && fetchedTeamName !== 'Not Assigned') {
          // Set default project fallback if team exists but project is not declared yet
          setProjects([{
            id: `proj-${Date.now()}`,
            name: `${fetchedTeamName} Project`,
            domain: 'Development / Research',
            description: `Active project dashboard for ${fetchedTeamName}.`,
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
        } else {
          setProjects([]);
        }

        let liveNotifs = [];
        try {
          liveNotifs = await api.listNotifications() || [];
          localStorage.setItem('notifications', JSON.stringify(liveNotifs));
        } catch (apiErr) {
          console.warn('Failed to fetch notifications from backend inside team leader dashboard:', apiErr);
          const storedNotifs = localStorage.getItem('notifications');
          liveNotifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        }

        if (currentUser.email) {
          const email = currentUser.email.toLowerCase();
          setNotifications(liveNotifs.filter(n => {
            const isTargetEmail = n.targetEmail && n.targetEmail.toLowerCase() === email;
            const isTargetTeam = !n.targetEmail && n.targetTeam && fetchedTeamName && fetchedTeamName.split(',').map(t => t.trim().toLowerCase()).includes(n.targetTeam.toLowerCase().trim());
            const isGeneral = !n.targetEmail && !n.targetTeam;
            
            if (!(isTargetEmail || isTargetTeam || isGeneral)) return false;

            const title = (n.title || '').toLowerCase();
            const message = (n.message || '').toLowerCase();
            
            // Student notifications
            const isStudentRule = (
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
            if (isStudentRule) return true;

            // Extra Team Leader notifications
            const isExtraLeaderRule = (
              title.includes('task uploaded') ||
              title.includes('report uploaded') ||
              title.includes('new report') ||
              message.includes('uploaded a report') ||
              title.includes('reminder') ||
              title.includes('near') ||
              message.includes('due date') ||
              message.includes('deadline') ||
              message.includes('days left') ||
              message.includes('prior')
            );
            return isExtraLeaderRule;
          }));
        }

        // Trigger background deadline reminders check
        if (fetchedProj) {
          checkDeadlineReminders(fetchedProj);
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
        const myName = myUserRecord ? myUserRecord.name : '';
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
              
              // Student notifications
              const isStudentRule = (
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
              if (isStudentRule) return true;

              // Extra Team Leader notifications
              const isExtraLeaderRule = (
                title.includes('task uploaded') ||
                title.includes('report uploaded') ||
                title.includes('new report') ||
                message.includes('uploaded a report') ||
                title.includes('reminder') ||
                title.includes('near') ||
                message.includes('due date') ||
                message.includes('deadline') ||
                message.includes('days left') ||
                message.includes('prior')
              );
              return isExtraLeaderRule;
            }));
          }
        }

        if (e.key === 'projects' && e.newValue) {
          const allProj = JSON.parse(e.newValue);
          
          let databaseTeams = [];
          try {
            databaseTeams = JSON.parse(localStorage.getItem('teams') || '[]');
           } catch {}

          const myTeamNames = databaseTeams.filter(t => 
            (t.leaderName && myName && t.leaderName.toLowerCase() === myName.toLowerCase()) ||
            (t.name && myTeamName && t.name.toLowerCase() === myTeamName.toLowerCase())
          ).map(t => t.name.toLowerCase());

          const matchingProjects = allProj.filter(p => 
            p.teamName && myTeamNames.includes(p.teamName.toLowerCase())
          );
          setProjects(matchingProjects);
        }
      } catch (err) {
        console.error(err);
      }
    };

    handleFocus();
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

  const handleUpdateTasks = async (updatedTasks, targetProjectId) => {
    const pId = targetProjectId || (selectedProject ? selectedProject.id : (projects[0] ? projects[0].id : null));
    if (!pId) return;
    const proj = projects.find(p => p.id === pId);
    if (!proj) return;
    const cleanReports = (proj.weeklyReports || []).filter(r => 
      !updatedTasks.some(t => t.reportDetails && t.reportDetails.id === r.id)
    );
    const activeTaskReports = updatedTasks
      .filter((t) => t.reportSubmitted && t.reportDetails)
      .map((t) => t.reportDetails);

    let overallCommits = 0;
    let overallPRs = 0;
    updatedTasks.forEach(t => {
      if (t.reportDetails) {
        overallCommits += parseInt(t.reportDetails.commitsCount || 0, 10);
        overallPRs += parseInt(t.reportDetails.prsCount || 0, 10);
      }
    });

    const nextP = { 
      ...proj, 
      tasks: updatedTasks,
      commits: overallCommits,
      prs: overallPRs,
      github: {
        ...(proj.github || {}),
        commits: overallCommits,
        prs: overallPRs
      },
      weeklyReports: [...cleanReports, ...activeTaskReports]
    };

    // Calculate individual member commits/PRs for all students in the task list
    const uniqueStudents = [...new Set(updatedTasks.map(t => t.student).filter(Boolean))];
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    for (const studentName of uniqueStudents) {
      const studentUser = registeredUsers.find(u => 
        u.fullName?.toLowerCase().trim() === studentName.toLowerCase().trim() || 
        u.name?.toLowerCase().trim() === studentName.toLowerCase().trim()
      );
      const studentEmail = studentUser ? studentUser.email : '';
      
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
          teamName: proj.teamName,
          commitsCount: memberCommits,
          prsCount: memberPRs
        });
      } catch (metricErr) {
        console.warn('Failed to save individual member metrics for ' + studentName, metricErr);
      }
    }

    try {
      const updated = await api.updateProject(pId, nextP);
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }
    } catch (err) {
      console.error('Failed to sync updated tasks to database:', err);
    }
  };

  const handleUpdateMilestones = async (updatedMilestones, targetProjectId) => {
    const pId = targetProjectId || (selectedProject ? selectedProject.id : (projects[0] ? projects[0].id : null));
    if (!pId) return;
    const proj = projects.find(p => p.id === pId);
    if (!proj) return;
    const nextP = { ...proj, milestones: updatedMilestones };

    try {
      const updated = await api.updateProject(pId, nextP);
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }
    } catch (err) {
      console.error('Failed to sync updated milestones to database:', err);
    }
  };

  const handleCreateProject = async (newProj) => {
    try {
      const created = await api.createProject(newProj);
      setProjects(prev => [created, ...prev]);

      // Automatically register the team in the teams collection!
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      await api.createTeam({
        name: created.teamName,
        projectId: created.id,
        projectName: created.name,
        mentorName: 'Not Assigned',
        health: 100,
        leaderName: currentUser.fullName || currentUser.name,
        membersCount: 1,
        status: 'Good',
        rank: 1
      });

      // Send team creation notification to admin
      try {
        await addNotification(
          'New Team Created',
          `A new team "${created.teamName}" has been created for project "${created.name}".`,
          'admin@pp.edu',
          null,
          'success'
        );
      } catch (notifErr) {
        console.warn('Failed to send admin team creation notification:', notifErr);
      }
    } catch (err) {
      console.error('Failed to create project/team on backend:', err);
    }
  };

  const handleEditProject = async (updatedProj) => {
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

    try {
      const updated = await api.updateProject(updatedProj.id, updatedProj);
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }

      // Sync team record update on backend
      const fetchedTeams = await api.listTeams();
      const matchedTeam = (fetchedTeams || []).find(t => t.projectId === updated.id);
      if (matchedTeam) {
        await api.updateTeam(matchedTeam.id, {
          ...matchedTeam,
          name: updated.teamName,
          projectName: updated.name
        });
      }
    } catch (err) {
      console.error('Failed to update project/team on backend:', err);
    }
  };

  const handleDeleteProject = (projId) => {
    setDeleteConfirm({
      type: 'project',
      message: 'Are you sure you want to delete this project? This will permanently delete the project and all related tasks and milestones.',
      onConfirm: async () => {
        try {
          // 1. Delete project from database
          await api.deleteProject(projId);
          setProjects(prev => prev.filter(p => p.id !== projId));
          if (selectedProject && selectedProject.id === projId) {
            setSelectedProject(null);
            setActiveTab('projects');
          }

          // Clean up project in localStorage
          try {
            const stored = localStorage.getItem('projects');
            if (stored) {
              const allProj = JSON.parse(stored);
              const remainingProj = allProj.filter(p => p.id !== projId);
              localStorage.setItem('projects', JSON.stringify(remainingProj));
            }
          } catch (storageErr) {
            console.warn('Failed to clean up localStorage projects on delete:', storageErr);
          }

          // 2. Delete team from teams collection in database
          try {
            const fetchedTeams = await api.listTeams();
            const matchedTeam = (fetchedTeams || []).find(t => t.projectId === projId);
            if (matchedTeam) {
              await api.deleteTeam(matchedTeam.id);
            }
          } catch (teamErr) {
            console.warn('Failed to clean up team from database:', teamErr);
          }

          // 3. Reset user team profile assignment back to "Not Assigned" in database
          try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIdx = registeredUsers.findIndex(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());

            if (userIdx !== -1) {
              const matchedUser = registeredUsers[userIdx];
              matchedUser.team = 'Not Assigned';
              localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

              currentUser.team = 'Not Assigned';
              localStorage.setItem('currentUser', JSON.stringify(currentUser));

              setMyTeamName('Not Assigned');

              await api.updateUserProfile(matchedUser.id, {
                name: matchedUser.fullName || matchedUser.name,
                email: matchedUser.email,
                role: matchedUser.role === 'Team Leader' ? 'TEAM_LEADER' : matchedUser.role === 'Mentor' ? 'MENTOR' : 'STUDENT',
                department: matchedUser.department || 'Computer Science & Engineering',
                team: 'Not Assigned',
                collegeName: matchedUser.collegeName || ''
              });
            }
          } catch (userErr) {
            console.warn('Failed to reset user profile team on database delete:', userErr);
          }

        } catch (err) {
          console.error('Failed to delete project on backend:', err);
        }
      }
    });
  };

  const handleSubmitWeeklyReport = async (projectId, reportData) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

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

    const nextP = {
      ...proj,
      weeklyReports: [...(proj.weeklyReports || []), newReport]
    };

    try {
      const updated = await api.updateProject(projectId, nextP);

      // Send weekly report uploaded notification to mentor
      try {
        const mentorName = proj.mentor;
        if (mentorName && mentorName !== 'Not Assigned') {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const mentorUser = registeredUsers.find(u => 
            (u.role === 'Mentor' || u.role === 'MENTOR') && 
            (u.fullName?.trim().toLowerCase() === mentorName.trim().toLowerCase() || u.name?.trim().toLowerCase() === mentorName.trim().toLowerCase())
          );
          const mentorEmail = mentorUser ? mentorUser.email : null;
          if (mentorEmail) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const leaderName = currentUser.fullName || currentUser.name || 'Team Leader';
            await addNotification(
              'New Report Uploaded',
              `Team leader "${leaderName}" uploaded a weekly report for "${reportData.weekNumber || 'Week'}" under project "${proj.name}".`,
              mentorEmail,
              proj.teamName,
              'info'
            );
          }
        }
      } catch (notifErr) {
        console.warn('Failed to send weekly report notification to mentor:', notifErr);
      }

      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }
    } catch (err) {
      console.error('Failed to sync submitted weekly report to database:', err);
    }
  };

  const renderDashboardMain = () => {
    // Show only the latest 3 projects
    const latestProjects = projects.slice(0, 3);

    return (
      <div className="space-y-8 animate-fade-in text-left">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
              Welcome 👋
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-muted">
              Manage your team's projects, assign tasks, monitor progress, and lead your team with AI-powered guidance.
            </p>
          </div>

          {/* Team Switcher Dropdown */}
          {myTeamsList.length > 1 && (
            <div className="flex items-center gap-2 p-2 rounded-xl border border-brand-border bg-brand-card shadow-sm self-start sm:self-auto">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">
                Active Team:
              </span>
              <select
                value={myTeamName}
                onChange={async (e) => {
                  const selectedTeam = e.target.value;
                  setMyTeamName(selectedTeam);
                  
                  try {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    currentUser.team = selectedTeam;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                    const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());

                    if (myUserRecord) {
                      myUserRecord.team = selectedTeam;
                      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

                      // Sync team selection to database
                      await api.updateUserProfile(myUserRecord.id, {
                        name: myUserRecord.fullName || myUserRecord.name,
                        email: myUserRecord.email,
                        role: 'TEAM_LEADER',
                        department: myUserRecord.department || 'Computer Science & Engineering',
                        team: selectedTeam,
                        collegeName: myUserRecord.collegeName || ''
                      });
                    }

                    // Reload matching project from database
                    const fetchedProj = await api.listProjects();
                    const matchingProject = (fetchedProj || []).find(p => 
                      p.teamName && p.teamName.toLowerCase() === selectedTeam.toLowerCase()
                    );
                    if (matchingProject) {
                      setProjects([matchingProject]);
                    } else {
                      setProjects([]);
                    }
                  } catch (err) {
                    console.error('Failed to switch team:', err);
                  }
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-border bg-slate-50 dark:bg-slate-900 text-brand-text focus:outline-none cursor-pointer"
              >
                {myTeamsList.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* MY PROJECTS (LATEST 3) */}
        {latestProjects.length > 0 ? (
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
        ) : (
          <div className="p-8 rounded-2xl border border-brand-border bg-brand-card text-center space-y-4">
            <p className="text-sm text-brand-text-muted">You haven't declared any projects for your team yet.</p>
            <button
              onClick={() => setActiveTab('projects')}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover hover:shadow-glow-primary transition-all duration-300"
            >
              Add New Project
            </button>
          </div>
        )}



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
            project={resolvedSelectedProject} 
            onBack={() => setActiveTab('projects')} 
            onNavigateToSubmitReport={(task) => {
              setSubmittingTask(task);
              setActiveTab('submit-report');
            }}
            onNavigateToEditReport={(task) => {
              const freshTask = resolvedSelectedProject?.tasks?.find(t => t.id === task.id) || task;
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
              handleSubmitTaskReport(selectedProject.id, {
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
      case 'members':
        return <TeamMembers projects={projects} />;
      case 'tasks':
        return <Tasks project={myProject} teamName={myTeamName} projects={projects} onUpdateTasks={handleUpdateTasks} />;
      case 'milestones':
        return <Milestones project={myProject} teamName={myTeamName} onUpdateMilestones={handleUpdateMilestones} />;
      case 'reports':
        return (
          <WeeklyReports 
            project={myProject} 
            projects={projects}
            teamName={myTeamName} 
            onSubmitReport={handleSubmitWeeklyReport} 
          />
        );
      case 'performance':
        return <Performance project={myProject} teamName={myProject?.teamName || myTeamName} projects={projects} />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return (
          <NotificationsPage 
            notifications={notifications} 
            onClearAll={handleClearAllNotifications} 
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
            <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-brand-card border-r border-brand-border p-5 z-50 flex flex-col justify-between shadow-2xl animate-slide-right">
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
