import React from 'react';
import { FiUser, FiActivity, FiAlertOctagon } from 'react-icons/fi';

const TeamCard = ({ team, onViewTeam }) => {
  const getHealthBadgeClass = (score) => {
    if (score >= 95) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (score >= 80) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  };

  const getRiskBadgeClass = (risk) => {
    const r = risk.toLowerCase();
    if (r.includes('low')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (r.includes('med')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
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
    <div className="group rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md p-6 flex flex-col justify-between hover:border-cyan-500/20 hover:shadow-glow-cyan hover:-translate-y-1 transition-all duration-500 relative overflow-hidden text-left h-full">
      {/* Decorative gradient corner accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-500 to-blue-500" />

      {/* Details layout */}
      <div className="space-y-4">
        
        {/* Header Title Row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[9px] font-extrabold text-brand-text-muted uppercase tracking-widest block mb-1">
              {team.domain || 'Software Development'}
            </span>
            <h3 className="text-base font-extrabold text-brand-text leading-snug group-hover:text-cyan-500 transition-colors duration-300">
              {team.name}
            </h3>
            <p className="text-xs text-brand-text-muted leading-tight mt-0.5">
              {team.project || team.projectName}
            </p>
          </div>
          <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase border select-none h-fit ${getStatusBadgeClass(team.status)}`}>
            {team.status}
          </span>
        </div>

        {/* Leader info */}
        <div className="flex items-center gap-2 text-xs text-brand-text-muted font-medium">
          <FiUser className="w-3.5 h-3.5 text-cyan-500" />
          <span>Leader: <strong className="text-brand-text">{team.leaderName || 'Ankit Sharma'}</strong></span>
        </div>

        {/* Health / Risk row */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-brand-border/40">
          <div>
            <span className="text-[9px] font-bold text-brand-text-muted uppercase block mb-1">Health</span>
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full border text-[10px] font-extrabold ${getHealthBadgeClass(team.health)}`}>
              <FiActivity className="w-3 h-3 animate-pulse" />
              {team.health}%
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-brand-text-muted uppercase block mb-1">Risk Level</span>
            <span className={`inline-block px-2 py-0.2 rounded border text-[10px] font-bold uppercase ${getRiskBadgeClass(team.riskLevel || 'Low')}`}>
              {team.riskLevel || 'Low'}
            </span>
          </div>
        </div>

        {/* Progress Bar slider */}
        <div className="space-y-1.5 pt-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-text-muted">
            <span>Development Progress</span>
            <span className="text-brand-text">{team.progress || 60}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${team.progress || 60}%` }}
            />
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="pt-5 border-t border-brand-border/40 mt-5">
        <button
          type="button"
          onClick={onViewTeam}
          className="w-full py-2.5 rounded-xl border border-brand-border hover:border-cyan-500/40 bg-transparent text-brand-text hover:bg-slate-200/30 dark:hover:bg-slate-800/30 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer text-center block"
        >
          View Team Details
        </button>
      </div>

    </div>
  );
};

export default TeamCard;
