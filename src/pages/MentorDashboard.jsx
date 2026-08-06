import React, { useState } from 'react';
import { FiX, FiArrowRight } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import { api } from '../utils/api';
import MentorNavbar from '../components/MentorNavbar';
import MentorSidebar from '../components/MentorSidebar';
import OverviewCards from '../components/OverviewCards';
import TeamOverviewTable from '../components/TeamOverviewTable';

// Page components
import ActiveTeams from './ActiveTeams';
import TeamDetails from './TeamDetails';
import Reports from './Reports';
import ReportReview from './ReportReview';
import RiskTeams from './RiskTeams';
import RiskTeamDetails from './RiskTeamDetails';
import Settings from './Settings';
import Profile from './Profile';
import NotificationsPage from './NotificationsPage';
import ChatGuru from './ChatGuru';

// Mock datasets
// Clear mock data imports

const MentorDashboard = () => {
  const { navigateTo } = usePage();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dynamically load projects assigned to the current mentor
  const [teams, setTeams] = useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
      
      const storedProj = localStorage.getItem('projects');
      const storedUsers = localStorage.getItem('registeredUsers');
      
      const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const projects = storedProj ? JSON.parse(storedProj) : [];

      const mentorProjects = projects.filter(p => p.mentor && p.mentor.toLowerCase() === loggedInMentorName.toLowerCase());

      return mentorProjects.map((p, idx) => {
        const members = registeredUsers.filter(u => u.team && u.team.toLowerCase() === p.teamName?.toLowerCase());
        const leader = registeredUsers.find(u => u.team && u.team.toLowerCase() === p.teamName?.toLowerCase() && u.role === 'Team Leader');
        
        return {
          id: p.id || `team-${idx}`,
          rank: idx + 1,
          name: p.teamName || `${loggedInMentorName} Team`,
          project: p.name,
          health: p.health || 80,
          mentor: p.mentor,
          status: p.health >= 95 ? 'Excellent' : p.health >= 80 ? 'Very Good' : p.health >= 60 ? 'Good' : 'Poor',
          membersCount: members.length,
          leaderName: leader ? (leader.fullName || leader.name) : 'Not Assigned',
          progress: p.progress || 0,
          domain: p.domain || 'General'
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedRiskTeam, setSelectedRiskTeam] = useState(null);
  const [notifications, setNotifications] = useState([]);

  React.useEffect(() => {
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
          collegeName: 'ProjectPilot University',
          department: u.department || 'Computer Science & Engineering',
          status: 'Active',
          team: u.team || 'Not Assigned'
        }));
        localStorage.setItem('registeredUsers', JSON.stringify(mappedUsers));

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
        
        const mentorProjects = (fetchedProj || []).filter(p => p.mentor && p.mentor.toLowerCase() === loggedInMentorName.toLowerCase());

        const activeTeamsList = mentorProjects.map((p, idx) => {
          const members = mappedUsers.filter(u => u.team && u.team.toLowerCase() === p.teamName?.toLowerCase());
          const leader = mappedUsers.find(u => u.team && u.team.toLowerCase() === p.teamName?.toLowerCase() && u.role === 'Team Leader');
          
          return {
            id: p.id || `team-${idx}`,
            rank: idx + 1,
            name: p.teamName || `${loggedInMentorName} Team`,
            project: p.name,
            health: p.health || 80,
            mentor: p.mentor,
            status: p.health >= 95 ? 'Excellent' : p.health >= 80 ? 'Very Good' : p.health >= 60 ? 'Good' : 'Poor',
            membersCount: members.length,
            leaderName: leader ? (leader.fullName || leader.name) : 'Not Assigned',
            progress: p.progress || 0,
            domain: p.domain || 'General'
          };
        });

        setTeams(activeTeamsList);
      } catch (err) {
        console.error(err);
      }
    };

    handleFocus();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setActiveTab('team-details');
  };

  const handleReviewReport = (report) => {
    setSelectedReport(report);
    setActiveTab('report-review');
  };

  const handleViewRiskDetails = (riskTeam) => {
    setSelectedRiskTeam(riskTeam);
    setActiveTab('risk-team-details');
  };

  const handleUpdateReportStatus = (reportId, projectId, status, feedback) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
      
      const storedProj = localStorage.getItem('projects');
      if (storedProj) {
        const projects = JSON.parse(storedProj);
        let targetTeamName = '';
        let reportWeek = 'Report';
        let isTaskReport = false;
        let taskName = '';

        const updated = projects.map(p => {
          if (p.id === projectId) {
            targetTeamName = p.teamName;
            
            // Check if it is a task report
            const matchingReport = (p.weeklyReports || []).find(r => r.id === reportId);
            if (matchingReport) {
              reportWeek = matchingReport.week || 'Report';
            }

            const weekLower = reportWeek.toLowerCase().trim();
            const isWeeklyPattern = /^week\s+\d+$/i.test(weekLower) || weekLower === 'week';

            const matchingTask = (p.tasks || []).find(t => 
              t.reportDetails && 
              (t.reportDetails.id === reportId || 
               t.reportDetails.fileName === (matchingReport ? matchingReport.fileName : '') ||
               (reportWeek !== 'Report' && t.reportDetails.week === reportWeek))
            );
            if (matchingTask || !isWeeklyPattern) {
              isTaskReport = true;
              if (matchingTask) {
                taskName = matchingTask.name;
              } else {
                const taskByTitle = (p.tasks || []).find(t => 
                  reportWeek.toLowerCase().includes(t.name.toLowerCase()) || 
                  (matchingReport && matchingReport.fileName.toLowerCase().includes(t.name.toLowerCase()))
                );
                taskName = taskByTitle ? taskByTitle.name : (p.tasks && p.tasks[0] ? p.tasks[0].name : '');
              }
            }

            // A. Update the report status
            const updatedReports = (p.weeklyReports || []).map(r => {
              if (r.id === reportId) {
                return {
                  ...r,
                  submissionStatus: status === 'Approved' ? 'Approved' : 'Rejected',
                  feedback: feedback || r.feedback
                };
              }
              return r;
            });

            let updatedTasks = p.tasks || [];
            let updatedMilestones = p.milestones || [];

            // B. If Approved
            if (status === 'Approved') {
              if (isTaskReport) {
                // Task status should be updated as Completed
                 updatedTasks = (p.tasks || []).map(t => {
                   if (t.name === taskName) {
                     return {
                       ...t,
                       status: 'Completed',
                       isReassigned: false,
                       reportSubmitted: true,
                       reportDetails: t.reportDetails ? {
                         ...t.reportDetails,
                         submissionStatus: 'Approved',
                         status: 'Approved'
                       } : null
                     };
                   }
                   return t;
                 });
              } else {
                // Milestone status should be updated as Completed
                const weekLower = reportWeek.toLowerCase();
                let mileIdx = updatedMilestones.findIndex(m => m.name.toLowerCase().includes(weekLower));
                if (mileIdx === -1) {
                  mileIdx = updatedMilestones.findIndex(m => m.status !== 'Completed');
                }
                if (mileIdx !== -1) {
                  updatedMilestones = updatedMilestones.map((m, idx) => idx === mileIdx ? { ...m, progress: 100, status: 'Completed' } : m);
                }
              }
            }
            // C. If Reassigned (Reassigned button clicked for Task Report)
            else if (status === 'Reassigned' && isTaskReport) {
              updatedTasks = (p.tasks || []).map(t => {
                if (t.name === taskName) {
                  return {
                    ...t,
                    status: 'Pending',
                    reportSubmitted: false, // Reset so button appears
                    reportDetails: null, // Clear so they can upload a new one
                    isReassigned: true,
                    reassignFeedback: feedback
                  };
                }
                return t;
              });
            }
            // D. If Rejected (Weekly Report Rejected)
            else if (status === 'Rejected' && !isTaskReport) {
              // Milestone should become Pending
              const weekLower = reportWeek.toLowerCase();
              let mileIdx = updatedMilestones.findIndex(m => m.name.toLowerCase().includes(weekLower));
              if (mileIdx === -1) {
                mileIdx = updatedMilestones.findIndex(m => m.status === 'Completed');
              }
              if (mileIdx !== -1) {
                updatedMilestones = updatedMilestones.map((m, idx) => idx === mileIdx ? { ...m, progress: 40, status: 'Pending' } : m);
              }
            }

            return {
              ...p,
              weeklyReports: updatedReports,
              tasks: updatedTasks,
              milestones: updatedMilestones
            };
          }
          return p;
        });

        localStorage.setItem('projects', JSON.stringify(updated));
        // Sync report review updates back to MongoDB
        updated.forEach(async (p) => {
          try {
            await api.updateProject(p.id, p);
          } catch (err) {
            console.warn('Syncing project report review failed:', err);
          }
        });
        
        setSelectedReport(prev => {
          if (prev && prev.id === reportId) {
            return {
              ...prev,
              status: status === 'Approved' ? 'Reviewed' : 'Rejected',
              feedback: feedback || prev.feedback
            };
          }
          return prev;
        });

        // E. Send Notifications
        if (targetTeamName) {
          const storedUsers = localStorage.getItem('registeredUsers');
          if (storedUsers) {
            const registeredUsers = JSON.parse(storedUsers);
            const teamUsers = registeredUsers.filter(u => u.team && u.team.toLowerCase() === targetTeamName.toLowerCase());
            
            const storedNotifs = localStorage.getItem('notifications');
            const notificationsList = storedNotifs ? JSON.parse(storedNotifs) : [];

            let notifTitle = 'Report Reviewed';
            let notifDesc = '';
            
            if (status === 'Approved') {
              if (isTaskReport) {
                notifTitle = 'Task Report Approved';
                notifDesc = `${loggedInMentorName} approved task "${taskName || reportWeek}" report. Task marked as Completed. Feedback: "${feedback}"`;
              } else {
                notifTitle = 'Weekly Report Approved';
                notifDesc = `${loggedInMentorName} approved weekly report "${reportWeek}". Milestone updated to Completed. Feedback: "${feedback}"`;
              }
            } else if (status === 'Reassigned') {
              notifTitle = 'Task Reassigned';
              notifDesc = `⚠️ ${loggedInMentorName} reassigned task "${taskName || reportWeek}". Status reset to Pending. Reason: "${feedback}"`;
            } else {
              // Rejected Weekly Report
              notifTitle = 'Weekly Report Rejected';
              notifDesc = `❌ ${loggedInMentorName} rejected weekly report "${reportWeek}". Milestone status set to Pending. Reason: "${feedback}"`;
            }

            teamUsers.forEach(user => {
              notificationsList.unshift({
                id: `notif-${Date.now()}-${Math.random()}`,
                title: notifTitle,
                description: notifDesc,
                message: notifDesc,
                time: 'Just now',
                type: status === 'Approved' ? 'success' : status === 'Reassigned' ? 'warning' : 'danger',
                targetEmail: user.email.toLowerCase(),
                targetTeam: targetTeamName.toLowerCase()
              });
            });

            localStorage.setItem('notifications', JSON.stringify(notificationsList));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendRecommendation = (teamId, text) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
      
      const storedProj = localStorage.getItem('projects');
      if (storedProj) {
        const projects = JSON.parse(storedProj);
        let targetTeamName = '';
        const updated = projects.map(p => {
          if (p.id === teamId || (p.teamName && selectedRiskTeam && p.teamName.toLowerCase() === selectedRiskTeam.name.toLowerCase())) {
            targetTeamName = p.teamName;
            return {
              ...p,
              mentorFeedback: text
            };
          }
          return p;
        });
        localStorage.setItem('projects', JSON.stringify(updated));
        // Sync project status / mentor feedback back to MongoDB
        updated.forEach(async (p) => {
          try {
            await api.updateProject(p.id, p);
          } catch (err) {
            console.warn('Syncing project feedback failed:', err);
          }
        });

        // Create notifications for all students/team leaders belonging to this team!
        if (targetTeamName) {
          const storedUsers = localStorage.getItem('registeredUsers');
          if (storedUsers) {
            const registeredUsers = JSON.parse(storedUsers);
            const teamUsers = registeredUsers.filter(u => u.team && u.team.toLowerCase() === targetTeamName.toLowerCase());
            
            const storedNotifs = localStorage.getItem('notifications');
            const notificationsList = storedNotifs ? JSON.parse(storedNotifs) : [];

            teamUsers.forEach(user => {
              notificationsList.unshift({
                id: `notif-${Date.now()}-${Math.random()}`,
                title: 'New Advisor Recommendation',
                description: `${loggedInMentorName} sent feedback: "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`,
                time: 'Just now',
                type: 'warning',
                targetEmail: user.email.toLowerCase()
              });
            });

            localStorage.setItem('notifications', JSON.stringify(notificationsList));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderDashboardMain = () => {
    const mentorTeams = teams;
    
    let loggedInMentorName = 'Dr. Kumar';
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
    } catch (e) {
      console.error(e);
    }
    
    // Overview Metrics
    const stats = {
      assignedTeams: `${mentorTeams.length} ${mentorTeams.length === 1 ? 'Team' : 'Teams'}`,
      pendingReports: `${(() => {
        try {
          const storedProj = localStorage.getItem('projects');
          if (storedProj) {
            const projects = JSON.parse(storedProj);
            const myProjects = projects.filter(p => p.mentor && p.mentor.toLowerCase() === loggedInMentorName.toLowerCase());
            return myProjects.reduce((acc, p) => {
              if (p.weeklyReports) {
                return acc + p.weeklyReports.length;
              }
              return acc;
            }, 0);
          }
        } catch (e) {
          console.error(e);
        }
        return 0;
      })()} Reports`,
      avgHealth: mentorTeams.length > 0 
        ? `${Math.round(mentorTeams.reduce((acc, t) => acc + (t.health || 0), 0) / mentorTeams.length)}%`
        : '0%',
      highRiskTeams: `${mentorTeams.filter(t => t.health < 60 || t.status === 'Poor').length} Teams`
    };

    return (
      <div className="space-y-8 animate-fade-in text-left">
        
        {/* Welcome greeting */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Welcome, Mentor 👋
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Monitor assigned teams, review project reports, identify risks, and guide students throughout their project journey.
          </p>
        </div>

        {/* Stats Row */}
        <OverviewCards stats={stats} />

        {/* Ledger Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/40">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Assigned Teams Ledger
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('active-teams')}
              className="text-xs font-bold text-cyan-500 hover:underline inline-flex items-center gap-1 cursor-pointer focus:outline-none"
            >
              View Active Teams <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <TeamOverviewTable teams={mentorTeams} onViewTeam={handleViewTeam} />
        </div>

      </div>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'active-teams':
        return <ActiveTeams teams={teams} onViewTeam={handleViewTeam} />;
      case 'team-details':
        return <TeamDetails team={selectedTeam} onBack={() => setActiveTab('active-teams')} />;
      case 'reports':
        return <Reports onReviewReport={handleReviewReport} />;
      case 'report-review':
        return (
          <ReportReview 
            report={selectedReport} 
            onBack={() => setActiveTab('reports')} 
            onUpdateReportStatus={handleUpdateReportStatus}
            projects={JSON.parse(localStorage.getItem('projects') || '[]')}
          />
        );
      case 'risk-teams':
        return <RiskTeams onViewRiskDetails={handleViewRiskDetails} />;
      case 'risk-team-details':
        return (
          <RiskTeamDetails 
            team={selectedRiskTeam} 
            onBack={() => setActiveTab('risk-teams')} 
            onSendRecommendation={handleSendRecommendation}
          />
        );
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
      case 'chat-guru':
        return <ChatGuru />;
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
      <MentorNavbar
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
        <MentorSidebar
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
                  <span className="font-extrabold text-sm text-cyan-500 uppercase tracking-widest">
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
                    { id: 'active-teams', label: 'Active Teams' },
                    { id: 'reports', label: 'Reports' },
                    { id: 'risk-teams', label: 'Risk Teams' },
                    { id: 'chat-guru', label: 'Chat Guru' },
                    { id: 'settings', label: 'Settings' },
                    { id: 'profile', label: 'Profile' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileSidebarOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        activeTab === tab.id ||
                        (tab.id === 'active-teams' && activeTab === 'team-details') ||
                        (tab.id === 'reports' && activeTab === 'report-review') ||
                        (tab.id === 'risk-teams' && activeTab === 'risk-team-details')
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/15 text-cyan-500 border-l-4 border-cyan-500'
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
                Are you sure you want to log out from the mentor portal? Any unsaved progress may be lost.
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

export default MentorDashboard;
