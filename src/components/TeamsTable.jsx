import React from 'react';
import { FiUserPlus, FiEye, FiTrash2 } from 'react-icons/fi';

const TeamsTable = ({ 
  teams = [], 
  onOpenAssignModal, 
  onViewTeam, 
  onDeleteTeam 
}) => {

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

  const getStatusBadgeClass = (score) => {
    if (score >= 95) {
      return 'text-primary bg-primary/10 border border-primary/25';
    } else if (score >= 80) {
      return 'text-primary/95 bg-primary/8 border border-primary/20';
    } else if (score >= 60) {
      return 'text-primary/90 bg-primary/6 border border-primary/15';
    } else {
      return 'text-primary/80 bg-primary/4 border border-primary/10';
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/30 dark:bg-slate-900/20">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Team Name
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Project Name
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Team Leader
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Mentor
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Members
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Health Score
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Status
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted text-center w-36">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60">
            {teams.map((team) => (
              <tr 
                key={team.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors duration-300"
              >
                {/* Team Name */}
                <td className="px-6 py-4 text-sm font-bold text-brand-text">
                  {team.name}
                </td>
                
                {/* Project Name */}
                <td className="px-6 py-4 text-sm text-brand-text-muted font-medium">
                  {team.project}
                </td>
                
                {/* Team Leader */}
                <td className="px-6 py-4 text-sm text-brand-text font-semibold">
                  {team.leaderName}
                </td>
                
                {/* Mentor Column */}
                <td className="px-6 py-4">
                  {team.mentor !== 'Not Assigned' ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-sm font-semibold text-brand-text">
                        {team.mentor}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenAssignModal(team)}
                        className="mt-1 inline-flex items-center gap-1 py-0.5 px-2 rounded border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-bold text-[9px] uppercase tracking-wider transition-all duration-300 cursor-pointer"
                      >
                        <span>Change Mentor</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 select-none">
                        Not Assigned
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenAssignModal(team)}
                        className="mt-1 inline-flex items-center gap-1 py-1 px-2.5 rounded bg-primary text-white font-extrabold text-[10px] uppercase tracking-wider hover:brightness-110 shadow hover:shadow-glow-primary transition-all duration-300 cursor-pointer"
                      >
                        <FiUserPlus className="w-3 h-3" />
                        <span>Assign Mentor</span>
                      </button>
                    </div>
                  )}
                </td>
                
                {/* Members count */}
                <td className="px-6 py-4 text-sm font-medium text-brand-text-muted">
                  {team.membersCount} Members
                </td>
                
                {/* Health Score */}
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full border text-xs font-extrabold tracking-wide ${getHealthBadgeClass(team.health)}`}>
                    {team.health}%
                  </span>
                </td>
                
                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold ${getStatusBadgeClass(team.health)}`}>
                    {team.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* View Details Eye Icon */}
                    <button 
                      onClick={() => onViewTeam(team)}
                      className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 cursor-pointer"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    
                    {/* Delete Team Button */}
                    <button 
                      onClick={() => onDeleteTeam(team.id)}
                      className="p-1.5 rounded-lg border border-brand-border text-rose-500 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-colors duration-300 cursor-pointer"
                      title="Delete Team"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamsTable;
