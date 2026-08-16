import React, { useState, useEffect } from 'react';
import { FiGithub, FiCheckSquare, FiFileText, FiActivity, FiArrowLeft } from 'react-icons/fi';
import PerformanceTable from '../components/PerformanceTable';
import { api } from '../utils/api';

const Performance = ({ project, teamName, projects = [] }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);

  const calculateMemberScore = (commits, prs, completed, pending) => {
    const commitScore = Math.min(commits * 2, 40);
    const prScore = Math.min(prs * 10, 30);
    const completedScore = Math.min(completed * 20, 40);
    const pendingPenalty = pending * 5;
    
    let total = commitScore + prScore + completedScore - pendingPenalty;
    return Math.max(0, Math.min(Math.round(total), 100));
  };

  useEffect(() => {
    async function loadPerformanceData() {
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]') || projects || [];

        const activeTeamName = selectedProject?.teamName || teamName;

        if (activeTeamName && activeTeamName !== 'Not Assigned') {
          const activeTeamsOriginal = activeTeamName.split(',').map(t => t.trim());
          const activeTeamsLower = activeTeamsOriginal.map(t => t.toLowerCase());

          // Fetch real GitHub metrics from MongoDB for these teams using original casing
          let metrics = [];
          for (const tName of activeTeamsOriginal) {
            try {
              const m = await api.getMemberMetricsByTeam(tName) || [];
              metrics = [...metrics, ...m];
            } catch (err) {
              console.warn('Failed to fetch member metrics for ' + tName, err);
            }
          }

          // Get members assigned to any of these teams
          const teamUsers = registeredUsers.filter(u => {
            if (!u.team) return false;
            const userTeams = u.team.split(',').map(t => t.trim().toLowerCase());
            return userTeams.some(ut => activeTeamsLower.includes(ut));
          });

          const mappedMembers = teamUsers.map(u => {
            // Find commits & prs from the github collection metrics
            const userMetric = metrics.find(m => m.memberEmail && u.email && m.memberEmail.toLowerCase() === u.email.toLowerCase());
            const commits = userMetric ? (userMetric.commitsCount || 0) : 0;
            const prs = userMetric ? (userMetric.prsCount || 0) : 0;

            // Find completed and pending tasks from project tasks
            const userTasks = selectedProject && selectedProject.tasks ? selectedProject.tasks.filter(t => t.student && t.student.toLowerCase() === (u.fullName || u.name || '').toLowerCase()) : [];
            const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
            const pendingTasks = userTasks.filter(t => t.status !== 'Completed').length;

            // Resolve all project names for teams assigned to this user
            const teamsList = u.team ? u.team.split(',').map(t => t.trim().toLowerCase()) : [];
            const userProjects = storedProjects
              .filter(p => p.teamName && teamsList.includes(p.teamName.toLowerCase()))
              .map(p => p.name || p.projectName);

            const projectNames = userProjects.length > 0 ? userProjects : [selectedProject?.name || 'AI safety analysis'];

            const score = calculateMemberScore(commits, prs, completedTasks, pendingTasks);

            return {
              name: u.fullName || u.name,
              role: u.role === 'TEAM_LEADER' ? 'Team Leader' : 'Student',
              commits,
              prs,
              completedTasks,
              pendingTasks,
              projectNames,
              score
            };
          });

          // Sort members in descending order of performance score (rank)
          const sortedMembers = mappedMembers.sort((a, b) => b.score - a.score);
          setMembers(sortedMembers);
        } else {
          setMembers([]);
        }
      } catch (e) {
        console.error('Failed to load performance metrics:', e);
      }
    }
    loadPerformanceData();
  }, [teamName, selectedProject, projects]);

  const stats = React.useMemo(() => {
    if (members.length === 0) {
      return { totalCommits: 0, totalPRs: 0, taskCompletionRate: 0, avgScore: 0 };
    }
    
    const totalCommits = members.reduce((sum, m) => sum + m.commits, 0);
    const totalPRs = members.reduce((sum, m) => sum + m.prs, 0);
    
    const totalCompleted = members.reduce((sum, m) => sum + m.completedTasks, 0);
    const totalPending = members.reduce((sum, m) => sum + m.pendingTasks, 0);
    const totalTasks = totalCompleted + totalPending;
    const taskCompletionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    
    const avgScore = Math.round(members.reduce((sum, m) => sum + m.score, 0) / members.length);
    
    return { totalCommits, totalPRs, taskCompletionRate, avgScore };
  }, [members]);

  if (!selectedProject) {
    return (
      <div className="space-y-6 w-full text-left animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Team Projects
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Select a project below to view its performance audits.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-brand-border bg-brand-card/20 text-brand-text-muted text-sm font-semibold select-none">
            No projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-brand-text tracking-tight">
                    {proj.name}
                  </h3>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                      {proj.domain}
                    </span>
                    <span className="text-[10px] font-bold text-brand-text-muted block">
                      Team Name: {proj.teamName || 'Not Assigned'}
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted/80 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border/40 mt-4 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    proj.status === 'Completed'
                      ? 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    {proj.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(proj)}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 cursor-pointer"
                  >
                    View Performance
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-left animate-fade-in">
      {/* Back button */}
      <button
        type="button"
        onClick={() => setSelectedProject(null)}
        className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer mb-2"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Projects</span>
      </button>
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Performance Audits
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Analyze code repository commits, task velocity metrics, and report submission frequencies.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Commits */}
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Total Commits</span>
            <span className="text-xl font-extrabold text-brand-text mt-1 block">{stats.totalCommits}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FiGithub className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total PRs */}
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Total PRs Opened</span>
            <span className="text-xl font-extrabold text-cyan-500 mt-1 block">{stats.totalPRs}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
            <FiCheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Task Completion Rate */}
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Task Completion Rate</span>
            <span className="text-xl font-extrabold text-primary mt-1 block">{stats.taskCompletionRate}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FiFileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Average Score */}
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Average Score</span>
            <span className="text-xl font-extrabold text-emerald-500 mt-1 block">{stats.avgScore}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <FiActivity className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Ledger Table */}
      <PerformanceTable members={members} projectName={selectedProject?.name} />

    </div>
  );
};

export default Performance;
