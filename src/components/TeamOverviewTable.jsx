import React from 'react';
import { FiArrowRight, FiActivity } from 'react-icons/fi';

const TeamOverviewTable = ({ teams = [], onViewTeam }) => {
  const getHealthBadgeClass = (score) => {
    if (score >= 95) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (score >= 80) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  };

  const getRiskBadgeClass = (risk) => {
    const r = risk.toLowerCase();
    if (r.includes('low')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10';
    if (r.includes('med')) return 'bg-amber-500/10 text-amber-500 border-amber-500/10';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/10';
  };

  const getStatusBadgeClass = (status) => {
    const s = status.toLowerCase();
    if (s.includes('track') || s.includes('excel') || s.includes('good')) {
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
    if (s.includes('warn') || s.includes('poor') || s.includes('risk')) {
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    }
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md overflow-hidden text-left w-full">
      <div className="p-5 border-b border-brand-border/40">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
          Team Overview Ledger
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-brand-border bg-slate-200/20 dark:bg-slate-800/10">
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-left">Team Name</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-left">Project Name</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center">Health Score</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center">Risk Level</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4.5 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {teams.length > 0 ? (
              teams.map((team) => (
                <tr 
                  key={team.id}
                  className="hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-200"
                >
                  {/* Team Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-extrabold text-brand-text">
                      {team.name}
                    </span>
                  </td>
                  {/* Project Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-brand-text-muted">
                      {team.project || team.projectName}
                    </span>
                  </td>
                  {/* Health Score */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold tracking-wide ${getHealthBadgeClass(team.health)}`}>
                      <FiActivity className="w-3 h-3 animate-pulse" />
                      {team.health}%
                    </span>
                  </td>
                  {/* Risk Level */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-bold tracking-wide uppercase ${getRiskBadgeClass(team.riskLevel || 'Low')}`}>
                      {team.riskLevel || 'Low'}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-bold tracking-wide uppercase ${getStatusBadgeClass(team.status)}`}>
                      {team.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewTeam(team)}
                      className="px-3.5 py-1.5 rounded-xl border border-brand-border hover:border-cyan-500/40 text-brand-text hover:text-cyan-500 hover:bg-cyan-500/5 text-xs font-bold transition-all duration-300 inline-flex items-center gap-1.5 focus:outline-none cursor-pointer"
                    >
                      <span>View Team</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-xs text-brand-text-muted italic">
                  No assigned teams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamOverviewTable;
