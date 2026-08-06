import React from 'react';
import { FiArrowLeft, FiActivity, FiGithub, FiCalendar } from 'react-icons/fi';

const TeamDetails = ({ team, onBack }) => {
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

  const github = activeProject && activeProject.github ? activeProject.github : {
    commits: 0,
    prs: 0,
    openIssues: 0,
    closedIssues: 0,
    contributionPercentage: 0
  };

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
        {months.map((m, mIdx) => {
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Heatmap placeholder */}
            <div className="md:col-span-6 flex flex-col items-center justify-center space-y-2">
              <span className="text-xs font-bold text-brand-text-muted">Repository Activity Heatmap</span>
              {renderHeatmap()}
            </div>

            {/* Commits rows */}
            <div className="md:col-span-6 space-y-3 text-left">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase block">Commits</span>
                  <span className="text-base font-extrabold text-brand-text">{github.commits}</span>
                </div>
                <div className="p-3 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase block">PRs Open</span>
                  <span className="text-base font-extrabold text-brand-text">{github.prs}</span>
                </div>
                <div className="p-3 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase block">Open Issues</span>
                  <span className="text-base font-extrabold text-brand-text">{github.openIssues}</span>
                </div>
                <div className="p-3 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase block">Closed Issues</span>
                  <span className="text-base font-extrabold text-brand-text">{github.closedIssues}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 flex items-center justify-between text-xs font-semibold text-brand-text-muted">
                <span>Contribution Share</span>
                <span className="text-primary font-bold">{github.contributionPercentage}% Workshare</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamDetails;
