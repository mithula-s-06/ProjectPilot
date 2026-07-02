import React, { useState } from 'react';
import { FiMessageSquare, FiChevronDown, FiChevronUp, FiCalendar } from 'react-icons/fi';

const MentorFeedbackCard = ({ mentorFeedback = {} }) => {
  const [expanded, setExpanded] = useState(false);

  const latestFeedback = mentorFeedback.latestFeedback || 'No feedback submitted yet.';
  const date = mentorFeedback.date || '--';
  const allComments = mentorFeedback.allComments || [];

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300">
      
      {/* Header (Always Visible) */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FiMessageSquare className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Mentor Feedback
            </h3>
            <span className="text-xs text-brand-text-muted">Click to view comment threads</span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold text-brand-text block max-w-[200px] truncate">
              {latestFeedback}
            </span>
            <span className="text-[10px] text-brand-text-muted mt-0.5 block font-semibold">
              Date: {date}
            </span>
          </div>
          <div className="text-brand-text-muted">
            {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable Panel */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 space-y-4 animate-fade-in text-left">
          
          {/* Scroll List container */}
          <div className="max-h-60 overflow-y-auto space-y-3.5 pr-1 pt-2 custom-scrollbar">
            {allComments.length > 0 ? (
              allComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 hover:border-primary/20 transition-colors duration-300 relative text-left"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs font-extrabold text-brand-text">
                        {comment.author}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] font-bold uppercase select-none">
                        Mentor
                      </span>
                    </div>
                    <span className="text-[10px] text-brand-text-muted/60 font-semibold flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5" /> {comment.date}
                    </span>
                  </div>

                  <p className="text-xs text-brand-text-muted leading-relaxed pl-9">
                    {comment.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-brand-text-muted italic">
                No mentor feedback has been recorded yet.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default MentorFeedbackCard;
