import React, { useState } from 'react';
import { FiDownload, FiZoomIn, FiZoomOut, FiMaximize2, FiMaximize } from 'react-icons/fi';

const ReportViewer = ({ report = {} }) => {
  const [zoom, setZoom] = useState(100); // 80, 100, 120
  const [toast, setToast] = useState(null);

  const handleZoomIn = () => {
    if (zoom < 120) setZoom(zoom + 20);
  };

  const handleZoomOut = () => {
    if (zoom > 80) setZoom(zoom - 20);
  };

  const handleDownload = () => {
    setToast(`Downloading ${report.week || 'Report'} PDF document... (Mock Download)`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md w-full flex flex-col">
      {toast && (
        <div className="p-2.5 bg-emerald-500/15 border-b border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center animate-fade-in">
          {toast}
        </div>
      )}
      
      {/* Viewer toolbar */}
      <div className="px-5 py-3 border-b border-brand-border bg-slate-200/20 dark:bg-slate-800/10 flex items-center justify-between gap-4 select-none">
        
        {/* Document Title info */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-xs font-bold text-brand-text truncate max-w-[200px]">
            {report.week || 'Weekly Report'}.pdf
          </span>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-3">
          
          {/* Zoom controls */}
          <div className="flex items-center gap-1 border border-brand-border rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/30">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom === 80}
              className="p-1 rounded text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-40 focus:outline-none cursor-pointer"
              title="Zoom Out"
            >
              <FiZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-extrabold text-brand-text-muted px-1.5 w-10 text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom === 120}
              className="p-1 rounded text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-40 focus:outline-none cursor-pointer"
              title="Zoom In"
            >
              <FiZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:text-cyan-500 hover:bg-cyan-500/5 transition-all duration-300 focus:outline-none cursor-pointer"
            title="Download PDF"
          >
            <FiDownload className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Document View Sheet */}
      <div className="p-6 bg-slate-350 dark:bg-slate-950/60 overflow-auto h-96 flex items-start justify-center custom-scrollbar">
        <div 
          className="bg-white text-slate-800 rounded shadow-2xl p-8 max-w-xl w-full text-left transition-all duration-300 min-h-[400px] border border-slate-300 origin-top"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Document Content mockup */}
          <div className="space-y-6">
            
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-end">
              <div>
                <h1 className="text-base font-black uppercase tracking-tight text-slate-900">
                  Weekly Progress Report
                </h1>
                <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                  ProjectPilot Mentoring Network
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-600">
                {report.week || 'Sprint Summary'}
              </span>
            </div>

            {/* Meta data list */}
            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded border border-slate-200 font-semibold text-slate-700">
              <div>Team: <span className="text-slate-900">{report.teamName || 'Team Alpha'}</span></div>
              <div>Submitted: <span className="text-slate-900">{report.submittedDate || '2026-06-25'}</span></div>
              <div className="col-span-2">Project: <span className="text-slate-900">{report.projectName || 'Smart Project'}</span></div>
            </div>

            {/* Core Section 1 */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                1. Sprint Work Completed
              </h3>
              <p className="text-[10.5px] text-slate-600 leading-relaxed">
                During this cycle, our team established the primary schemas and wired mock interfaces. 
                Vite client compilation succeeded in production packaging. Basic hooks have been attached to the active router controllers. 
                We resolved several key component layering warnings by introducing dynamic height margins.
              </p>
            </div>

            {/* Core Section 2 */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                2. Sprints & Milestones
              </h3>
              <ul className="list-disc pl-4 text-[10.5px] text-slate-600 space-y-1">
                <li>Configured database tables and export controllers (100% Completed)</li>
                <li>Created sidebar menus and top navbars (100% Completed)</li>
                <li>Wired up detail score visualizers (60% In Progress)</li>
              </ul>
            </div>

            {/* Footer stamp */}
            <div className="pt-8 border-t border-slate-200 text-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">
                ProjectPilot Verified Document
              </span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportViewer;
