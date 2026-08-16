import React, { useState, useMemo } from 'react';
import { FiArrowLeft, FiFileText, FiUser, FiClock, FiCheck, FiX, FiLink, FiDownload, FiLayers } from 'react-icons/fi';
import { api } from '../utils/api';

const Submissions = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast, setToast] = useState(null);

  // Load all projects and their tasks/reports directly from local storage/state
  const [projects, setProjects] = useState([]);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetched = await api.listProjects();
        // filter out combined fallback projects with commas
        const cleanList = (fetched || []).filter(p => 
          p.name && 
          (!p.teamName || !p.teamName.includes(','))
        );
        setProjects(cleanList);
      } catch (err) {
        console.error('Failed to load projects from backend in Submissions view:', err);
      }
    };
    fetchProjects();
  }, [selectedProject]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownload = async (file) => {
    const titleText = file.fileName || 'Attached Document';
    showToast(`Downloading: ${titleText}`);

    const fileUrl = file.fileUrl;
    const fileId = file.fileId;

    if (fileId || (fileUrl && fileUrl.startsWith('http'))) {
      try {
        const blob = await api.downloadFile(fileId || fileUrl);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (err) {
        console.error('Failed to download file from database:', err);
      }
    }

    if (fileUrl && fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        
        const blob = new Blob([uInt8Array], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Base64 parsing failed:', err);
      }
    }
  };

  const resolveStatus = (task) => {
    if (!task) return 'In Progress';
    if (task.reportSubmitted && task.reportDetails) {
      const repStatus = task.reportDetails.status || task.reportDetails.submissionStatus;
      if (repStatus === 'Approved') {
        return 'Completed';
      } else if (repStatus === 'Reassigned') {
        return 'Rejected & Reassigned';
      } else {
        return 'Under Review';
      }
    }
    if (task.isReassigned) {
      return 'Rejected & Reassigned';
    }
    if (!task.status || task.status === 'Pending') {
      return 'In Progress';
    }
    return task.status;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Rejected & Reassigned':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'In Progress':
      default:
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    }
  };

  // Get total submissions counts inside a project
  const getSubmissionsCount = (proj) => {
    return (proj.tasks || []).filter(t => t.reportSubmitted).length;
  };

  if (selectedProject) {
    const submissions = (selectedProject.tasks || []).filter(t => t.reportSubmitted);

    return (
      <div className="space-y-6 w-full text-left animate-fade-in pb-12">
        {/* Back button */}
        <button
          type="button"
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Projects list</span>
        </button>

        {/* Project Header details */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-2">
          <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block">
            {selectedProject.domain || 'Software Development'}
          </span>
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
            {selectedProject.name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-text-muted pt-2 border-t border-brand-border/40 mt-3 font-semibold">
            <span>Team Name: <strong className="text-brand-text">{selectedProject.teamName}</strong></span>
            <span>Mentor Assigned: <strong className="text-brand-text">{selectedProject.mentor || 'Not Assigned'}</strong></span>
            <span>Submissions: <strong className="text-brand-text">{submissions.length} total</strong></span>
          </div>
        </div>

        {toast && (
          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold animate-fade-in w-full">
            {toast}
          </div>
        )}

        {/* Submissions List */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
            Submitted Reports Board
          </h3>

          {submissions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-brand-border bg-brand-card/25 text-brand-text-muted text-sm font-semibold select-none">
              No reports submitted by team members yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map((task) => {
                const resolvedStatus = resolveStatus(task);
                const hasFeedback = task.isReassigned || resolvedStatus === 'Rejected & Reassigned' || resolvedStatus === 'Completed';
                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Title & Status */}
                      <div className="flex items-start justify-between gap-2 border-b border-brand-border/30 pb-2.5">
                        <div>
                          <h4 className="text-sm font-extrabold text-brand-text">
                            {task.name}
                          </h4>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-brand-text-muted font-bold mt-1 inline-block">
                            {task.taskType || 'Feature'}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getStatusBadgeClass(resolvedStatus)}`}>
                          {resolvedStatus}
                        </span>
                      </div>

                      {/* Submitted By and Date Info */}
                      <div className="flex items-center justify-between text-xs text-brand-text-muted">
                        <span className="flex items-center gap-1.5 font-bold">
                          <FiUser className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-brand-text">{task.student || 'Unassigned'}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-[10px]">
                          <FiClock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Submitted: {task.reportDetails?.submittedDate || task.assignedDate}</span>
                        </span>
                      </div>

                      {/* Description / Remarks */}
                      <div className="bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-xl border border-brand-border text-xs space-y-1.5 text-left">
                        <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider block">Student Remarks:</span>
                        <p className="text-brand-text leading-relaxed font-semibold italic">
                          "{task.reportDetails?.remarks || 'No detailed report description provided.'}"
                        </p>
                      </div>

                      {/* Documents & reference links */}
                      {((task.reportDetails?.fileName) || (task.documents && task.documents.length > 0) || (task.referenceLinks && task.referenceLinks.length > 0)) && (
                        <div className="pt-2.5 space-y-2 border-t border-brand-border/30">
                          <span className="text-[9px] font-extrabold text-brand-text-muted uppercase tracking-wider block">Attached Resources:</span>
                          
                          {/* Main uploaded report file */}
                          {task.reportDetails?.fileName && (
                            <div className="flex items-center justify-between p-2 rounded-lg border border-brand-border bg-cyan-500/5 text-[11px] font-semibold text-brand-text">
                              <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                                <FiFileText className="w-4 h-4 text-cyan-500 shrink-0" />
                                {task.reportDetails.fileName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDownload(task.reportDetails)}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-brand-text uppercase transition-colors shrink-0 cursor-pointer"
                              >
                                Download
                              </button>
                            </div>
                          )}

                          {/* Dynamic task files */}
                          {task.documents && task.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-brand-border bg-slate-50 dark:bg-slate-900/10 text-[11px] font-semibold text-brand-text">
                              <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                                <FiFileText className="w-4 h-4 text-primary shrink-0" />
                                {doc.fileName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDownload(doc)}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-brand-text uppercase transition-colors shrink-0 cursor-pointer"
                              >
                                Download
                              </button>
                            </div>
                          ))}

                          {/* Reference Links */}
                          {task.referenceLinks && task.referenceLinks.map((link, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-brand-text-muted">
                              <FiLink className="w-3.5 h-3.5 text-secondary shrink-0" />
                              <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold truncate block max-w-[250px]" title={link}>
                                {link}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Mentor Review details */}
                      {hasFeedback && (
                        <div className="pt-2.5 border-t border-brand-border/30 space-y-2">
                          <span className="text-[9px] font-extrabold text-brand-text-muted uppercase tracking-wider block">Mentor Review Feedback:</span>
                          <div className={`p-3 rounded-xl border ${
                            resolvedStatus === 'Completed'
                              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                              : 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400'
                          } text-xs font-semibold whitespace-pre-line`}>
                            {resolvedStatus === 'Completed'
                              ? 'Approved: The task has been successfully verified.'
                              : `Reassigned for Review: "${task.reassignFeedback || 'Please refine task implementation details.'}"`
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-left animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Submissions Registry
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Access all progress reports and documents uploaded by team members across all projects.
        </p>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const subCount = getSubmissionsCount(proj);
          return (
            <div
              key={proj.id}
              className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                  {proj.domain || 'Software Development'}
                </span>
                <h3 className="text-sm font-extrabold text-brand-text tracking-tight">
                  {proj.name}
                </h3>
                <div className="space-y-1.5 pt-2 border-t border-brand-border/40 text-[11px] text-brand-text-muted font-bold">
                  <div>Team Name: <span className="text-brand-text">{proj.teamName}</span></div>
                  <div>Mentor: <span className="text-brand-text">{proj.mentor || 'Not Assigned'}</span></div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <FiFileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-primary">{subCount} Submissions Uploaded</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border/40 mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProject(proj)}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 cursor-pointer"
                >
                  View Submissions
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Submissions;
