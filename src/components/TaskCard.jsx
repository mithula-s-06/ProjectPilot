import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiChevronDown, FiChevronUp, FiClock, FiAlertCircle, FiFileText, FiDownload, FiEdit, FiTrash2 } from 'react-icons/fi';
import { api } from '../utils/api';

const TaskCard = ({ initialTasks = [], onNavigateToSubmitReport, onNavigateToEditReport, onUpdateTasks }) => {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'In Progress', 'Completed'
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const toggleExpandTask = (taskId) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  };

  const handleDownload = async (reportDetails) => {
    const titleText = reportDetails.week || reportDetails.title || 'Progress Update';
    const fileName = reportDetails.fileName || 'report.pdf';
    setToast(`Downloading Report: ${titleText} - File: ${fileName}`);
    setTimeout(() => setToast(null), 3500);

    const fileUrl = reportDetails.fileUrl;
    const fileId = reportDetails.fileId;

    if (fileId || (fileUrl && fileUrl.startsWith('http'))) {
      try {
        const blob = await api.downloadFile(fileId || fileUrl);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (err) {
        console.error('Failed to download file from backend:', err);
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
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (err) {
        console.error('Failed to decode base64 file:', err);
      }
    }

    let blob;
    if (fileName.toLowerCase().endsWith('.pdf')) {
      const pdfString = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 150 >>\nstream\nBT\n/F1 16 Tf\n50 750 Td\n(ProjectPilot - Mock Document) Tj\n/F1 12 Tf\n0 -40 Td\n(File: ${fileName}) Tj\n0 -20 Td\n(Subject: ${titleText}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000313 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n514\n%%EOF`;
      blob = new Blob([pdfString], { type: 'application/pdf' });
    } else {
      const content = `ProjectPilot Report Document\n\nFile Name: ${fileName}\nReport Subject: ${titleText}\nDescription: ${reportDetails.description || 'No description provided.'}\n\nThis is a plain page document generated for the report.\n\nCreated on: ${new Date().toLocaleDateString()}`;
      blob = new Blob([content], { type: 'text/plain' });
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteReport = (taskId) => {
    setDeleteConfirm({
      type: 'report',
      message: 'Are you sure you want to delete this task report? This action cannot be undone.',
      onConfirm: () => {
        const updatedTasks = tasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              reportSubmitted: false,
              reportDetails: null,
              status: 'In Progress' // Reset status to In Progress
            };
          }
          return t;
        });
        setTasks(updatedTasks);
        if (onUpdateTasks) {
          onUpdateTasks(updatedTasks);
        }
        setToast("Task submission deleted successfully.");
        setTimeout(() => setToast(null), 3000);
      }
    });
  };

  const handleStatusChange = (taskId, newStatus) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          ...(newStatus === 'Completed' ? { isReassigned: false } : {})
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    if (onUpdateTasks) {
      onUpdateTasks(updatedTasks);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-rose-500 bg-rose-500/10 border border-rose-500/20';
      case 'Medium':
        return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
      case 'Low':
      default:
        return 'text-blue-500 bg-blue-500/10 border border-blue-500/20';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-emerald-500 bg-emerald-500/5';
      case 'In Progress':
        return 'text-blue-500 bg-blue-500/5';
      case 'Pending':
      default:
        return 'text-slate-500 bg-slate-50/5';
    }
  };

  // Filtered lists
  const filteredTasks = tasks.filter((t) => filter === 'All' || t.status === filter);
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300">
      {toast && (
        <div className="p-3 bg-emerald-500/15 border-b border-brand-border/40 text-emerald-500 text-xs font-semibold text-center animate-fade-in">
          {toast}
        </div>
      )}
      
      {/* Header (Always Visible) */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FiCheckSquare className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              My Tasks
            </h3>
            <span className="text-xs text-brand-text-muted">Click to manage task checkboards</span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-sm font-bold text-brand-text block">
              {completedCount} / {tasks.length} Completed
            </span>
            <div className="w-24 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${(completedCount / (tasks.length || 1)) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-brand-text-muted">
            {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable Panel */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 space-y-5 animate-fade-in text-left">
          
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {['All', 'Pending', 'In Progress', 'Completed'].map((opt) => {
              const count = opt === 'All' ? tasks.length : tasks.filter((t) => t.status === opt).length;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    filter === opt
                      ? 'bg-primary text-white shadow-md'
                      : 'border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {opt} ({count})
                </button>
              );
            })}
          </div>

          {/* Tasks List */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const isApproved = task.reportDetails?.status === 'Approved' || task.reportDetails?.approvalStatus === 'Approved' || task.reportDetails?.status === 'Verified';
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleExpandTask(task.id)}
                    className="p-3.5 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 hover:border-primary/20 hover:bg-slate-200/5 dark:hover:bg-slate-800/5 transition-all duration-300 flex flex-col gap-2 cursor-pointer select-none"
                  >
                    {/* Top Header & Details Section */}
                    <div className="w-full flex-grow space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <span className="text-xs font-bold leading-tight text-brand-text">
                          {task.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {task.isReassigned && (
                            <span className="px-2 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                              Task Reassigned
                            </span>
                          )}
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                          <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${getStatusClass(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Date and submit options footer row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-brand-border/40 text-[10px] text-brand-text-muted font-medium">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1">
                            <FiClock className="w-3.5 h-3.5" /> Assigned: {task.assignedDate}
                          </span>
                          <span className="flex items-center gap-1 text-rose-500/80">
                            <FiAlertCircle className="w-3.5 h-3.5" /> Due: {task.deadline}
                          </span>
                        </div>

                        {/* Submit Report Action button */}
                        {onNavigateToSubmitReport && task.status !== 'Completed' && !task.reportSubmitted && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToSubmitReport(task);
                            }}
                            className="inline-flex items-center gap-1 py-1 px-2.5 rounded bg-primary text-white font-extrabold text-[10px] uppercase tracking-wider hover:brightness-110 shadow hover:shadow-glow-primary transition-all duration-300 cursor-pointer"
                          >
                            <FiFileText className="w-3 h-3" />
                            <span>Submit Report</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Report Details */}
                    {expandedTaskId === task.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="w-full mt-2 p-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/20 space-y-2 animate-fade-in text-[11px] text-left cursor-default"
                      >
                        {task.isReassigned && (
                          <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-semibold mb-2">
                            ⚠️ This task was reassigned for review by the advisor. Reason: "{task.reassignFeedback || 'Please review recommendations.'}"
                          </div>
                        )}
                        {task.reportSubmitted && task.reportDetails ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-brand-border/30 pb-1.5 font-semibold text-brand-text-muted">
                              <span className="font-extrabold text-primary uppercase tracking-widest text-[9px]">
                                Submitted Report Details
                              </span>
                              <span>Date: {task.reportDetails.submittedDate}</span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-bold text-brand-text">
                                {task.reportDetails.week}
                              </div>
                              <p className="text-brand-text-muted leading-relaxed whitespace-pre-line">
                                {task.reportDetails.remarks}
                              </p>
                            </div>

                            {/* Render attachments & actions */}
                            {(() => {
                              const files = task.reportDetails.files && Array.isArray(task.reportDetails.files) ? task.reportDetails.files : (
                                task.reportDetails.fileName ? [{
                                  fileName: task.reportDetails.fileName,
                                  fileSize: task.reportDetails.fileSize,
                                  fileUrl: task.reportDetails.fileUrl,
                                  fileId: task.reportDetails.fileId
                                }] : []
                              );
                              return (
                                <div className="space-y-2 mt-2 pt-2 border-t border-brand-border/20">
                                  {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-1.5 text-brand-text font-semibold truncate pr-2 text-xs">
                                        <FiFileText className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                                        <span className="truncate max-w-[150px]" title={file.fileName}>
                                          {file.fileName}
                                        </span>
                                        <span className="text-[9px] text-brand-text-muted/65 shrink-0">({file.fileSize || 'N/A'})</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDownload(file)}
                                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-brand-text hover:text-primary hover:bg-primary/10 border border-brand-border transition-all duration-300 font-bold text-[9px] uppercase flex items-center gap-1 cursor-pointer shrink-0"
                                      >
                                        <FiDownload className="w-3 h-3" /> Download
                                      </button>
                                    </div>
                                  ))}
                                  
                                  {!isApproved && (
                                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-brand-border/10">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (onNavigateToEditReport) {
                                            onNavigateToEditReport(task);
                                          }
                                        }}
                                        className="px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 hover:text-blue-600 border border-blue-500/20 transition-all duration-300 font-bold text-[9px] uppercase flex items-center gap-1 cursor-pointer"
                                      >
                                        <FiEdit className="w-3 h-3" /> Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteReport(task.id)}
                                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all duration-300 font-bold text-[9px] uppercase flex items-center gap-1 cursor-pointer"
                                      >
                                        <FiTrash2 className="w-3 h-3" /> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="text-center py-2 text-brand-text-muted italic">
                            No report has been submitted for this task yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-brand-text-muted italic">
                No tasks match the selected filter.
              </div>
            )}
          </div>

        </div>
      )}
      
      {deleteConfirm && (
        <>
          <div 
            onClick={() => setDeleteConfirm(null)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] transition-opacity duration-300 animate-fade-in" 
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[400px] rounded-3xl border border-brand-border bg-brand-card shadow-2xl p-6 z-[10000] text-center animate-scale-up">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-brand-text">
                Confirm Deletion
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed max-w-xs">
                {deleteConfirm.message}
              </p>
              <div className="flex items-center gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-brand-border bg-brand-card text-brand-text font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConfirm.onConfirm();
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white hover:brightness-110 font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;
