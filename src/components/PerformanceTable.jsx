import React from 'react';

const PerformanceTable = ({ members = [], projectName = '' }) => {
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Color code progress bars for GitHub Commits
  const getCommitProgressClass = (commits) => {
    if (commits >= 100) return 'bg-emerald-500';
    if (commits >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusBadge = (score) => {
    if (score >= 90) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (score >= 75) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md overflow-hidden text-left w-full">
      
      <div className="p-5 border-b border-brand-border/40">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
          Team Performance Metrics Ledger
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-brand-border bg-slate-200/20 dark:bg-slate-800/10">
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-left">Student</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-left">Project</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-left w-48">GitHub Commits</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center">PRs</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center">Completed Tasks</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center">Pending Tasks</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center">Score</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {members.map((m, idx) => {
              const maxCommits = 150;
              const percent = Math.min((m.commits / maxCommits) * 100, 100);

              return (
                <tr key={idx} className="hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-200">
                  {/* Student */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px] select-none">
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-brand-text block">{m.name}</span>
                        <span className="text-[9px] text-brand-text-muted font-semibold">{m.role}</span>
                      </div>
                    </div>
                  </td>
                  {/* Project */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold text-brand-text">
                      {projectName || (m.projectNames && m.projectNames[0]) || 'AI safety analysis'}
                    </span>
                  </td>
                  {/* GitHub Commits Bar */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-brand-text-muted">
                        <span>{m.commits} commits</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${getCommitProgressClass(m.commits)}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* PRs */}
                  <td className="px-6 py-4 text-center whitespace-nowrap font-semibold text-xs text-brand-text">
                    {m.prs}
                  </td>
                  {/* Tasks Completed */}
                  <td className="px-6 py-4 text-center whitespace-nowrap font-semibold text-xs text-emerald-500">
                    {m.completedTasks}
                  </td>
                  {/* Pending Tasks */}
                  <td className="px-6 py-4 text-center whitespace-nowrap font-semibold text-xs text-brand-text-muted">
                    {m.pendingTasks}
                  </td>
                  {/* Performance Score */}
                  <td className="px-6 py-4 text-center whitespace-nowrap font-extrabold text-xs text-brand-text">
                    {m.score}%
                  </td>
                  {/* Status Badge */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase ${getStatusBadge(m.score)}`}>
                      {m.score >= 90 ? 'Excellent' : m.score >= 75 ? 'Very Good' : 'Average'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default PerformanceTable;
