import React from 'react';
import { FiUsers, FiUserCheck, FiCpu } from 'react-icons/fi';
import { BiGitBranch } from 'react-icons/bi';

const DashboardCards = ({ teamsCount = 0, usersCount = 0, mentorsCount = 0 }) => {
  const cards = [
    {
      title: 'Total Teams',
      value: teamsCount,
      trend: 'Assigned student teams',
      icon: <FiUsers className="w-6 h-6 text-primary" />,
      glowClass: 'hover:shadow-glow-primary hover:border-primary/30',
      bgColor: 'bg-primary/5 border-primary/10',
    },
    {
      title: 'Total Users',
      value: usersCount,
      trend: 'Registered user profiles',
      icon: <FiUserCheck className="w-6 h-6 text-emerald-400" />,
      glowClass: 'hover:shadow-glow-emerald hover:border-emerald-500/30',
      bgColor: 'bg-emerald-500/5 border-emerald-500/10',
    },
    {
      title: 'Available Mentors',
      value: mentorsCount,
      trend: 'Assigned academic mentors',
      icon: <BiGitBranch className="w-6 h-6 text-purple-400" />,
      glowClass: 'hover:shadow-glow-purple hover:border-purple-500/30',
      bgColor: 'bg-purple-500/5 border-purple-500/10',
    },
    {
      title: 'Projects Under Monitoring',
      value: teamsCount,
      trend: 'Active ongoing projects',
      icon: <FiCpu className="w-6 h-6 text-secondary" />,
      glowClass: 'hover:shadow-glow-secondary hover:border-secondary/30',
      bgColor: 'bg-secondary/5 border-secondary/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 shadow-md hover:shadow-lg ${card.glowClass}`}
        >
          {/* Top Row: Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl border ${card.bgColor} transition-transform duration-300 group-hover:scale-110`}>
              {card.icon}
            </div>
          </div>

          {/* Details */}
          <div className="text-left">
            <span className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
              {card.title}
            </span>
            <h3 className="text-3xl font-extrabold text-brand-text mb-1 tracking-tight">
              {card.value}
            </h3>
            <p className="text-[11px] text-brand-text-muted/70 font-semibold">
              {card.trend}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
