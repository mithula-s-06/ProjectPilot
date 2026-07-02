import React, { useState, useEffect } from 'react';
import { FiX, FiArrowRight } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
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
import ChatGuru from './ChatGuru';

// Mock datasets
import { studentProjects, studentNotifications } from '../utils/mockData';

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
        const sourceProjects = stored ? JSON.parse(stored) : studentProjects;
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
          mentor: 'Dr. Kumar',
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
    return studentProjects;
  });

  const [selectedProject, setSelectedProject] = useState(null);
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
        const seeded = studentNotifications.map(n => ({ 
          ...n, 
          targetEmail: email,
          targetTeam: myTeamName ? myTeamName.toLowerCase() : ''
        }));
        localStorage.setItem('notifications', JSON.stringify(seeded));
        return seeded;
      }
    } catch (e) {
      console.error(e);
      return studentNotifications;
    }
  });
  const [submittingTask, setSubmittingTask] = useState(null);

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
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      
      if (myUserRecord && myUserRecord.team && myUserRecord.team !== 'Not Assigned') {
        if (currentUser.team !== myUserRecord.team) {
          currentUser.team = myUserRecord.team;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        const stored = localStorage.getItem('projects');
        const sourceProjects = stored ? JSON.parse(stored) : studentProjects;
        const matchingProject = sourceProjects.find(p => 
          (p.teamName && p.teamName.toLowerCase() === myUserRecord.team.toLowerCase() && p.name !== `${myUserRecord.team} Project`)
        ) || sourceProjects.find(p => 
          (p.teamName && p.teamName.toLowerCase() === myUserRecord.team.toLowerCase()) ||
          (myUserRecord.team === 'Team Alpha' && (p.name.includes('Attendance') || p.name.includes('Alpha'))) ||
          (myUserRecord.team === 'Team Beta' && (p.name.includes('Health') || p.name.includes('Beta'))) ||
          (myUserRecord.team === 'Team Gamma' && (p.name.includes('Plagiarism') || p.name.includes('Gamma'))) ||
          (myUserRecord.team === 'Team Delta' && (p.name.includes('Irrigation') || p.name.includes('Delta'))) ||
          (myUserRecord.team === 'Team Omega' && (p.name.includes('Voting') || p.name.includes('Blockchain') || p.name.includes('Omega'))) ||
          (p.name && p.name.toLowerCase().includes(myUserRecord.team.toLowerCase()))
        );
        if (matchingProject) {
          setProjects([matchingProject]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  useEffect(() => {
    if (projects && projects.length > 0) {
      try {
        const stored = localStorage.getItem('projects');
        if (stored) {
          const allProj = JSON.parse(stored);
          const nextProj = allProj.map(p => {
            const match = projects.find(up => up.id === p.id);
            return match ? match : p;
          });
          projects.forEach(up => {
            if (!allProj.some(p => p.id === up.id)) {
              nextProj.push(up);
            }
          });
          localStorage.setItem('projects', JSON.stringify(nextProj));
        } else {
          localStorage.setItem('projects', JSON.stringify(projects));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [projects]);

  useEffect(() => {
    if (selectedProject) {
      const freshProj = projects.find(p => p.id === selectedProject.id);
      if (freshProj) {
        if (JSON.stringify(freshProj) !== JSON.stringify(selectedProject)) {
          setSelectedProject(freshProj);
        }
      }
    }
  }, [projects]);

  useEffect(() => {
    const handleFocus = () => {
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
        
        const storedNotifs = localStorage.getItem('notifications');
        if (storedNotifs && currentUser.email) {
          const parsed = JSON.parse(storedNotifs);
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
          const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';

          setNotifications(parsed.filter(n => 
            !n.targetEmail || 
            n.targetEmail.toLowerCase() === currentUser.email.toLowerCase() ||
            (n.targetTeam && myTeamName && n.targetTeam.toLowerCase() === myTeamName.toLowerCase())
          ));
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

  const handleSubmitReport = (projectId, reportData) => {
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

  const handleUpdateTaskReports = (projectId, updatedTasks) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: updatedTasks
          };
        }
        return p;
      })
    );

    setSelectedProject((prev) => {
      if (prev && prev.id === projectId) {
        return {
          ...prev,
          tasks: updatedTasks
        };
      }
      return prev;
    });
  };

  // Render main dashboard tab panel
  const renderDashboardMain = () => {
    // Show only the latest 3 assigned projects!
    const latestProjects = projects.slice(0, 3);

    return (
      <div className="space-y-8 animate-fade-in text-left">
        
        {/* Welcome Banner */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Welcome 👋
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Continue your project journey with AI-powered guidance.
          </p>
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
            onUpdateTasks={(updatedTasks) => handleUpdateTaskReports(selectedProject.id, updatedTasks)}
          />
        );
      case 'submit-report':
        return (
          <SubmitReport 
            task={submittingTask}
            onBack={() => setActiveTab('project-details')}
            onSubmit={(reportData) => {
              handleSubmitReport(selectedProject.id, {
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
              const updatedTasks = selectedProject.tasks.map(t => {
                if (t.id === submittingTask.id) {
                  return {
                    ...t,
                    reportDetails: {
                      ...t.reportDetails,
                      week: reportData.title,
                      remarks: reportData.description,
                      fileName: reportData.fileName || t.reportDetails.fileName,
                      fileSize: reportData.fileSize || t.reportDetails.fileSize,
                      submittedDate: new Date().toISOString().split('T')[0]
                    }
                  };
                }
                return t;
              });
              handleUpdateTaskReports(selectedProject.id, updatedTasks);
              setActiveTab('project-details');
            }}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage 
            notifications={notifications} 
            onClearAll={() => setNotifications([])} 
            onBack={() => setActiveTab('dashboard')} 
          />
        );
      case 'members':
        return <TeamMembers readOnly={true} projects={projects} />;
      case 'chat-guru':
        return <ChatGuru />;
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
            <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-brand-card/95 border-r border-brand-border p-5 z-50 flex flex-col justify-between shadow-2xl animate-slide-right">
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
                    { id: 'chat-guru', label: 'Chat Guru' },
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
