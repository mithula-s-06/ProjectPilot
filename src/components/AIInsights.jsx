import React from 'react';
import { FiCpu, FiCheckCircle, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';

const AIInsights = () => {
  const insights = [
    { id: 1, type: 'success', text: 'Ankit Sharma has completed all assigned tasks.', icon: <FiCheckCircle className="text-emerald-500 w-4 h-4" /> },
    { id: 2, type: 'warning', text: 'Sneha Reddy has low GitHub activity this week.', icon: <FiAlertTriangle className="text-amber-500 w-4 h-4" /> },
    { id: 3, type: 'danger', text: 'Amit Mehta has missed two task deadlines.', icon: <FiAlertTriangle className="text-rose-500 w-4 h-4 animate-pulse" /> },
    { id: 4, type: 'info', text: 'Weekly report submission is due tomorrow.', icon: <FiCpu className="text-cyan-500 w-4 h-4" /> },
    { id: 5, type: 'success', text: 'Project overall health improved by 8%.', icon: <FiTrendingUp className="text-emerald-500 w-4 h-4" /> },
    { id: 6, type: 'warning', text: 'Milestone 3 (API integrations) is likely to be delayed.', icon: <FiAlertTriangle className="text-amber-500 w-4 h-4" /> }
  ];

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-md text-left w-full relative overflow-hidden">
      {/* Glow bubble backdrop */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-primary/10 mb-4 select-none">
        <FiCpu className="w-5 h-5 text-primary animate-pulse" />
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary">
          AI Team Insights Diagnostics
        </h3>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="p-3.5 rounded-xl border border-brand-border bg-brand-card/40 backdrop-blur-xs flex items-start gap-3 hover:border-primary/25 transition-colors duration-300"
          >
            <div className="mt-0.5 flex-shrink-0">
              {ins.icon}
            </div>
            <span className="text-xs font-semibold text-brand-text leading-snug">
              {ins.text}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AIInsights;
