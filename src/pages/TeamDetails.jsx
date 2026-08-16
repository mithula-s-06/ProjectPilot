import React from 'react';
import { FiArrowLeft, FiActivity, FiGithub, FiCalendar, FiCheckSquare, FiLayers, FiFileText, FiLink } from 'react-icons/fi';
import { api } from '../utils/api';
import HealthScoreCard from '../components/HealthScoreCard';

const TeamDetails = ({ team, onBack, onUpdateTeamHealth }) => {
  const [memberMetrics, setMemberMetrics] = React.useState([]);

  const currentUser = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const isMentor = currentUser?.role === 'Mentor';

  React.useEffect(() => {
    async function loadMetrics() {
      if (team && team.name) {
        try {
          const metrics = await api.getMemberMetricsByTeam(team.name);
          setMemberMetrics(metrics || []);
        } catch (e) {
          console.warn('Failed to load member metrics:', e);
        }
      }
    }
    loadMetrics();
  }, [team]);

  // Find active project from localStorage matching team name
  const activeProject = React.useMemo(() => {
    if (!team) return null;
    try {
      const storedProj = localStorage.getItem('projects');
      if (storedProj) {
        const projects = JSON.parse(storedProj);
        return projects.find(p => p.teamName && p.teamName.toLowerCase() === team.name.toLowerCase());
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [team]);

  const projectHealth = activeProject ? activeProject.health : (team.health || 100);
  const projectHealthDetails = activeProject ? activeProject.healthDetails : { scores: [team.health || 100], months: ['Jun'] };

  const handleUpdateHealth = async (newHealth) => {
    try {
      if (activeProject) {
        const updatedProj = {
          ...activeProject,
          health: newHealth
        };
        
        if (updatedProj.healthDetails) {
          const scores = [...(updatedProj.healthDetails.scores || [])];
          if (scores.length > 0) {
            scores[scores.length - 1] = newHealth;
          } else {
            scores.push(newHealth);
          }
          updatedProj.healthDetails = {
            ...updatedProj.healthDetails,
            scores: scores
          };
        }

        await api.updateProject(activeProject.id, updatedProj);
        
        const stored = localStorage.getItem('projects');
        if (stored) {
          const allProj = JSON.parse(stored);
          const nextAllProj = allProj.map(p => p.id === activeProject.id ? updatedProj : p);
          localStorage.setItem('projects', JSON.stringify(nextAllProj));
          window.dispatchEvent(new Event('storage'));
        }
      }
      
      const fetchedTeams = await api.listTeams() || [];
      const dbTeam = fetchedTeams.find(t => t.name && t.name.toLowerCase() === team.name.toLowerCase());
      if (dbTeam) {
        const updatedTeam = {
          ...dbTeam,
          health: newHealth
        };
        
        await api.updateTeam(dbTeam.id, updatedTeam);
        
        const storedTeams = localStorage.getItem('databaseTeams');
        if (storedTeams) {
          const allTeams = JSON.parse(storedTeams);
          const nextAllTeams = allTeams.map(t => t.id === dbTeam.id ? updatedTeam : t);
          localStorage.setItem('databaseTeams', JSON.stringify(nextAllTeams));
        }
      }
      
      // Trigger parent callback to update layout states instantly
      if (onUpdateTeamHealth && dbTeam) {
        onUpdateTeamHealth(team.id, newHealth);
      }
    } catch (err) {
      console.error('Failed to update team/project health score:', err);
    }
  };

  const dynamicRoster = React.useMemo(() => {
    if (!team) return { leaderName: 'Not Assigned', memberNames: [] };
    try {
      const storedUsers = localStorage.getItem('registeredUsers');
      if (storedUsers) {
        const registeredUsers = JSON.parse(storedUsers);
        
        const isUserInTeam = (user, tName) => {
          if (!user || !user.team || !tName) return false;
          return user.team.split(',').map(t => t.trim().toLowerCase()).includes(tName.toLowerCase());
        };

        const teamUsers = registeredUsers.filter(u => isUserInTeam(u, team.name));
        
        const leaderRecord = teamUsers.find(u => u.role === 'Team Leader');
        const leaderName = leaderRecord ? (leaderRecord.fullName || leaderRecord.name) : (team.leaderName && team.leaderName !== 'Not Assigned' ? team.leaderName : 'Not Assigned');
        
        const memberRecords = teamUsers.filter(u => u.role !== 'Team Leader');
        const memberNames = memberRecords.map(u => u.fullName || u.name);
          
        return { leaderName, memberNames };
      }
    } catch (e) {
      console.error(e);
    }
    return { 
      leaderName: team.leaderName || 'Not Assigned', 
      memberNames: [] 
    };
  }, [team]);

  if (!team) return null;

  const leader = dynamicRoster.leaderName;
  const members = dynamicRoster.memberNames;

  const progress = activeProject ? activeProject.progress : (team.progress || 82);

  const milestones = activeProject && activeProject.milestones ? activeProject.milestones : (team.milestones || [
    { name: 'Requirement Analysis', dueDate: '2026-06-05', status: 'Completed' },
    { name: 'Database Architecture design', dueDate: '2026-06-18', status: 'Completed' },
    { name: 'Vite UI connection endpoints', dueDate: '2026-07-02', status: 'Pending' }
  ]);

  const github = React.useMemo(() => {
    let totalCommits = 0;
    let totalPRs = 0;
    memberMetrics.forEach(m => {
      totalCommits += m.commitsCount || 0;
      totalPRs += m.prsCount || 0;
    });
    return {
      commits: totalCommits,
      prs: totalPRs
    };
  }, [memberMetrics]);

  const tasks = activeProject && activeProject.tasks ? activeProject.tasks : (team.tasks || [
    { status: 'Completed' }, { status: 'Completed' }, { status: 'In Progress' }, { status: 'Pending' }
  ]);

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const remainingTasks = tasks.filter(t => t.status !== 'Completed').length;

  const repoUrl = activeProject?.github?.repoUrl || activeProject?.repoUrl || github.repoUrl || '';

  const renderHeatmap = () => {
    const months = [
      { name: 'Jul', year: 2025 },
      { name: 'Aug', year: 2025 },
      { name: 'Sep', year: 2025 },
      { name: 'Oct', year: 2025 },
      { name: 'Nov', year: 2025 },
      { name: 'Dec', year: 2025 },
      { name: 'Jan', year: 2026 },
      { name: 'Feb', year: 2026 },
      { name: 'Mar', year: 2026 },
      { name: 'Apr', year: 2026 },
      { name: 'May', year: 2026 },
      { name: 'Jun', year: 2026 }
    ];

    return (
      <div className="flex items-start gap-2.5 overflow-x-auto w-full pb-3 pt-2 custom-scrollbar justify-start select-none">
        {months.map((m) => {
          // Adjust activity weighting dynamically to simulate a realistic contribution history
          let activityWeight = 0.08;
          if (m.name === 'Jun') activityWeight = 0.65;
          else if (m.name === 'May') activityWeight = 0.4;
          else if (m.name === 'Mar') activityWeight = 0.25;

          const colsCount = 4; // 4 columns per month block
          const cols = [];

          for (let c = 0; c < colsCount; c++) {
            const colSquares = [];
            for (let r = 0; r < 7; r++) {
              const randVal = Math.random();
              let submissions = 0;
              
              // Default inactive GitHub style colors
              let colorClass = 'bg-slate-200 dark:bg-[#161b22] hover:border-slate-400 dark:hover:border-slate-600';
              
              if (randVal < activityWeight) {
                // Random submission count and color grades
                const val = Math.floor(Math.random() * 4) + 1; // 1 to 4
                submissions = val;
                if (val === 1) {
                  colorClass = 'bg-emerald-500/30 dark:bg-[#0e4429] hover:border-emerald-300 dark:hover:border-[#26a641]';
                } else if (val === 2) {
                  colorClass = 'bg-emerald-500/60 dark:bg-[#006d32] hover:border-emerald-300 dark:hover:border-[#26a641]';
                } else if (val === 3) {
                  colorClass = 'bg-emerald-400 dark:bg-[#26a641] hover:border-emerald-200 dark:hover:border-[#39d353]';
                } else {
                  colorClass = 'bg-emerald-300 dark:bg-[#39d353] hover:border-white';
                }
              }

              // Realistic day index offset
              const dayOffset = (c * 7 + r) % 28 + 1;
              const dateString = `${m.name} ${dayOffset}, ${m.year}`;

              colSquares.push(
                <div
                  key={`${c}-${r}`}
                  className={`w-2.5 h-2.5 rounded-sm border border-transparent transition-all duration-200 cursor-pointer ${colorClass}`}
                  title={`${submissions > 0 ? `${submissions} commits` : 'No commits'} on ${dateString}`}
                />
              );
            }
            cols.push(
              <div key={c} className="flex flex-col gap-0.5">
                {colSquares}
              </div>
            );
          }

          return (
            <div key={m.name} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              {/* 4 columns layout inside month block */}
              <div className="flex gap-0.5">
                {cols}
              </div>
              {/* Centered Month label underneath */}
              <span className="text-[10px] font-bold text-brand-text-muted/60 select-none">
                {m.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Aggregate all documents from project settings, tasks, and weekly reports
  const allDocuments = React.useMemo(() => {
    if (!activeProject) return [];
    const allDocs = [];
    const seenDocKeys = new Set();

    if (activeProject.documents) {
      activeProject.documents.forEach(doc => {
        const key = doc.fileId || doc.fileUrl || doc.fileName;
        if (key && !seenDocKeys.has(key)) {
          seenDocKeys.add(key);
          allDocs.push({
            fileName: doc.fileName,
            fileId: doc.fileId,
            fileUrl: doc.fileUrl,
            source: 'Project Settings'
          });
        }
      });
    }

    if (activeProject.tasks) {
      activeProject.tasks.forEach(task => {
        if (task.reportDetails && task.reportDetails.fileName && task.reportDetails.fileUrl) {
          const fileUrl = task.reportDetails.fileUrl;
          let fileId = null;
          if (fileUrl.includes('/download/')) {
            fileId = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
          }
          const key = fileId || fileUrl || task.reportDetails.fileName;
          if (key && !seenDocKeys.has(key)) {
            seenDocKeys.add(key);
            allDocs.push({
              fileName: task.reportDetails.fileName,
              fileId: fileId,
              fileUrl: fileUrl,
              source: `Submission: ${task.name}`
            });
          }
        }
      });
    }

    if (activeProject.weeklyReports) {
      activeProject.weeklyReports.forEach(report => {
        if (report.fileName && report.fileUrl) {
          const fileUrl = report.fileUrl;
          let fileId = null;
          if (fileUrl.includes('/download/')) {
            fileId = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
          }
          const key = fileId || fileUrl || report.fileName;
          if (key && !seenDocKeys.has(key)) {
            seenDocKeys.add(key);
            allDocs.push({
              fileName: report.fileName,
              fileId: fileId,
              fileUrl: fileUrl,
              source: `Report: ${report.week || report.title || 'Weekly Report'}`
            });
          }
        }
      });
    }
    return allDocs;
  }, [activeProject]);

  // Aggregate all reference links from project settings and tasks
  const allReferenceLinks = React.useMemo(() => {
    if (!activeProject) return [];
    const allLinks = [];
    const seenLinks = new Set();

    if (activeProject.referenceLinks) {
      activeProject.referenceLinks.forEach(link => {
        if (link && !seenLinks.has(link)) {
          seenLinks.add(link);
          allLinks.push({
            url: link,
            source: 'Project Settings'
          });
        }
      });
    }


    return allLinks;
  }, [activeProject]);

  return (
    <div className="space-y-6 w-full text-left animate-fade-in pb-12">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Active Teams</span>
      </button>

      {/* Header card */}
      <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
        <div>
          <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block">
            {team.domain || 'Software Development'}
          </span>
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
            {team.name}
          </h2>
          <p className="text-sm text-brand-text-muted mt-1 leading-snug">
            Project: <strong className="text-brand-text">{team.project || team.projectName}</strong>
          </p>
        </div>

        {/* Team roster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-brand-border/40">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">Team Leader</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-text">
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs select-none">
                {leader[0]}
              </div>
              <span>{leader}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">Roster Members</span>
            <div className="flex flex-wrap gap-2">
              {members.length === 0 ? (
                <span className="text-xs text-brand-text-muted">No members assigned yet</span>
              ) : (
                members.map((m, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-brand-text">
                    {m}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Repository Link Section */}
      <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md hover:border-primary/20 hover:shadow-glow-primary/5 transition-all duration-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <FiGithub className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-extrabold text-brand-text tracking-wide uppercase">
            GitHub Repository
          </span>
        </div>
        {repoUrl ? (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-bold text-primary hover:underline hover:text-secondary truncate max-w-[200px] sm:max-w-md transition-colors duration-300"
            title={repoUrl}
          >
            {repoUrl}
          </a>
        ) : (
          <span className="text-xs sm:text-sm font-semibold text-brand-text-muted italic">
            Not Provided
          </span>
        )}
      </div>

      {/* Project Phase section */}
      {activeProject && (
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md hover:border-primary/20 hover:shadow-glow-primary/5 transition-all duration-300 flex items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-2.5">
            <FiLayers className="w-5 h-5 text-cyan-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold text-brand-text tracking-wide uppercase">
              Project Development Phase
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={activeProject.phase || 'Planning Phase'}
              disabled={!isMentor}
              onChange={async (e) => {
                const newPhase = e.target.value;
                try {
                  const updatedProj = {
                    ...activeProject,
                    phase: newPhase,
                    status: newPhase === 'Completed' ? 'Completed' : 'Active'
                  };
                  await api.updateProject(activeProject.id, updatedProj);
                  
                  const stored = localStorage.getItem('projects');
                  if (stored) {
                    const allProj = JSON.parse(stored);
                    const nextAllProj = allProj.map(p => p.id === activeProject.id ? updatedProj : p);
                    localStorage.setItem('projects', JSON.stringify(nextAllProj));
                    window.dispatchEvent(new Event('storage'));
                  }
                  
                  // Also dispatch notification to Team Leader & Members
                  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                  const teamMembersList = registeredUsers.filter(u => 
                    u.team && u.team.split(',').map(t => t.trim().toLowerCase()).includes(team.name.toLowerCase())
                  );
                  teamMembersList.forEach(m => {
                    if (m.email) {
                      api.createNotification({
                        title: 'Project Phase Updated',
                        message: `Your project phase has been set to "${newPhase}" by your mentor Dr. Anusha Kaur.`,
                        recipient: m.email,
                        teamName: team.name,
                        type: 'info',
                        id: `notif-${Date.now()}-${Math.random()}`
                      }).catch(e => console.warn('Failed to send phase notification:', e));
                    }
                  });

                  window.location.reload();
                } catch (err) {
                  console.error('Failed to update project phase:', err);
                }
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-border bg-slate-50 dark:bg-slate-900 text-brand-text focus:outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <option value="Planning Phase" className="bg-brand-card">Planning Phase</option>
              <option value="Design Phase" className="bg-brand-card">Design Phase</option>
              <option value="Implementation Phase" className="bg-brand-card">Implementation Phase</option>
              <option value="Testing Phase" className="bg-brand-card">Testing Phase</option>
              <option value="Deployment Phase" className="bg-brand-card">Deployment Phase</option>
              <option value="Completed" className="bg-brand-card">Completed</option>
            </select>
          </div>
        </div>
      )}

      {/* Health Score section */}
      <HealthScoreCard health={projectHealth} healthDetails={projectHealthDetails} onUpdateHealth={handleUpdateHealth} />

      {/* Project Documents & Reference Links */}
      {((allDocuments.length > 0) || (allReferenceLinks.length > 0)) && (
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-text pb-2.5 border-b border-brand-border/40 flex items-center gap-2">
            <FiFileText className="w-4 h-4 text-primary" />
            Project Resources & Reference Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Documents Column */}
            {allDocuments.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                  Attached Documents ({allDocuments.length})
                </span>
                <div className="space-y-2">
                  {allDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/10 text-xs">
                      <div className="flex flex-col gap-1 truncate max-w-[230px]">
                        <span className="text-brand-text font-semibold flex items-center gap-2 truncate" title={doc.fileName}>
                          <FiFileText className="w-4 h-4 text-primary flex-shrink-0" />
                          {doc.fileName}
                        </span>
                        {doc.source && (
                          <span className="text-[9px] font-bold text-brand-text-muted/65 uppercase tracking-wider pl-6">
                            via {doc.source}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const blob = await api.downloadFile(doc.fileId);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = doc.fileName;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                          } catch (err) {
                            console.error('Failed to download file:', err);
                            if (doc.fileUrl) {
                              window.open(doc.fileUrl, '_blank');
                            }
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-brand-card hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-brand-text cursor-pointer transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reference Links Column */}
            {allReferenceLinks.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                  Reference Links ({allReferenceLinks.length})
                </span>
                <div className="space-y-2">
                  {allReferenceLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center p-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/10 text-xs">
                      <div className="flex flex-col gap-1 truncate max-w-full">
                        <span className="text-brand-text font-semibold flex items-center gap-2 truncate">
                          <FiLink className="w-4 h-4 text-secondary flex-shrink-0" />
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline hover:text-secondary font-bold truncate transition-colors"
                            title={link.url}
                          >
                            {link.url}
                          </a>
                        </span>
                        {link.source && (
                          <span className="text-[9px] font-bold text-brand-text-muted/65 uppercase tracking-wider pl-6">
                            via {link.source}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Progress Card */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiActivity className="w-5 h-5 text-cyan-500" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Project Progress
            </h3>
          </div>

          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase block">Completed Tasks</span>
                <span className="text-xl font-extrabold text-emerald-500 mt-1 block">{completedTasks}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase block">Remaining Tasks</span>
                <span className="text-xl font-extrabold text-amber-500 mt-1 block">{remainingTasks}</span>
              </div>
            </div>

            {/* Progress Bar slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-brand-text-muted">
                <span>Overall Completion Percentage</span>
                <span className="text-brand-text font-extrabold">{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Card */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiCalendar className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Upcoming Milestones
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            {milestones.map((ms, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between hover:border-cyan-500/20 transition-all duration-300"
              >
                <div>
                  <h4 className="text-xs font-bold text-brand-text">{ms.name}</h4>
                  <span className="text-[9px] text-brand-text-muted mt-0.5 block">Due Date: {ms.dueDate}</span>
                </div>
                <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                  ms.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                }`}>
                  {ms.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Summary Card */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiGithub className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              GitHub Repository Summary
            </h3>
          </div>

          <div className="w-full space-y-3 text-left">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase block">Commits</span>
                <span className="text-base font-extrabold text-brand-text">{github.commits}</span>
              </div>
              <div className="p-3 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase block">PRs Open</span>
                <span className="text-base font-extrabold text-brand-text">{github.prs}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Tasks Card */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiCheckSquare className="w-5 h-5 text-cyan-500" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Assigned Tasks
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            {tasks.length === 0 ? (
              <p className="text-xs text-brand-text-muted italic py-2">No tasks assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-brand-text">{task.name}</h4>
                        <p className="text-[10px] text-brand-text-muted mt-1 leading-relaxed">
                          {task.description || 'No description provided.'}
                        </p>
                        
                        {/* Task Documents */}
                        {task.documents && task.documents.length > 0 && (
                          <div className="mt-2.5 space-y-1 text-[9px] text-left">
                            <span className="font-bold text-brand-text-muted uppercase tracking-wider block">Task Attachments</span>
                            <div className="flex flex-wrap gap-1.5">
                              {task.documents.map((doc, dIdx) => (
                                <button
                                  key={dIdx}
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const blob = await api.downloadFile(doc.fileId);
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = doc.fileName;
                                      document.body.appendChild(a);
                                      a.click();
                                      a.remove();
                                    } catch (err) {
                                      console.error('Failed to download:', err);
                                      if (doc.fileUrl) window.open(doc.fileUrl, '_blank');
                                    }
                                  }}
                                  className="px-2 py-0.8 rounded border border-brand-border bg-slate-50 dark:bg-slate-900 text-brand-text hover:text-primary transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                                  title={doc.fileName}
                                >
                                  <FiFileText className="w-3 h-3 text-primary shrink-0" />
                                  <span className="truncate max-w-[80px]">{doc.fileName}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Task Reference Links */}
                        {task.referenceLinks && task.referenceLinks.length > 0 && (
                          <div className="mt-2.5 space-y-1 text-[9px] text-left">
                            <span className="font-bold text-brand-text-muted uppercase tracking-wider block">Reference Links</span>
                            <div className="flex flex-col gap-1">
                              {task.referenceLinks.map((link, lIdx) => (
                                <div key={lIdx} className="flex items-center gap-1 text-brand-text truncate">
                                  <FiLink className="w-3 h-3 text-secondary shrink-0" />
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-semibold truncate max-w-full"
                                    title={link}
                                  >
                                    {link}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-brand-text-muted font-semibold border-t border-brand-border/40 pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider">Assignee:</span>
                        <span className="text-brand-text font-bold">{task.student || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] uppercase tracking-wider">Due:</span>
                        <span className="text-brand-text font-bold">{task.deadline || '--'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamDetails;
