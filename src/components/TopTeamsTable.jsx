import React from 'react';

const TopTeamsTable = ({ teams = [] }) => {
  // Sort teams by health descending to find top performing ones
  const sortedTeams = [...teams].sort((a, b) => b.health - a.health);

  // Single professional primary theme color (cyan/blue) shades based on opacity
  const getHealthBadgeClass = (score) => {
    if (score >= 95) {
      return 'bg-primary/20 text-primary border-primary/30 font-extrabold';
    } else if (score >= 80) {
      return 'bg-primary/15 text-primary/90 border-primary/20 font-bold';
    } else if (score >= 60) {
      return 'bg-primary/10 text-primary/80 border-primary/15 font-semibold';
    } else {
      return 'bg-primary/5 text-primary/60 border-primary/10 font-normal';
    }
  };

  const getStatusFromHealth = (health) => {
    const score = health !== undefined ? health : 100;
    if (score >= 80) return 'VERY GOOD';
    if (score >= 50) return 'MEDIUM';
    return 'POOR';
  };

  const getStatusBadgeClass = (score) => {
    if (score >= 80) {
      return 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 font-bold';
    } else if (score >= 50) {
      return 'text-amber-500 bg-amber-500/10 border border-amber-500/20 font-semibold';
    } else {
      return 'text-rose-500 bg-rose-500/10 border border-rose-500/15 font-normal';
    }
  };

  return (
    <div className="w-full rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-brand-border/40">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
          Top Performing Teams
        </h3>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-brand-border/40 bg-slate-50/30 dark:bg-slate-900/20">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted w-20">
                Rank
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Team Name
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Project Name
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Health Score
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Mentor
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {sortedTeams.map((team, idx) => (
              <tr 
                key={team.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors duration-300"
              >
                {/* Rank */}
                <td className="px-6 py-4 text-sm font-extrabold text-brand-text">
                  #{idx + 1}
                </td>
                {/* Team Name */}
                <td className="px-6 py-4 text-sm font-bold text-brand-text">
                  {team.name}
                </td>
                {/* Project Name */}
                <td className="px-6 py-4 text-sm text-brand-text-muted font-medium">
                  {team.project}
                </td>
                {/* Health Score */}
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full border text-xs font-extrabold tracking-wide ${getHealthBadgeClass(team.health)}`}>
                    {team.health}%
                  </span>
                </td>
                {/* Mentor */}
                <td className="px-6 py-4 text-sm font-semibold text-brand-text-muted">
                  {team.mentor}
                </td>
                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold ${getStatusBadgeClass(team.health)}`}>
                    {getStatusFromHealth(team.health)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TopTeamsTable;
