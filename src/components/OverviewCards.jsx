import React from 'react';
import { FiUsers, FiFileText, FiActivity, FiAlertOctagon } from 'react-icons/fi';

const OverviewCards = ({ stats = {} }) => {
  const cards = [
    {
      id: 'teams',
      title: 'Assigned Teams',
      value: stats.assignedTeams || '8 Teams',
      icon: <FiUsers className="w-5 h-5 text-cyan-500" />,
      bgClass: 'bg-cyan-500/10 border-cyan-500/20',
      glowClass: 'hover:shadow-glow-cyan/20 hover:border-cyan-500/40',
      description: 'Active squads under mentorship'
    },
    {
      id: 'reports',
      title: 'No. of Reports',
      value: stats.pendingReports || '12 Reports',
      icon: <FiFileText className="w-5 h-5 text-primary" />,
      bgClass: 'bg-primary/10 border-primary/20',
      glowClass: 'hover:shadow-glow-primary/20 hover:border-primary/40',
      description: 'Total weekly report submissions'
    },
    {
      id: 'health',
      title: 'Average Project Health',
      value: stats.avgHealth || '89%',
      icon: <FiActivity className="w-5 h-5 text-emerald-500" />,
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
      glowClass: 'hover:shadow-glow-emerald/20 hover:border-emerald-500/40',
      description: 'Weighted health score index'
    },
    {
      id: 'risk',
      title: 'High Risk Teams',
      value: stats.highRiskTeams || '3 Teams',
      icon: <FiAlertOctagon className="w-5 h-5 text-rose-500" />,
      bgClass: 'bg-rose-500/10 border-rose-500/20',
      glowClass: 'hover:shadow-glow-rose/20 hover:border-rose-500/40',
      description: 'Requires immediate mentor intervention'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
      {cards.map((c) => (
        <div
          key={c.id}
          className={`p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md transition-all duration-300 ${c.glowClass} flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-text-muted">
              {c.title}
            </span>
            <div className={`p-2.5 rounded-xl border ${c.bgClass}`}>
              {c.icon}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-brand-text block tracking-tight">
              {c.value}
            </span>
            <span className="text-[10px] text-brand-text-muted mt-1 block leading-tight">
              {c.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
