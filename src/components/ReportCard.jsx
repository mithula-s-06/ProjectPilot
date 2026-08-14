import React from 'react';
import { FiCheckCircle, FiClock, FiFileText } from 'react-icons/fi';

const ReportCard = ({ report, onReview }) => {
  const getStatusBadge = (status) => {
    if (status === 'Reviewed') {
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  return (
    <div className="group p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-cyan-500/20 transition-all duration-300 text-left">
      
      {/* Details */}
      <div className="space-y-1.5 flex-grow">
        <div className="flex items-center gap-2.5">
          <h4 className="text-sm font-extrabold text-brand-text">
            {report.teamName}
          </h4>
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.2 rounded text-[9px] font-bold border uppercase select-none ${getStatusBadge(report.status)}`}>
            {report.status === 'Reviewed' ? <FiCheckCircle className="w-2.5 h-2.5" /> : <FiClock className="w-2.5 h-2.5" />}
            <span>{report.status}</span>
          </span>
        </div>
        
        <p className="text-xs text-brand-text-muted">
          Project: <strong className="text-brand-text">{report.projectName}</strong>
        </p>

        <div className="flex items-center gap-3 text-[10px] font-semibold text-brand-text-muted/60">
          <span className="flex items-center gap-1">
            <FiFileText className="w-3.5 h-3.5" /> {report.week}
          </span>
          <span>•</span>
          <span>Submitted: {report.submittedDate}</span>
        </div>

        {/* AI Integrity quick indicator */}
        <div className="mt-3 pt-2.5 border-t border-brand-border/20 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-extrabold uppercase text-brand-text-muted">Similarity:</span>
            <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded border ${
              (report.similarityScore || 0) >= 30 
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              {report.similarityScore || 0}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-extrabold uppercase text-brand-text-muted">AI Text:</span>
            <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded border ${
              (report.aiGeneratedScore || 0) >= 70 
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              {report.aiGeneratedScore || 0}%
            </span>
          </div>
          
          {((report.similarityScore || 0) >= 30 || (report.aiGeneratedScore || 0) >= 70) && (
            <span className="text-[8px] font-bold text-rose-500 animate-pulse">
              ⚠️ Plagiarism/AI Alert
            </span>
          )}
        </div>
      </div>

      {/* Button */}
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={onReview}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none cursor-pointer text-center ${
            report.status === 'Reviewed'
              ? 'border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
              : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white hover:shadow-glow-cyan/20'
          }`}
        >
          {report.status === 'Reviewed' ? 'View Review' : 'Review Report'}
        </button>
      </div>

    </div>
  );
};

export default ReportCard;
