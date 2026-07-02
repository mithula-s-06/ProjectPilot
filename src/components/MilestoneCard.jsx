import React, { useState } from 'react';
import { FiCalendar, FiChevronDown, FiChevronUp, FiCheckCircle, FiClock } from 'react-icons/fi';

const MilestoneCard = ({ milestones = [] }) => {
  const [expanded, setExpanded] = useState(false);

  // Find currently active milestone (first pending one)
  const activeMilestone = milestones.find((m) => m.status === 'Pending') || milestones[milestones.length - 1] || {};

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300">
      
      {/* Header (Always Visible) */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Upcoming Milestones
            </h3>
            <span className="text-xs text-brand-text-muted">Click to view vertical timeline</span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold text-brand-text block">
              Next: <strong className="text-secondary">{activeMilestone.name || 'None'}</strong>
            </span>
            <span className="text-[10px] text-brand-text-muted mt-0.5 block font-semibold">
              Due: {activeMilestone.dueDate || '--'}
            </span>
          </div>
          <div className="text-brand-text-muted">
            {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable Panel */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 animate-fade-in text-left">
          
          {/* Vertical Timeline line container (timeline line removed) */}
          <div className="relative pl-8 space-y-6 pt-4 ml-3">
            {milestones.map((ms) => {
              const isCompleted = ms.status === 'Completed' || ms.progress === 100;
              return (
                <div key={ms.id} className="relative group">
                  
                  {/* Timeline Dot Icon */}
                  <span className={`absolute -left-[41px] top-0.5 p-1 rounded-full border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-glow-emerald'
                      : 'bg-brand-card text-brand-text-muted/40 border-brand-border'
                  }`}>
                    {isCompleted ? <FiCheckCircle className="w-4 h-4" /> : <FiClock className="w-4 h-4" />}
                  </span>

                  {/* Details Card */}
                  <div className="p-4 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 hover:border-primary/20 transition-all duration-300 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-extrabold tracking-tight text-brand-text">
                        {ms.name}
                      </h4>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                        isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary/10 text-secondary'
                      }`}>
                        {isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>

                    {/* Progress slider info */}
                    <div className="flex items-center gap-4 text-[10px] font-semibold text-brand-text-muted">
                      <span>Completion: <strong>{ms.progress}%</strong></span>
                      <span>•</span>
                      <span>Due Date: <strong>{ms.dueDate}</strong></span>
                    </div>

                    {/* Mini progress bar inside panel */}
                    <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-secondary'}`}
                        style={{ width: `${ms.progress}%` }}
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};

export default MilestoneCard;
