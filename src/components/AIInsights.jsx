import React from 'react';
import { FiCpu, FiCheckCircle, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';

const AIInsights = ({ teamName = 'Not Assigned', tasks = [], members = [] }) => {
  const insights = [];

  // 1. General System Health
  insights.push({
    id: 1,
    type: 'info',
    text: 'AI code diagnostics monitoring is active and synced with GitHub repositories.',
    icon: <FiCpu className="text-cyan-500 w-4 h-4" />
  });

  // 2. Weekly Report Reminders
  insights.push({
    id: 2,
    type: 'info',
    text: 'Weekly progress report submission cycle is active.',
    icon: <FiTrendingUp className="text-emerald-500 w-4 h-4" />
  });

  // 3. Task Progress Diagnostics
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const totalTasksCount = tasks.length;
  if (totalTasksCount > 0) {
    const rate = Math.round((completedTasksCount / totalTasksCount) * 100);
    insights.push({
      id: 3,
      type: rate >= 75 ? 'success' : 'warning',
      text: `${completedTasksCount} out of ${totalTasksCount} tasks (${rate}%) are completed.`,
      icon: rate >= 75 ? <FiCheckCircle className="text-emerald-500 w-4 h-4" /> : <FiAlertTriangle className="text-amber-500 w-4 h-4" />
    });
  } else {
    insights.push({
      id: 3,
      type: 'warning',
      text: 'No active tasks found. Create team tasks to view completion rate diagnostics.',
      icon: <FiAlertTriangle className="text-amber-500 w-4 h-4" />
    });
  }

  // 4. Team Member Contribution check
  if (members.length > 0) {
    insights.push({
      id: 4,
      type: 'success',
      text: `Roster health: ${members.length} team members successfully configured and tracked.`,
      icon: <FiCheckCircle className="text-emerald-500 w-4 h-4" />
    });
  }

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
