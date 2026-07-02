import React, { useState } from 'react';
import { FiFileText, FiChevronDown, FiChevronUp, FiDownload, FiCheckCircle, FiClock, FiEye } from 'react-icons/fi';

const WeeklyReportCard = ({ weeklyReports = [], projectStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState(null);

  // Find latest report submission
  const latestReport = weeklyReports[weeklyReports.length - 1] || {};

  const handleDownload = (report) => {
    setToast(`Downloading Weekly Report: ${report.week} - File: ${report.fileName || 'report.pdf'}`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleViewFile = (report) => {
    setToast(`Viewing Document: ${report.fileName || 'report.pdf'}`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300 h-full flex flex-col justify-between">
      {toast && (
        <div className="p-3 bg-emerald-500/15 border-b border-brand-border/40 text-emerald-500 text-xs font-semibold text-center animate-fade-in w-full">
          {toast}
        </div>
      )}
      <div>
        {/* Header (Always Visible) */}
        <div 
          onClick={() => setExpanded(!expanded)}
          className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FiFileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
                Weekly Reports
              </h3>
              <span className="text-xs text-brand-text-muted">Click to view report uploads</span>
            </div>
          </div>

          {/* Right Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-brand-text block">
                {latestReport.week || 'Week 1'}
              </span>
              <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase border ${
                latestReport.submissionStatus === 'Submitted' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {latestReport.submissionStatus || 'Pending'}
              </span>
            </div>
            <div className="text-brand-text-muted">
              {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Expandable Panel */}
        {expanded && (
          <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 space-y-4 animate-fade-in max-h-[300px] overflow-y-auto custom-scrollbar text-left">
            
            {/* Scroll List */}
            <div className="space-y-3 pt-2">
              {weeklyReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between hover:border-primary/20 transition-all duration-300"
                >
                  {/* Details */}
                  <div className="space-y-1 text-left flex-grow">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-brand-text">
                        {report.week}
                      </h4>
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold border ${
                        report.submissionStatus === 'Submitted'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {report.submissionStatus === 'Submitted' ? <FiCheckCircle className="w-2.5 h-2.5" /> : <FiClock className="w-2.5 h-2.5" />}
                        <span>{report.submissionStatus}</span>
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-brand-text-muted">
                      {report.remarks}
                    </p>
                    
                    <span className="text-[9px] text-brand-text-muted/40 font-semibold block">
                      Submitted Date: {report.submittedDate}
                    </span>
                    {report.fileName && (
                      <span className="text-[9px] text-primary font-bold block mt-1">
                        Attachment: {report.fileName} ({report.fileSize || 'N/A'})
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {report.submissionStatus === 'Submitted' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleViewFile(report)}
                        className="p-2 rounded-lg border border-brand-border text-brand-text-muted hover:text-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                        title="View Document"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(report)}
                        className="p-2 rounded-lg border border-brand-border text-brand-text-muted hover:text-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                        title="Download Report"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReportCard;
