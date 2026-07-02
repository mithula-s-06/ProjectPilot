import React from 'react';
import { FiAlertTriangle, FiArrowRight, FiShield } from 'react-icons/fi';

const RiskTeamCard = ({ team, onViewDetails }) => {
  const getRiskColor = (level) => {
    const l = level.toLowerCase();
    if (l.includes('critical')) return 'text-rose-600 bg-rose-600/10 border-rose-600/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="group p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md hover:border-rose-500/20 transition-all duration-300 relative overflow-hidden text-left flex flex-col justify-between h-full">
      {/* Red corner caution flag */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-extrabold text-brand-text">
              {team.name}
            </h4>
            <p className="text-xs text-brand-text-muted mt-0.5">
              Project: <strong className="text-brand-text">{team.project || team.projectName}</strong>
            </p>
          </div>
          <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase border select-none ${getRiskColor(team.riskLevel || 'High')}`}>
            {team.riskLevel || 'High Risk'}
          </span>
        </div>

        {/* Health Row */}
        <div className="flex items-center gap-2 text-xs text-brand-text-muted">
          <FiAlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Health score dropped to <strong className="text-rose-500 font-extrabold">{team.health}%</strong></span>
        </div>

        {/* Reason for Risk */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider block">
            Primary Risk Factors
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(team.reasons || ['AI Detected High Risk']).map((reason, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg border border-brand-border bg-slate-100/40 dark:bg-slate-900/30 text-[10px] font-semibold text-brand-text-muted"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Button footer */}
      <div className="pt-5 border-t border-brand-border/40 mt-5">
        <button
          type="button"
          onClick={onViewDetails}
          className="w-full py-2.5 rounded-xl border border-brand-border hover:border-rose-500/30 bg-transparent text-brand-text hover:text-rose-500 hover:bg-rose-500/5 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <FiShield className="w-4 h-4" />
          <span>View Risk Analysis</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

export default RiskTeamCard;
