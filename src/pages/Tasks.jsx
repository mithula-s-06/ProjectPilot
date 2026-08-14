import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCheck, FiClock, FiUser, FiFileText, FiTrash2 } from 'react-icons/fi';
import { api, addNotification } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';

const Tasks = ({ project, teamName, projects = [], onUpdateTasks }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedModalProject, setSelectedModalProject] = useState(project || projects[0] || null);

  // Confirmation modal state
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary',
    onConfirm: () => {},
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDownload = async (reportDetails) => {
    const titleText = reportDetails.week || reportDetails.title || 'Progress Update';
    const fileName = reportDetails.fileName || 'report.pdf';
    showToast(`Downloading Report: ${titleText} - File: ${fileName}`, 'success');

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

  useEffect(() => {
    if (modalOpen) {
      setSelectedModalProject(project || projects[0] || null);
    }
  }, [modalOpen, project, projects]);

  useEffect(() => {
    let active = true;
    const loadMembers = async () => {
      try {
        const activeTeamName = selectedModalProject?.teamName || teamName;
        if (!activeTeamName || activeTeamName === 'Not Assigned') return;

        const fetchedUsers = await api.listUsers() || [];
        if (!active) return;
        
        let databaseTeams = [];
        try {
          databaseTeams = await api.listTeams() || [];
        } catch (dbErr) {
          console.warn('Failed to load teams list in Tasks:', dbErr);
        }

        const matchedDbTeam = databaseTeams.find(dt => dt.name && dt.name.toLowerCase() === activeTeamName.toLowerCase());
        const dbLeaderName = matchedDbTeam ? matchedDbTeam.leaderName : null;

        const isUserInTeam = (user, tName) => {
          if (!user || !user.team || !tName) return false;
          return user.team.split(',').map(t => t.trim().toLowerCase()).includes(tName.toLowerCase());
        };

        // Resolve Team Leader
        const leaderUser = fetchedUsers.find(u => 
          (u.role === 'TEAM_LEADER' && dbLeaderName && u.name && u.name.toLowerCase() === dbLeaderName.toLowerCase()) ||
          (u.role === 'TEAM_LEADER' && isUserInTeam(u, activeTeamName))
        );

        // Resolve other team members
        const otherTeamUsers = fetchedUsers.filter(u => 
          isUserInTeam(u, activeTeamName) && 
          (!leaderUser || u.id !== leaderUser.id)
        );

        const namesList = [];
        if (leaderUser) {
          namesList.push(leaderUser.name);
        }
        otherTeamUsers.forEach(u => {
          namesList.push(u.name);
        });

        setTeamMembers(namesList);
      } catch (err) {
        console.error('Failed to load team members in Tasks:', err);
      }
    };
    loadMembers();
    return () => {
      active = false;
    };
  }, [selectedModalProject, teamName]);

  const [tasks, setTasks] = useState(() => {
    if (project && project.tasks) {
      return project.tasks;
    }
    return [];
  });

  useEffect(() => {
    if (project && project.tasks) {
      setTasks(project.tasks);
    } else {
      setTasks([]);
    }
  }, [project]);

  const [formData, setFormData] = useState({
    name: '',
    student: '',
    priority: 'High',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    if (modalOpen && teamMembers.length > 0) {
      setFormData(prev => {
        if (prev.student && teamMembers.includes(prev.student)) {
          return prev;
        }
        return {
          ...prev,
          student: teamMembers[0]
        };
      });
    }
  }, [modalOpen, teamMembers]);

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

  const handleToggleStatus = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    let nextStatus = 'In Progress';
    if (task.status === 'Pending') nextStatus = 'In Progress';
    else if (task.status === 'In Progress') nextStatus = 'Completed';
    else nextStatus = 'Pending';

    setConfirmModalState({
      isOpen: true,
      title: 'Update Task Status?',
      message: `Do you want to change the status of "${task.name}" to "${nextStatus}"?`,
      confirmText: 'Update Status',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        const nextTasks = tasks.map(t => (t.id === id ? { ...t, status: nextStatus } : t));
        setTasks(nextTasks);
        if (onUpdateTasks && project) {
          onUpdateTasks(nextTasks, project.id);
        }
        showToast(`Task status updated to ${nextStatus}`, 'success');
      }
    });
  };

  const handleDeleteTask = (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const taskName = taskToDelete ? taskToDelete.name : 'this task';

    setConfirmModalState({
      isOpen: true,
      title: 'Delete Task?',
      message: `Are you sure you want to permanently delete "${taskName}"? This action cannot be undone.`,
      confirmText: 'Delete Task',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        try {
          if (project) {
            await api.deleteTask(project.id, id);
            const nextTasks = tasks.filter(t => t.id !== id);
            setTasks(nextTasks);
            if (onUpdateTasks) {
              onUpdateTasks(nextTasks, project.id);
            }
            showToast('Task deleted successfully!', 'success');
          }
        } catch (err) {
          console.error('Failed to delete task via API:', err);
          showToast('Failed to delete task. Please try again.', 'error');
        }
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.deadline) {
      showToast('Task Name and Deadline are required.', 'error');
      return;
    }

    if (formData.deadline < todayStr) {
      showToast('Task deadline cannot be in the past. Please select today or a future date.', 'error');
      return;
    }

    setConfirmModalState({
      isOpen: true,
      title: 'Assign New Task?',
      message: `Assign "${formData.name}" to ${formData.student || 'team member'} with due date ${formData.deadline}?`,
      confirmText: 'Assign Task',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        const newTask = {
          id: `tk-${Date.now()}`,
          name: formData.name,
          student: formData.student,
          priority: formData.priority,
          deadline: formData.deadline,
          status: 'Pending'
        };

        if (selectedModalProject && project && selectedModalProject.id === project.id) {
          const nextTasks = [...tasks, newTask];
          setTasks(nextTasks);
        }
        
        if (onUpdateTasks && selectedModalProject) {
          const nextTasks = [...(selectedModalProject.tasks || []), newTask];
          onUpdateTasks(nextTasks, selectedModalProject.id);
        }

        try {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const studentUser = registeredUsers.find(u => 
            u.name?.trim().toLowerCase() === formData.student?.trim().toLowerCase() || 
            u.fullName?.trim().toLowerCase() === formData.student?.trim().toLowerCase()
          );
          const studentEmail = studentUser ? studentUser.email : null;
          const studentTeam = studentUser ? studentUser.team : (selectedModalProject ? selectedModalProject.teamName : null);
          if (studentEmail) {
            addNotification(
              'New Task Assigned',
              `Task "${formData.name}" has been assigned to you.`,
              studentEmail,
              studentTeam,
              'info'
            );
          }
        } catch (err) {
          console.error('Failed to dispatch task assignment notification:', err);
        }

        showToast('Task assigned successfully!', 'success');
        setModalOpen(false);
        setFormData({ name: '', student: '', priority: 'High', deadline: '', description: '' });
      }
    });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'Medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Low':
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Pending':
      default:
        return 'bg-slate-500/10 text-brand-text-muted border-brand-border';
    }
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
            Task Management
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Track daily work packages, check off development tickets, and monitor deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 inline-flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Grid of Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
          >
            {/* Top row */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(task.priority)}`}>
                  {task.priority} Priority
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${getStatusBadge(task.status)}`}
                  >
                    {task.status}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 text-brand-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete Task"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-brand-text leading-snug">
                {task.name}
              </h3>
            </div>

            {/* Bottom info */}
            <div className="mt-4 pt-3 border-t border-brand-border/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-brand-text-muted">
                <span className="flex items-center gap-1.5">
                  <FiUser className="w-3.5 h-3.5 text-primary" />
                  <strong className="text-brand-text">{task.student || 'Unassigned'}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <FiClock className="w-3.5 h-3.5 text-amber-500" />
                  {task.deadline}
                </span>
              </div>

              {task.reportDetails && (
                <div className="mt-2 pt-2 border-t border-brand-border/20">
                  <div className="p-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase">Attached Report:</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 font-bold border border-cyan-500/20">
                        {task.reportDetails.submissionStatus || 'Submitted'}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-text italic">
                      "{task.reportDetails.remarks}"
                    </p>
                    {(() => {
                       const files = task.reportDetails.files && Array.isArray(task.reportDetails.files) ? task.reportDetails.files : (
                         task.reportDetails.fileName ? [{
                           fileName: task.reportDetails.fileName,
                           fileSize: task.reportDetails.fileSize,
                           fileUrl: task.reportDetails.fileUrl,
                           fileId: task.reportDetails.fileId
                         }] : []
                       );
                       return files.map((file, idx) => (
                         <div key={idx} className="flex items-center justify-between pt-1 border-t border-brand-border/20 text-[10px] text-brand-text-muted mt-1.5">
                           <div className="flex items-center gap-1.5 truncate pr-2">
                             <FiFileText className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                             <span className="truncate max-w-[150px] font-semibold" title={file.fileName}>
                               {file.fileName}
                             </span>
                             <span className="text-[9px] text-brand-text-muted/65 shrink-0">({file.fileSize || 'N/A'})</span>
                           </div>
                           <button
                             type="button"
                             onClick={() => handleDownload(file)}
                             className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-brand-text uppercase transition-colors shrink-0 cursor-pointer"
                           >
                             Download
                           </button>
                         </div>
                       ));
                     })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Task Modal */}
      {modalOpen && (
        <>
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[450px] max-h-[90vh] overflow-y-auto rounded-2xl border border-brand-border bg-brand-card shadow-2xl p-6 z-50 text-left animate-scale-up custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-brand-border mb-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
                Assign Project Task
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 rounded-full border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {toast && toast.type === 'error' && (
              <div className="p-3 mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-semibold animate-fade-in">
                {toast.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {projects.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Select Project / Team</label>
                  <select
                    value={selectedModalProject?.id || ''}
                    onChange={(e) => {
                      const selectedProjId = e.target.value;
                      const matchedProj = projects.find(p => p.id === selectedProjId);
                      if (matchedProj) {
                        setSelectedModalProject(matchedProj);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="bg-brand-card">
                        {p.name} ({p.teamName || 'No Team'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Task Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Build integration test files"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Assign To</label>
                  <select
                    name="student"
                    value={formData.student}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    {teamMembers.map(m => (
                      <option key={m} value={m} className="bg-brand-card">{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    <option value="High" className="bg-brand-card">High</option>
                    <option value="Medium" className="bg-brand-card">Medium</option>
                    <option value="Low" className="bg-brand-card">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Task Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  min={todayStr}
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Task Description</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detail work package specs..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-brand-border mt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary transition-all duration-300 flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Assign Task</span>
                </button>
              </div>

            </form>
          </div>
        </>
      )}

      {/* Global Confirm Modal */}
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

export default Tasks;
