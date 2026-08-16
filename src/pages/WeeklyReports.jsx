import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCheck, FiFileText, FiUploadCloud, FiTrash2, FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { api, addNotification } from '../utils/api';
import { fileStorage } from '../utils/fileStorage';
import ConfirmModal from '../components/ConfirmModal';

const WeeklyReports = ({ project, projects = [], _teamName, onSubmitReport }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary',
    onConfirm: () => {},
  });
  const [reports, setReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    if (selectedProject && selectedProject.weeklyReports) {
      const mapped = selectedProject.weeklyReports.map((r, idx) => ({
        id: r.id || `rep-${idx}`,
        week: r.week || 'Week 1',
        title: r.title || r.remarks || 'Weekly progress report',
        submissionDate: r.submittedDate || '2026-06-21',
        status: r.submissionStatus || 'Submitted',
        reviewStatus: r.submissionStatus === 'Verified' || r.submissionStatus === 'Approved' ? 'Reviewed' : r.submissionStatus === 'Rejected' ? 'Rejected' : 'Pending',
        feedback: r.feedback || 'Awaiting feedback.',
        fileName: r.fileName,
        fileSize: r.fileSize,
        fileUrl: r.fileUrl,
        fileId: r.fileId,
        files: r.files
      }));
      // Sort reports by submission date or week descending so that most recent are first
      setReports(mapped.reverse());
      setCurrentPage(1);
    } else {
      setReports([]);
      setCurrentPage(1);
    }
  }, [selectedProject]);

  const [formData, setFormData] = useState({
    weekNumber: '',
    project: '',
    title: '',
    remarks: ''
  });

  useEffect(() => {
    if (selectedProject) {
      setFormData(prev => ({ ...prev, project: selectedProject.name }));
    } else if (projects && projects.length > 0) {
      setFormData(prev => ({ ...prev, project: projects[0].name }));
    }
  }, [selectedProject, projects]);
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

  const [selectedFiles, setSelectedFiles] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isTeamLeader = currentUser.role === 'Team Leader';

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.weekNumber.trim()) {
      showToast('Week Number is required.', 'error');
      return;
    }
    if (!formData.title.trim()) {
      showToast('Report Title is required.', 'error');
      return;
    }
    if (selectedFiles.length === 0 && existingFiles.length === 0) {
      showToast('Please upload or keep at least one report document.', 'error');
      return;
    }

    try {
      setUploading(true);

      const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
        if (file instanceof File) {
          try {
            const res = await api.uploadFile(file);
            await fileStorage.saveFile(res.id, file);
            return {
              fileName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              fileUrl: res.fileUrl,
              fileId: res.id
            };
          } catch (uploadErr) {
            console.warn('Backend upload failed for file:', file.name, uploadErr);
            const localId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            await fileStorage.saveFile(localId, file);
            return {
              fileName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              fileUrl: `local-file:${localId}`,
              fileId: localId
            };
          }
        }
        return file;
      }));

      const finalFiles = [...existingFiles, ...uploadedFiles];

      setConfirmModalState({
        isOpen: true,
        title: editingReport ? 'Update Weekly Report?' : 'Submit Weekly Report?',
        message: editingReport 
          ? `Do you want to save changes to "${formData.title}"?`
          : `Do you want to submit "${formData.title}" for ${formData.weekNumber}?`,
        confirmText: editingReport ? 'Save Changes' : 'Submit Report',
        cancelText: 'Cancel',
        variant: 'primary',
        onConfirm: async () => {
          setConfirmModalState(prev => ({ ...prev, isOpen: false }));
          try {
            if (editingReport) {
              const updatedReport = {
                ...editingReport,
                week: formData.weekNumber,
                title: formData.title,
                remarks: formData.remarks || 'Weekly progress report',
                fileName: finalFiles[0]?.fileName || '',
                fileSize: finalFiles[0]?.fileSize || '',
                fileUrl: finalFiles[0]?.fileUrl || '#',
                fileId: finalFiles[0]?.fileId || null,
                files: finalFiles,
              };

              const updatedProj = await api.updateWeeklyReport(selectedProject.id, editingReport.id, updatedReport);
              if (updatedProj) {
                setSelectedProject(updatedProj);
                await recalculateMemberMetrics(updatedProj);
                const stored = localStorage.getItem('projects');
                if (stored) {
                  const allProj = JSON.parse(stored);
                  const nextAllProj = allProj.map(p => p.id === updatedProj.id ? updatedProj : p);
                  localStorage.setItem('projects', JSON.stringify(nextAllProj));
                  window.dispatchEvent(new Event('storage'));
                }
                showToast('Report updated successfully!', 'success');
              }
            } else {
              const newReport = {
                id: `rep-${Date.now()}`,
                week: formData.weekNumber,
                title: formData.title,
                remarks: formData.remarks || 'Weekly progress report',
                submissionStatus: 'Submitted',
                submittedDate: new Date().toISOString().split('T')[0],
                fileName: finalFiles[0]?.fileName || '',
                fileSize: finalFiles[0]?.fileSize || '',
                fileUrl: finalFiles[0]?.fileUrl || '#',
                fileId: finalFiles[0]?.fileId || null,
                files: finalFiles,
                feedback: 'Awaiting feedback.'
              };

              const targetProject = (projects || []).find(p => p.name === formData.project) || selectedProject || project;
              const targetProjectId = targetProject ? targetProject.id : (project ? project.id : null);

              if (onSubmitReport && targetProjectId) {
                onSubmitReport(targetProjectId, newReport);
                if (selectedProject && selectedProject.id === targetProjectId) {
                  const currentWeeklyReports = selectedProject.weeklyReports || [];
                  const updatedWeeklyReports = [...currentWeeklyReports, newReport];
                  selectedProject.weeklyReports = updatedWeeklyReports;
                  setSelectedProject({ ...selectedProject });
                }
              } else {
                setReports(prev => [newReport, ...prev]);
                if (selectedProject) {
                  const currentWeeklyReports = selectedProject.weeklyReports || [];
                  selectedProject.weeklyReports = [...currentWeeklyReports, newReport];
                  setSelectedProject({ ...selectedProject });
                }
              }

              // Send notification to Mentor & Team
              try {
                const targetTeamName = targetProject ? targetProject.teamName : _teamName;
                const mentorName = targetProject ? targetProject.mentor : null;
                if (mentorName && mentorName !== 'Not Assigned') {
                  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                  const mentorUser = registeredUsers.find(u => 
                    (u.role === 'Mentor' || u.role === 'MENTOR') && 
                    (u.fullName?.trim().toLowerCase() === mentorName.trim().toLowerCase() || u.name?.trim().toLowerCase() === mentorName.trim().toLowerCase())
                  );
                  if (mentorUser && mentorUser.email) {
                    addNotification(
                      'New Report Uploaded',
                      `Team "${targetTeamName}" uploaded a weekly report "${formData.title}" for ${formData.weekNumber}.`,
                      mentorUser.email,
                      targetTeamName,
                      'info'
                    );
                  }
                }
                if (targetTeamName) {
                  addNotification(
                    'Weekly Report Submitted',
                    `Weekly report "${formData.title}" for ${formData.weekNumber} has been submitted for mentor review.`,
                    null,
                    targetTeamName,
                    'info'
                  );
                }
              } catch (notifErr) {
                console.warn('Failed to dispatch weekly report notification:', notifErr);
              }

              showToast('Report submitted successfully!', 'success');
            }
            setModalOpen(false);
            setSelectedFiles([]);
            setEditingReport(null);
            setExistingFiles([]);
            setFormData({ weekNumber: '', project: selectedProject ? selectedProject.name : '', title: '', remarks: '' });
          } catch (err) {
            console.error('Failed to submit/update report:', err);
            showToast('Failed to save the weekly report. Please try again.', 'error');
          }
        }
      });
    } catch (uploadErr) {
      console.error('Weekly report file upload failed:', uploadErr);
      showToast('Failed to upload the file to the server. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (rep) => {
    const matchedRep = selectedProject.weeklyReports?.find(r => r.id === rep.id);
    if (!matchedRep) return;

    setEditingReport(matchedRep);
    setExistingFiles(matchedRep.files && Array.isArray(matchedRep.files) ? matchedRep.files : (matchedRep.fileName ? [{
      fileId: matchedRep.fileId,
      fileName: matchedRep.fileName,
      fileSize: matchedRep.fileSize,
      fileUrl: matchedRep.fileUrl
    }] : []));

    setFormData({
      weekNumber: matchedRep.week || '',
      project: selectedProject ? selectedProject.name : '',
      title: matchedRep.title || '',
      remarks: matchedRep.remarks || ''
    });
    setSelectedFiles([]);
    setModalOpen(true);
  };

  const recalculateMemberMetrics = async (proj) => {
    if (!proj || !proj.tasks || !proj.teamName) return;
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const teamUsers = registeredUsers.filter(u => {
        if (!u.team) return false;
        const userTeams = u.team.split(',').map(t => t.trim().toLowerCase());
        return userTeams.includes(proj.teamName.toLowerCase());
      });

      for (const member of teamUsers) {
        const studentName = member.fullName || member.name;
        const studentEmail = member.email;
        
        let memberCommits = 0;
        let memberPRs = 0;
        proj.tasks.forEach(t => {
          if (t.student && t.student.toLowerCase() === studentName.toLowerCase()) {
            if (t.reportDetails) {
              memberCommits += parseInt(t.reportDetails.commitsCount || 0, 10);
              memberPRs += parseInt(t.reportDetails.prsCount || 0, 10);
            }
          }
        });

        try {
          await api.saveOrUpdateMemberMetric({
            memberName: studentName,
            memberEmail: studentEmail,
            teamName: proj.teamName,
            commitsCount: memberCommits,
            prsCount: memberPRs
          });
        } catch (metricErr) {
          console.warn('Failed to save individual member metrics for ' + studentName, metricErr);
        }
      }
    } catch (e) {
      console.warn('Failed to recalculate member metrics:', e);
    }
  };

  const handleDeleteReport = (reportId) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Delete Weekly Report',
      message: 'Are you sure you want to delete this weekly report? This action cannot be undone and will delete all files associated with it.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        try {
          const updatedProj = await api.deleteWeeklyReport(selectedProject.id, reportId);
          if (updatedProj) {
            setSelectedProject(updatedProj);
            await recalculateMemberMetrics(updatedProj);
            const stored = localStorage.getItem('projects');
            if (stored) {
              const allProj = JSON.parse(stored);
              const nextAllProj = allProj.map(p => p.id === updatedProj.id ? updatedProj : p);
              localStorage.setItem('projects', JSON.stringify(nextAllProj));
              window.dispatchEvent(new Event('storage'));
            }
            showToast('Weekly report deleted successfully.');
          }
        } catch (err) {
          console.error('Failed to delete report:', err);
          showToast('Failed to delete weekly report. Please try again.', 'error');
        }
      }
    });
  };

  const handleDownload = async (report) => {
    const titleText = report.week || report.title || 'Weekly Report';
    const fileName = report.fileName || 'report.pdf';
    showToast(`Downloading Report: ${titleText} - File: ${fileName}`, 'success');

    const fileUrl = report.fileUrl;
    const fileId = report.fileId;

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
      const content = `ProjectPilot Weekly Report Document\n\nFile Name: ${fileName}\nReport Subject: ${titleText}\nRemarks: ${report.remarks || 'No remarks provided.'}\n\nThis is a plain page document generated for the weekly report.\n\nCreated on: ${new Date().toLocaleDateString()}`;
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

  // Pagination calculation
  const itemsPerPage = 10;
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [reports.length, totalPages, currentPage]);

  const paginatedReports = reports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!selectedProject) {
    return (
      <div className="space-y-6 w-full text-left animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Team Projects
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Select a project below to view its weekly reports.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-brand-border bg-brand-card/20 text-brand-text-muted text-sm font-semibold select-none">
            No projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-brand-text tracking-tight">
                    {proj.name}
                  </h3>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                      {proj.domain}
                    </span>
                    <span className="text-[10px] font-bold text-brand-text-muted block">
                      Team Name: {proj.teamName || 'Not Assigned'}
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted/80 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border/40 mt-4 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    proj.status === 'Completed'
                      ? 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    {proj.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(proj)}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 cursor-pointer"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-left relative animate-fade-in">
      {/* Back button */}
      <button
        type="button"
        onClick={() => setSelectedProject(null)}
        className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer mb-2"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Projects</span>
      </button>

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
            onClick={() => {
              setEditingReport(null);
              setExistingFiles([]);
              setFormData({
                weekNumber: '',
                project: selectedProject ? selectedProject.name : '',
                title: '',
                remarks: ''
              });
              setSelectedFiles([]);
              setModalOpen(true);
            }}
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
          {paginatedReports.length > 0 ? (
            paginatedReports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md hover:border-primary/20 transition-all duration-300 flex flex-col gap-4 text-left animate-fade-in"
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

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                      rep.reviewStatus === 'Reviewed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                    }`}>
                      {rep.reviewStatus}
                    </span>
                    {isTeamLeader && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditClick(rep)}
                          className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                          title="Edit Weekly Report"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReport(rep.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                          title="Delete Weekly Report"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Render attachments */}
                {(() => {
                  const files = rep.files && Array.isArray(rep.files) ? rep.files : (
                    rep.fileName ? [{
                      fileName: rep.fileName,
                      fileSize: rep.fileSize,
                      fileUrl: rep.fileUrl,
                      fileId: rep.fileId
                    }] : []
                  );
                  return (
                    <div className="space-y-2.5">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-slate-50/10 dark:bg-slate-900/5 text-xs">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <FiFileText className="w-4.5 h-4.5 text-primary shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-brand-text block text-left truncate max-w-[200px]" title={file.fileName}>
                                {file.fileName}
                              </span>
                              <span className="text-[10px] text-brand-text-muted block text-left shrink-0">
                                {file.fileSize || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(file)}
                            className="px-3.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0"
                          >
                            View Document
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}

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
            ))
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-brand-border bg-brand-card/20 text-brand-text-muted text-sm font-semibold select-none">
              No weekly reports submitted yet for this project.
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-brand-border/20 select-none">
              {/* Prev Button */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={`p-2 rounded-lg border font-bold text-xs transition-all duration-300 flex items-center justify-center focus:outline-none ${
                  currentPage === 1
                    ? 'border-brand-border text-brand-text-muted/40 cursor-not-allowed opacity-50'
                    : 'border-brand-border text-brand-text hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                }`}
                title="Previous Page"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg border font-extrabold text-xs transition-all duration-300 flex items-center justify-center focus:outline-none cursor-pointer ${
                    currentPage === page
                      ? 'border-primary bg-primary text-white shadow-glow-primary'
                      : 'border-brand-border text-brand-text hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={`p-2 rounded-lg border font-bold text-xs transition-all duration-300 flex items-center justify-center focus:outline-none ${
                  currentPage === totalPages
                    ? 'border-brand-border text-brand-text-muted/40 cursor-not-allowed opacity-50'
                    : 'border-brand-border text-brand-text hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                }`}
                title="Next Page"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Report Modal */}
      {modalOpen && (
        <>
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[450px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 z-50 text-left animate-scale-up custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                {editingReport ? 'Edit Weekly Sprint Report' : 'Submit Weekly Sprint Report'}
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
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    {projects && projects.length > 0 ? (
                      projects.map(p => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))
                    ) : (
                      <option value={project ? project.name : ''}>
                        {project ? project.name : 'No Projects'}
                      </option>
                    )}
                  </select>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Upload Report Documents</label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('weekly-file-upload').click()}
                  className="border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 rounded-xl p-5 text-center transition-all duration-300 relative cursor-pointer"
                >
                  <input
                    type="file"
                    id="weekly-file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  <div className="cursor-pointer space-y-2 block">
                    <FiUploadCloud className="w-8 h-8 mx-auto text-slate-400" />
                    <div className="text-xs font-semibold text-slate-700">
                      <span>Drag & drop files here, or <span className="text-primary hover:underline">browse</span></span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Supports PDF, Documents, Sheets, Images or ZIP (Max 50MB)
                    </p>
                  </div>
                </div>

                {/* List of existing uploaded files (for edit mode) */}
                {editingReport && existingFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Keep Existing Files</span>
                    {existingFiles.map((file, index) => (
                      <div key={`existing-${index}`} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FiFileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate text-slate-700 font-medium" title={file.fileName}>
                            {file.fileName}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({file.fileSize || 'N/A'})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setExistingFiles(prev => prev.filter((_, idx) => idx !== index)); 
                          }}
                          className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                          title="Remove file"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* List of uploaded files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FiFileText className="w-4 h-4 text-cyan-500 shrink-0" />
                          <span className="truncate text-slate-700 font-medium" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }}
                          className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                          title="Remove file"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  disabled={uploading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary transition-all duration-300 flex items-center gap-1.5 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Uploading File...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      <span>{editingReport ? 'Save Changes' : 'Submit Report'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </>
      )}

      {/* Global Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        cancelText={confirmModalState.cancelText}
        variant={confirmModalState.variant}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};

export default WeeklyReports;
