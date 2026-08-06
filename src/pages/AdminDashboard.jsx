import React, { useState } from 'react';
import { 
  FiActivity, FiTrendingUp, FiAlertTriangle, FiCpu, 
  FiArrowLeft, FiMail, FiShield, FiAward, FiUser, FiX 
} from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import { api } from '../utils/api';
import AdminNavbar from '../components/AdminNavbar';
import Sidebar from '../components/Sidebar';
import DashboardCards from '../components/DashboardCards';
import TopTeamsTable from '../components/TopTeamsTable';
import AssignMentorModal from '../components/AssignMentorModal';

// Tabs
import Teams from './Teams';
import Users from './Users';
import Settings from './Settings';
import Profile from './Profile';
import TeamDetails from './TeamDetails';
import NotificationsPage from './NotificationsPage';

// Clear mock data imports

const AdminDashboard = () => {
  const { navigateTo } = usePage();

  // Active sub-page tab state ('dashboard', 'teams', 'users', 'settings', 'profile', 'team-details', 'notifications')
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sidebar collapse states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stateful databases to simulate interactions
  const [teams, setTeams] = useState(() => {
    try {
      const storedProj = localStorage.getItem('projects');
      const storedUsers = localStorage.getItem('registeredUsers');
      
      const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const projects = storedProj ? JSON.parse(storedProj) : [];

      const activeTeamsList = [];

      const isUserInTeam = (user, tName) => {
        if (!user || !user.team || !tName) return false;
        return user.team.split(',').map(t => t.trim().toLowerCase()).includes(tName.toLowerCase());
      };

      // 1. Collect teams from projects list
      projects.forEach(p => {
        if (!p.teamName || p.teamName === 'Not Assigned') return;
        const members = registeredUsers.filter(u => isUserInTeam(u, p.teamName));
        const leader = registeredUsers.find(u => isUserInTeam(u, p.teamName) && u.role === 'Team Leader');
        
        activeTeamsList.push({
          id: p.id || `team-${Date.now()}-${Math.random()}`,
          rank: activeTeamsList.length + 1,
          name: p.teamName,
          project: p.name,
          health: p.health || 80,
          mentor: p.mentor || 'Not Assigned',
          status: p.health >= 95 ? 'Excellent' : p.health >= 80 ? 'Very Good' : p.health >= 60 ? 'Good' : 'Poor',
          membersCount: members.length,
          leaderName: leader ? (leader.fullName || leader.name) : 'Not Assigned'
        });
      });

      // 2. Collect teams from registered users who don't have a project yet
      registeredUsers.forEach(u => {
        if (!u.team || u.team === 'Not Assigned') return;
        const userTeams = u.team.split(',').map(t => t.trim());
        userTeams.forEach(tName => {
          if (!tName || tName === 'Not Assigned') return;
          const exists = activeTeamsList.some(t => t.name.toLowerCase() === tName.toLowerCase());
          if (!exists) {
            const members = registeredUsers.filter(user => isUserInTeam(user, tName));
            const leader = registeredUsers.find(user => isUserInTeam(user, tName) && user.role === 'Team Leader');
            
            activeTeamsList.push({
              id: `team-${Date.now()}-${Math.random()}`,
              rank: activeTeamsList.length + 1,
              name: tName,
              project: 'No Project Declared Yet',
              health: 70,
              mentor: 'Not Assigned',
              status: 'Good',
              membersCount: members.length,
              leaderName: leader ? (leader.fullName || leader.name) : 'Not Assigned'
            });
          }
        });
      });

      // Sort by health desc for ranking
      activeTeamsList.sort((a, b) => b.health - a.health);
      // Re-assign ranks
      activeTeamsList.forEach((t, i) => {
        t.rank = i + 1;
      });

      return activeTeamsList;
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [mentors, setMentors] = useState(() => {
    try {
      const stored = localStorage.getItem('registeredUsers');
      const baseMentors = [];
      if (stored) {
        const registeredUsers = JSON.parse(stored);
        const signedUpMentors = registeredUsers.filter(u => u.role === 'Mentor');
        
        signedUpMentors.forEach(m => {
          const name = m.fullName || m.name;
          const exists = baseMentors.some(bm => bm.name.toLowerCase() === name.toLowerCase());
          if (!exists) {
            baseMentors.push({
              id: m.id || `mentor-${Date.now()}-${Math.random()}`,
              name: name,
              department: m.department || 'Computer Science & Engineering',
              currentTeamsAssigned: 0,
              avatarColor: m.avatarBg || 'bg-cyan-500 text-white',
              avatarInitials: (m.fullName || m.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            });
          }
        });
      }
      return baseMentors;
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('registeredUsers');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map(u => ({
          id: u.id || `usr-${Date.now()}-${Math.random()}`,
          name: u.fullName || u.name,
          email: u.email,
          role: u.role === 'Student' ? 'Student' : u.role === 'Team Leader' ? 'Team Leader' : u.role === 'Mentor' ? 'Mentor' : u.role,
          team: u.team || 'Not Assigned',
          status: u.status || 'Active',
          avatarInitials: u.avatarInitials || (u.fullName || u.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          avatarBg: u.avatarBg || 'bg-primary/20 text-primary'
        }));
      }
    } catch (err) {
      console.error(err);
    }
     return [];
  });
  const [notifications, setNotifications] = useState([]);

  // Selected team state for Assign Mentor Modal (null if modal closed)
  const [assigningTeam, setAssigningTeam] = useState(null);
  
  // Selected team for details view
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Selected user for details view
  const [selectedUser, setSelectedUser] = useState(null);

  // Neat in-page toast notification state
  const [toast, setToast] = useState(null);

  // Logout confirmation modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  React.useEffect(() => {
    const handleFocus = async () => {
      try {
        let mappedUsers = [];
        try {
          const fetchedUsers = await api.listUsers();
          mappedUsers = (fetchedUsers || []).map(u => ({
            id: u.id,
            fullName: u.name,
            email: u.email,
            role: u.role === 'TEAM_LEADER' ? 'Team Leader' : u.role === 'MENTOR' ? 'Mentor' : 'Student',
            collegeName: 'ProjectPilot University',
            department: u.department || 'Computer Science & Engineering',
            status: 'Active',
            team: u.team || 'Not Assigned'
          }));
          localStorage.setItem('registeredUsers', JSON.stringify(mappedUsers));
        } catch (e) {
          console.warn('Background users fetch failed:', e);
          const storedUsers = localStorage.getItem('registeredUsers');
          mappedUsers = storedUsers ? JSON.parse(storedUsers) : [];
        }

        let projects = [];
        try {
          const fetchedProj = await api.listProjects();
          projects = fetchedProj || [];
          localStorage.setItem('projects', JSON.stringify(projects));
        } catch (e) {
          console.warn('Background projects fetch failed:', e);
          const storedProj = localStorage.getItem('projects');
          projects = storedProj ? JSON.parse(storedProj) : [];
        }

        setUsers(mappedUsers.map(u => ({
          id: u.id || `usr-${Date.now()}-${Math.random()}`,
          name: u.fullName || u.name,
          email: u.email,
          role: u.role,
          team: u.team || 'Not Assigned',
          status: u.status || 'Active',
          avatarInitials: (u.fullName || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          avatarBg: 'bg-primary/20 text-primary'
        })));

        let databaseTeams = [];
        try {
          databaseTeams = await api.listTeams() || [];
        } catch (dbErr) {
          console.warn('Failed to fetch teams list from backend:', dbErr);
        }

        setTeams(() => {
          const activeTeamsList = [];
          const isUserInTeam = (user, tName) => {
            if (!user || !user.team || !tName) return false;
            return user.team.split(',').map(t => t.trim().toLowerCase()).includes(tName.toLowerCase());
          };

          projects.forEach(p => {
            if (!p.teamName || p.teamName === 'Not Assigned') return;
            const members = mappedUsers.filter(u => isUserInTeam(u, p.teamName));
            const leader = mappedUsers.find(u => isUserInTeam(u, p.teamName) && u.role === 'Team Leader');
            const matchedDbTeam = databaseTeams.find(dt => dt.name && dt.name.toLowerCase() === p.teamName.toLowerCase());
            const dbLeader = matchedDbTeam ? matchedDbTeam.leaderName : null;

            const leaderIsMatched = members.some(m => m.role === 'Team Leader');
            const leaderExists = leader || (dbLeader && dbLeader !== 'Not Assigned');
            const calculatedMembersCount = members.length + (leaderExists && !leaderIsMatched ? 1 : 0);

            activeTeamsList.push({
              id: p.id || `team-${Date.now()}-${Math.random()}`,
              rank: activeTeamsList.length + 1,
              name: p.teamName,
              project: p.name,
              health: p.health || 80,
              mentor: p.mentor || 'Not Assigned',
              status: p.health >= 95 ? 'Excellent' : p.health >= 80 ? 'Very Good' : p.health >= 60 ? 'Good' : 'Poor',
              membersCount: calculatedMembersCount,
              leaderName: leader ? (leader.fullName || leader.name) : (dbLeader && dbLeader !== 'Not Assigned' ? dbLeader : 'Not Assigned')
            });
          });

          mappedUsers.forEach(u => {
            if (!u.team || u.team === 'Not Assigned') return;
            const userTeams = u.team.split(',').map(t => t.trim());
            userTeams.forEach(tName => {
              if (!tName || tName === 'Not Assigned') return;
              const exists = activeTeamsList.some(t => t.name.toLowerCase() === tName.toLowerCase());
              if (!exists) {
                const members = mappedUsers.filter(user => isUserInTeam(user, tName));
                const leader = mappedUsers.find(user => isUserInTeam(user, tName) && user.role === 'Team Leader');
                const matchedDbTeam = databaseTeams.find(dt => dt.name && dt.name.toLowerCase() === tName.toLowerCase());
                const dbLeader = matchedDbTeam ? matchedDbTeam.leaderName : null;

                const leaderIsMatched = members.some(m => m.role === 'Team Leader');
                const leaderExists = leader || (dbLeader && dbLeader !== 'Not Assigned');
                const calculatedMembersCount = members.length + (leaderExists && !leaderIsMatched ? 1 : 0);

                activeTeamsList.push({
                  id: `team-${Date.now()}-${Math.random()}`,
                  rank: activeTeamsList.length + 1,
                  name: tName,
                  project: 'No Project Declared Yet',
                  health: 70,
                  mentor: 'Not Assigned',
                  status: 'Good',
                  membersCount: calculatedMembersCount,
                  leaderName: leader ? (leader.fullName || leader.name) : (dbLeader && dbLeader !== 'Not Assigned' ? dbLeader : 'Not Assigned')
                });
              }
            });
          });

          activeTeamsList.sort((a, b) => b.health - a.health);
          activeTeamsList.forEach((t, i) => { t.rank = i + 1; });
          return activeTeamsList;
        });

        const signedUpMentors = mappedUsers.filter(u => u.role === 'Mentor');
        const nextMentors = signedUpMentors.map(m => ({
          id: m.id || `mentor-${Date.now()}-${Math.random()}`,
          name: m.fullName || m.name,
          department: m.department || 'Computer Science & Engineering',
          currentTeamsAssigned: 0,
          avatarColor: m.avatarBg || 'bg-cyan-500 text-white',
          avatarInitials: (m.fullName || '?').split(' ').map(n => m.name ? n[0] : '?').join('').toUpperCase().slice(0, 2)
        }));
        setMentors(nextMentors);

      } catch (err) {
        console.error(err);
      }
    };

    handleFocus();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Callback to perform mentor assignment
  const handleAssignMentor = async (mentorName) => {
    if (!assigningTeam) return;

    // Update the team with the mentor and status
    const updatedTeam = { 
      ...assigningTeam, 
      mentor: mentorName,
      status: assigningTeam.health >= 95 ? 'Excellent' : assigningTeam.health >= 80 ? 'Very Good' : 'Good' 
    };

    try {
      // 1. Sync updated team to backend database
      await api.updateTeam(assigningTeam.id, {
        id: updatedTeam.id,
        name: updatedTeam.name,
        projectId: updatedTeam.projectId,
        projectName: updatedTeam.projectName,
        mentorName: mentorName,
        health: updatedTeam.health,
        leaderName: updatedTeam.leaderName,
        membersCount: updatedTeam.membersCount,
        status: updatedTeam.status,
        rank: updatedTeam.rank
      });

      // Update state
      setTeams(prev => prev.map(t => t.id === assigningTeam.id ? updatedTeam : t));

      // 2. Find and update the associated project on the backend
      const storedProj = localStorage.getItem('projects');
      if (storedProj) {
        const allProj = JSON.parse(storedProj);
        const updatedProj = allProj.map(p => {
          const tName = (assigningTeam.name || '').trim().toLowerCase();
          const pTeamName = (p.teamName || '').trim().toLowerCase();
          
          if ((pTeamName && pTeamName === tName) || 
              (p.name && p.name.toLowerCase().includes(tName)) ||
              (assigningTeam.name === 'Team Alpha' && (p.name.includes('Attendance') || p.name.includes('Alpha'))) ||
              (assigningTeam.name === 'Team Beta' && (p.name.includes('Health') || p.name.includes('Beta'))) ||
              (assigningTeam.name === 'Team Gamma' && (p.name.includes('Plagiarism') || p.name.includes('Gamma'))) ||
              (assigningTeam.name === 'Team Delta' && (p.name.includes('Irrigation') || p.name.includes('Delta'))) ||
              (assigningTeam.name === 'Team Omega' && (p.name.includes('Voting') || p.name.includes('Blockchain') || p.name.includes('Omega')))) {
            return { ...p, mentor: mentorName };
          }
          return p;
        });

        localStorage.setItem('projects', JSON.stringify(updatedProj));
        
        // Save the updated projects to database
        for (const p of updatedProj) {
          const tName = (assigningTeam.name || '').trim().toLowerCase();
          const pTeamName = (p.teamName || '').trim().toLowerCase();
          if ((pTeamName && pTeamName === tName) || 
              (p.name && p.name.toLowerCase().includes(tName)) ||
              (assigningTeam.name === 'Team Alpha' && (p.name.includes('Attendance') || p.name.includes('Alpha'))) ||
              (assigningTeam.name === 'Team Beta' && (p.name.includes('Health') || p.name.includes('Beta'))) ||
              (assigningTeam.name === 'Team Gamma' && (p.name.includes('Plagiarism') || p.name.includes('Gamma'))) ||
              (assigningTeam.name === 'Team Delta' && (p.name.includes('Irrigation') || p.name.includes('Delta'))) ||
              (assigningTeam.name === 'Team Omega' && (p.name.includes('Voting') || p.name.includes('Blockchain') || p.name.includes('Omega')))) {
            await api.updateProject(p.id, p);
          }
        }
      }

      // Increment mentor workload
      const updatedMentors = mentors.map((mentor) => {
        if (mentor.name === mentorName) {
          return { ...mentor, currentTeamsAssigned: mentor.currentTeamsAssigned + 1 };
        }
        return mentor;
      });
      setMentors(updatedMentors);

      // Prepend a new notification
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: 'Mentor Allocated',
        message: `${mentorName} was successfully assigned to ${assigningTeam.name}.`,
        time: 'Just now',
      };
      setNotifications([newNotif, ...notifications]);

      // Show neat in-page toast notification
      setToast({
        message: `${mentorName} was successfully assigned to ${assigningTeam.name}.`,
        type: 'success'
      });
      setTimeout(() => {
        setToast(prev => (prev && prev.message.includes(mentorName) ? null : prev));
      }, 4000);

    } catch (err) {
      console.error('Failed to assign mentor:', err);
      setToast({ message: 'Failed to assign mentor on backend.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      // Close Modal
      setAssigningTeam(null);
    }
  };

  // Delete team callback
  const handleDeleteTeam = (teamId) => {
    const teamToDelete = teams.find(t => t.id === teamId);
    const teamName = teamToDelete ? teamToDelete.name : `ID ${teamId}`;
    setDeleteConfirm({ id: teamId, type: 'team', name: teamName });
  };

  const executeDeleteTeam = (teamId) => {
    const teamToDelete = teams.find(t => t.id === teamId);
    const teamName = teamToDelete ? teamToDelete.name : `ID ${teamId}`;

    setTeams((prev) => prev.filter((team) => team.id !== teamId));
    
    // Add deletion alert to notifications log
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'danger',
      title: 'Team Registration Removed',
      message: `Team "${teamName}" has been successfully deleted from the platform databases.`,
      time: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Show neat in-page toast notification
    setToast({
      message: `Team "${teamName}" was successfully deleted.`,
      type: 'danger'
    });
    setTimeout(() => {
      setToast(prev => (prev && prev.message.includes(teamName) ? null : prev));
    }, 4000);
  };

  // Delete user callback
  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    const userName = userToDelete ? userToDelete.name : `ID ${userId}`;
    setDeleteConfirm({ id: userId, type: 'user', name: userName });
  };

  const executeDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    const userName = userToDelete ? userToDelete.name : `ID ${userId}`;

    setUsers((prev) => prev.filter((user) => user.id !== userId));

    // Update registeredUsers database in localStorage
    try {
      const stored = localStorage.getItem('registeredUsers');
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter(u => u.id !== userId && u.email !== userToDelete?.email);
        localStorage.setItem('registeredUsers', JSON.stringify(filtered));
        // Sync deletion to MongoDB backend
        try {
          await api.deleteUserProfile(userId);
        } catch (err) {
          console.warn('Deleting user profile in backend failed:', err);
        }
      }
    } catch (err) {
      console.error(err);
    }
    
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'danger',
      title: 'User Account Removed',
      message: `Account for "${userName}" has been permanently deleted from platform directories.`,
      time: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Show neat in-page toast notification
    setToast({
      message: `User "${userName}" was successfully deleted.`,
      type: 'danger'
    });
    setTimeout(() => {
      setToast(prev => (prev && prev.message.includes(userName) ? null : prev));
    }, 4000);
  };

  // View details callback
  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setActiveTab('team-details');
  };

  // View user profile callback
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setActiveTab('user-details');
  };

  // Render the Main Dashboard tab landing page
  const renderDashboardMain = () => {
    // Calculate stats
    const teamsCount = teams.length;
    const usersCount = users.length;
    const mentorsCount = mentors.length;

    return (
      <div className="space-y-8 animate-fade-in text-left">
        
        {/* Welcome Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Welcome, Administrator 👋
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Manage teams, users, mentors, and monitor overall platform performance.
          </p>
        </div>

        {/* 4 Stats Cards */}
        <DashboardCards 
          teamsCount={teamsCount} 
          usersCount={usersCount} 
          mentorsCount={mentorsCount} 
        />

        {/* Top Performing Table */}
        <div className="w-full">
          <TopTeamsTable teams={teams} />
        </div>

      </div>
    );
  };

  // Swaps content main tab panels
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'teams':
        return (
          <Teams 
            teams={teams} 
            onOpenAssignModal={(team) => setAssigningTeam(team)} 
            onViewTeam={handleViewTeam}
            onDeleteTeam={handleDeleteTeam}
          />
        );
      case 'team-details':
        return <TeamDetails team={selectedTeam} onBack={() => setActiveTab('teams')} />;
      case 'notifications':
        return (
          <NotificationsPage 
            notifications={notifications} 
            onClearAll={() => setNotifications([])} 
            onBack={() => setActiveTab('dashboard')} 
          />
        );
      case 'users':
        return <Users users={users} onViewUser={handleViewUser} onDeleteUser={handleDeleteUser} />;
      case 'user-details':
        return (
          <div className="space-y-6 w-full text-left max-w-2xl animate-scale-up">
            {/* Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="p-2 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer"
                title="Go Back"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
                  User Credentials Account
                </h2>
                <p className="text-xs sm:text-sm text-brand-text-muted">
                  Administrator system check of user account registration logs.
                </p>
              </div>
            </div>

            {/* Card Details */}
            <div className="p-6 sm:p-8 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl pointer-events-none rounded-full" />
              
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center font-bold text-3xl select-none ${selectedUser?.avatarBg || 'bg-primary/5 text-primary border-primary/20'}`}>
                {selectedUser?.avatarInitials || selectedUser?.name?.charAt(0)}
              </div>

              {/* Details */}
              <div className="flex-grow space-y-6 text-center md:text-left w-full">
                <div>
                  <h3 className="text-xl font-extrabold text-brand-text mb-1 tracking-tight">
                    {selectedUser?.name}
                  </h3>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest block">
                    {selectedUser?.role}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-left flex items-center gap-3">
                    <FiMail className="w-5 h-5 text-secondary flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                        Email Address
                      </span>
                      <span className="text-sm font-semibold text-brand-text break-all">
                        {selectedUser?.email}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-left flex items-center gap-3">
                    <FiShield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                        Account Status
                      </span>
                      <span className="text-sm font-bold text-emerald-500">
                        {selectedUser?.status}
                      </span>
                    </div>
                  </div>

                  {selectedUser?.team && (
                    <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-left flex items-center gap-3 sm:col-span-2">
                      <FiAward className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                          Team Membership
                        </span>
                        <span className="text-sm font-semibold text-brand-text">
                          {selectedUser?.team}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-center md:justify-start">
                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Back to Directory</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
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
      
      {/* 1. Header Navigation */}
      <AdminNavbar
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

      {/* 2. Content Layout split wrapper */}
      <div className="flex flex-grow relative w-full overflow-hidden">
        
        {/* DESKTOP STICKY SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
        />

        {/* MOBILE OVERLAY DRAWER SIDEBAR */}
        {mobileSidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300"
            />
            {/* Sliding Drawer */}
            <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-brand-card border-r border-brand-border p-5 z-50 flex flex-col justify-between shadow-2xl animate-slide-right">
              <div className="space-y-6">
                
                {/* Brand title & Close */}
                <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                  <span className="font-extrabold text-sm text-primary uppercase tracking-widest">
                    Pilot Menu
                  </span>
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-full border border-brand-border text-brand-text-muted hover:text-brand-text"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Menu items */}
                <div className="space-y-2.5">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'teams', label: 'Teams' },
                    { id: 'users', label: 'Users' },
                    { id: 'settings', label: 'Settings' },
                    { id: 'profile', label: 'Profile' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileSidebarOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary/20 to-secondary/15 text-primary border-l-4 border-primary'
                          : 'text-brand-text-muted hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Logout Area */}
              <button
                onClick={() => { handleLogout(); setMobileSidebarOpen(false); }}
                className="w-full text-center py-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-sm transition-all duration-300 cursor-pointer"
              >
                Logout
              </button>
            </aside>
          </>
        )}

        {/* 3. MAIN INDEPENDENT CONTENT AREA */}
        <main className="flex-grow p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full h-[calc(100vh-76px)] overflow-y-auto flex flex-col justify-between">
          <div className="w-full flex-grow">
            {renderActiveTabContent()}
          </div>
          {/* Footer */}
          <footer className="w-full py-4 text-center text-xs text-brand-text-muted/60 border-t border-brand-border/40 select-none mt-8">
            © {new Date().getFullYear()} ProjectPilot. All rights reserved.
          </footer>
        </main>
      </div>

      {/* Assign Mentor Modal Overlay */}
      {assigningTeam && (
        <AssignMentorModal
          isOpen={true}
          teamName={assigningTeam.name}
          currentMentorName={assigningTeam.mentor}
          mentors={mentors.map(m => ({
            ...m,
            currentTeamsAssigned: teams.filter(t => t.mentor && t.mentor.toLowerCase() === m.name.toLowerCase()).length
          }))}
          onClose={() => setAssigningTeam(null)}
          onAssign={handleAssignMentor}
        />
      )}

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
                Are you sure you want to log out of the administrator portal? Any unsaved changes may be lost.
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

      {/* Delete Confirmation Modal Box */}
      {deleteConfirm && (
        <>
          <div 
            onClick={() => setDeleteConfirm(null)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] transition-opacity duration-300 animate-fade-in" 
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[400px] rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 z-[10000] text-center animate-scale-up">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Confirm Deletion
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Do you want to delete this {deleteConfirm.type}?
                <span className="block font-bold text-slate-700 mt-1">"{deleteConfirm.name}"</span>
              </p>
              <div className="flex items-center gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { id, type } = deleteConfirm;
                    setDeleteConfirm(null);
                    if (type === 'team') {
                      executeDeleteTeam(id);
                    } else {
                      executeDeleteUser(id);
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white hover:brightness-110 font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification Box with neat CSS */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-slide-up">
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl transition-all duration-300 max-w-sm bg-white ${
            toast.type === 'success' 
              ? 'border-emerald-200 text-emerald-600'
              : toast.type === 'danger' 
              ? 'border-rose-200 text-rose-600'
              : 'border-blue-200 text-blue-600'
          }`}>
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-50' : toast.type === 'danger' ? 'bg-rose-50' : 'bg-blue-50'
            }`}>
              {toast.type === 'success' ? (
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : toast.type === 'danger' ? (
                <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="text-xs font-bold leading-tight flex-grow pr-2 text-slate-800">
              {toast.message}
            </div>
            <button 
              onClick={() => setToast(null)}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
