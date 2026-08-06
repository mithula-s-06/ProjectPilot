import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCheck, FiFileText, FiCalendar, FiClock, FiUploadCloud, FiTrash2 } from 'react-icons/fi';

const WeeklyReports = ({ project, teamName, onSubmitReport }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [reports, setReports] = useState(() => {
    if (project && project.weeklyReports && project.weeklyReports.length > 0) {
      return project.weeklyReports.map((r, idx) => ({
        id: r.id || `rep-${idx}`,
        week: r.week || 'Week 1',
        title: r.title || r.remarks || 'Weekly progress report',
        submissionDate: r.submittedDate || '2026-06-21',
        status: r.submissionStatus || 'Submitted',
        reviewStatus: r.submissionStatus === 'Verified' || r.submissionStatus === 'Approved' ? 'Reviewed' : r.submissionStatus === 'Rejected' ? 'Rejected' : 'Pending',
        feedback: r.feedback || 'Awaiting feedback.',
        fileName: r.fileName,
        fileSize: r.fileSize,
        fileUrl: r.fileUrl
      }));
    }
    return [];
  });

  useEffect(() => {
    if (project && project.weeklyReports) {
      const mapped = project.weeklyReports.map((r, idx) => ({
        id: r.id || `rep-${idx}`,
        week: r.week || 'Week 1',
        title: r.title || r.remarks || 'Weekly progress report',
        submissionDate: r.submittedDate || '2026-06-21',
        status: r.submissionStatus || 'Submitted',
        reviewStatus: r.submissionStatus === 'Verified' || r.submissionStatus === 'Approved' ? 'Reviewed' : r.submissionStatus === 'Rejected' ? 'Rejected' : 'Pending',
        feedback: r.feedback || 'Awaiting feedback.',
        fileName: r.fileName,
        fileSize: r.fileSize,
        fileUrl: r.fileUrl
      }));
      setReports(mapped);
    }
  }, [project]);

  const [formData, setFormData] = useState({
    weekNumber: '',
    project: project ? project.name : 'My Project',
    title: '',
    remarks: ''
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (type === 'success') {
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (toast && toast.type === 'error') setToast(null);
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isTeamLeader = currentUser.role === 'Team Leader';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.weekNumber.trim()) {
      showToast('Week Number is required.', 'error');
      return;
    }
    if (!formData.title.trim()) {
      showToast('Report Title is required.', 'error');
      return;
    }
    if (!selectedFile) {
      showToast('Please upload a report document.', 'error');
      return;
    }

    const newReport = {
      id: `rep-${Date.now()}`,
      week: formData.weekNumber,
      title: formData.title,
      remarks: formData.remarks || 'Weekly progress report',
      submissionStatus: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      fileName: selectedFile.name,
      fileSize: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
      fileUrl: '#',
      feedback: 'Awaiting feedback.'
    };

    if (onSubmitReport && project) {
      onSubmitReport(project.id, newReport);
    } else {
      setReports(prev => [newReport, ...prev]);
    }

    showToast('Report submitted successfully!', 'success');
    setModalOpen(false);
    setSelectedFile(null);
    setFormData({ weekNumber: '', project: project ? project.name : 'My Project', title: '', remarks: '' });
  };

  return (
    <div className="space-y-6 w-full text-left relative animate-fade-in">
      {toast && toast.type === 'success' && (
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center justify-between animate-fade-in w-full">
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="text-brand-text-muted hover:text-brand-text ml-2">×</button>
        </div>
      )}
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Weekly Report Submissions
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Submit weekly sprint reports, track mentor review statuses, and read suggestions.
          </p>
        </div>

        {isTeamLeader && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 inline-flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer self-start sm:self-auto"
          >
            <FiPlus className="w-4 h-4" />
            <span>Submit Weekly Report</span>
          </button>
        )}
      </div>

      {/* Roster logs grid */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-text">
          Submission History Logs
        </h3>

        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md hover:border-primary/20 transition-all duration-300 flex flex-col gap-4 text-left"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-brand-text leading-snug">
                    {rep.week}: {rep.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-brand-text-muted/60 block">
                    Submitted: {rep.submissionDate}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                    rep.reviewStatus === 'Reviewed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                  }`}>
                    {rep.reviewStatus}
                  </span>
                </div>
              </div>

              {/* Document Link */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-slate-50/10 dark:bg-slate-900/5 text-xs">
                <div className="flex items-center gap-2">
                  <FiFileText className="w-4.5 h-4.5 text-primary" />
                  <div>
                    <span className="font-bold text-brand-text block text-left">
                      {rep.fileName || `${rep.week.replace(/\s+/g, '-').toLowerCase()}-sprint-report.pdf`}
                    </span>
                    <span className="text-[10px] text-brand-text-muted block text-left">
                      {rep.fileSize || '1.45 MB'}
                    </span>
                  </div>
                </div>
                <a
                  href={rep.fileUrl || '#'}
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(`Opening document: ${rep.fileName || `${rep.week.replace(/\s+/g, '-').toLowerCase()}-sprint-report.pdf`}`, 'success');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] uppercase tracking-wider transition-all duration-300"
                >
                  View Document
                </a>
              </div>

              {/* Feedback thread row */}
              <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 text-xs">
                <span className="text-[9px] font-bold text-brand-text-muted uppercase block mb-1">
                  Feedback Received
                </span>
                <p className="text-brand-text-muted leading-relaxed">
                  {rep.feedback}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Submit Report Modal */}
      {modalOpen && (
        <>
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[450px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 z-50 text-left animate-scale-up custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Submit Weekly Sprint Report
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {toast && toast.type === 'error' && (
              <div className="p-3 mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-semibold animate-fade-in">
                {toast.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Week Number</label>
                  <input
                    type="text"
                    name="weekNumber"
                    value={formData.weekNumber}
                    onChange={handleChange}
                    placeholder="e.g. Week 5"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Project</label>
                  <input
                    type="text"
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Report Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Sprint 5 API client integration verification"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              {/* Drag and Drop File Upload */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Upload Report Document</label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 rounded-xl p-5 text-center transition-all duration-300 relative cursor-pointer"
                >
                  <input
                    type="file"
                    id="weekly-file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="weekly-file-upload" className="cursor-pointer space-y-2 block">
                    <FiUploadCloud className="w-8 h-8 mx-auto text-slate-400" />
                    <div className="text-xs font-semibold text-slate-700">
                      {selectedFile ? (
                        <span className="text-primary font-bold">{selectedFile.name}</span>
                      ) : (
                        <span>Drag & drop a file here, or <span className="text-primary hover:underline">browse</span></span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Supports any document format {selectedFile && `(${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`}
                    </p>
                  </label>
                  
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                      title="Remove file"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Sprint Remarks</label>
                <textarea
                  name="remarks"
                  rows="2"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Provide comments for the mentor evaluation..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary transition-all duration-300 flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Submit Report</span>
                </button>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default WeeklyReports;
