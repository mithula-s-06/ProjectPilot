import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCheck, FiClock, FiUser, FiFileText, FiTrash2, FiEdit, FiArrowLeft, FiLink, FiPaperclip, FiUpload } from 'react-icons/fi';
import { api, addNotification } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import { fileStorage } from '../utils/fileStorage';

const Tasks = ({ project, teamName, projects = [], onUpdateTasks }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedModalProject, setSelectedModalProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

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
    let active = true;
    const loadMembers = async () => {
      try {
        const activeTeamName = selectedProject?.teamName || teamName;
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
  }, [selectedProject, teamName]);

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (selectedProject) {
      setTasks(selectedProject.tasks || []);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  const [formData, setFormData] = useState({
    name: '',
    student: '',
    priority: 'High',
    deadline: '',
    description: '',
    taskType: 'Feature'
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [referenceLinks, setReferenceLinks] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [uploading, setUploading] = useState(false);

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
          if (selectedProject) {
            await api.deleteTask(selectedProject.id, id);
            const nextTasks = tasks.filter(t => t.id !== id);
            setTasks(nextTasks);
            selectedProject.tasks = nextTasks;
            setSelectedProject({ ...selectedProject });
            if (onUpdateTasks) {
              onUpdateTasks(nextTasks, selectedProject.id);
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

  const handleEditClick = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      student: task.student || '',
      priority: task.priority || 'High',
      deadline: task.deadline || '',
      description: task.description || '',
      taskType: task.taskType || 'Feature'
    });
    setExistingDocuments(task.documents || []);
    setReferenceLinks(task.referenceLinks || []);
    setSelectedFiles([]);
    setLinkInput('');
    setSelectedModalProject(selectedProject || projects.find(p => p.id === task.projectId) || projects[0]);
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTask(null);
    setFormData({
      name: '',
      student: teamMembers[0] || '',
      priority: 'High',
      deadline: '',
      description: '',
      taskType: 'Feature'
    });
    setExistingDocuments([]);
    setReferenceLinks([]);
    setSelectedFiles([]);
    setLinkInput('');
    setSelectedModalProject(selectedProject || projects[0]);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.deadline) {
      showToast('Task Name and Deadline are required.', 'error');
      return;
    }

    if (!editingTask && formData.deadline < todayStr) {
      showToast('Task deadline cannot be in the past. Please select today or a future date.', 'error');
      return;
    }

    const actionTitle = editingTask ? 'Save Task Changes?' : 'Assign New Task?';
    const actionMessage = editingTask
      ? `Do you want to save changes for "${formData.name}"?`
      : `Assign "${formData.name}" to ${formData.student || 'team member'} with due date ${formData.deadline}?`;
    const actionConfirmText = editingTask ? 'Save Changes' : 'Assign Task';

    setConfirmModalState({
      isOpen: true,
      title: actionTitle,
      message: actionMessage,
      confirmText: actionConfirmText,
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        
        // Upload newly selected files
        let uploadedDocs = [];
        if (selectedFiles.length > 0) {
          setUploading(true);
          try {
            uploadedDocs = await Promise.all(selectedFiles.map(async (file) => {
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
                console.warn('Task file upload failed:', file.name, uploadErr);
                const localId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                await fileStorage.saveFile(localId, file);
                return {
                  fileName: file.name,
                  fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                  fileUrl: `local-file:${localId}`,
                  fileId: localId
                };
              }
            }));
          } catch (err) {
            console.error('Task uploads failed:', err);
          } finally {
            setUploading(false);
          }
        }

        const mergedDocuments = [...existingDocuments, ...uploadedDocs];

        let nextTasks;
        if (editingTask) {
          nextTasks = tasks.map(t =>
            t.id === editingTask.id ? {
              ...t,
              name: formData.name,
              student: formData.student,
              priority: formData.priority,
              deadline: formData.deadline,
              description: formData.description,
              taskType: formData.taskType || 'Feature',
              documents: mergedDocuments,
              referenceLinks: referenceLinks
            } : t
          );
          showToast('Task updated successfully!', 'success');
        } else {
          const newTask = {
            id: `tk-${Date.now()}`,
            name: formData.name,
            student: formData.student,
            priority: formData.priority,
            deadline: formData.deadline,
            status: 'In Progress',
            description: formData.description,
            taskType: formData.taskType || 'Feature',
            documents: mergedDocuments,
            referenceLinks: referenceLinks
          };
          nextTasks = [...tasks, newTask];

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
        }

        setTasks(nextTasks);
        if (onUpdateTasks && selectedModalProject) {
          onUpdateTasks(nextTasks, selectedModalProject.id);
        }

        setModalOpen(false);
        setEditingTask(null);
        setFormData({ name: '', student: '', priority: 'High', deadline: '', description: '', taskType: 'Feature' });
        setExistingDocuments([]);
        setReferenceLinks([]);
        setSelectedFiles([]);
        setLinkInput('');
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
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Rejected & Reassigned':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'In Progress':
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
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

  if (!selectedProject) {
    return (
      <div className="space-y-6 w-full text-left animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Team Projects
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Select a project below to view its tasks.
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
                    View Tasks
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
            Task Management
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Track daily work packages, check off development tickets, and monitor deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateClick}
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
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${getStatusBadge(resolveStatus(task))}`}
                  >
                    {resolveStatus(task)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleEditClick(task)}
                    className="p-1.5 rounded-lg border border-transparent hover:border-primary/20 text-brand-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    <FiEdit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 text-brand-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-brand-text leading-snug">
                  {task.name}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                  task.taskType === 'Bug' 
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                    : task.taskType === 'Feature'
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : task.taskType === 'Research'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : task.taskType === 'Documentation'
                    ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {task.taskType || 'Feature'}
                </span>
              </div>
              
              {task.description && (
                <p className="text-[11px] text-brand-text-muted leading-relaxed font-medium">
                  {task.description}
                </p>
              )}

              {/* Task Resources */}
              {((task.documents && task.documents.length > 0) || (task.referenceLinks && task.referenceLinks.length > 0)) && (
                <div className="pt-2 border-t border-brand-border/20 space-y-1.5">
                  {task.documents && task.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] text-brand-text-muted">
                      <span className="flex items-center gap-1.5 truncate max-w-[150px] font-semibold">
                        <FiFileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        {doc.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-brand-text uppercase transition-colors cursor-pointer"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                  {task.referenceLinks && task.referenceLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-brand-text-muted">
                      <FiLink className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold truncate block max-w-[200px]" title={link}>
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
              )}
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
                {editingTask ? 'Edit Project Task' : 'Assign Project Task'}
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
              {projects.length > 0 && !editingTask && (
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
                  min={editingTask ? undefined : todayStr}
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Task Type</label>
                <select
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                >
                  <option value="Feature" className="bg-brand-card">Feature Development</option>
                  <option value="Bug" className="bg-brand-card">Bug Fix</option>
                  <option value="Research" className="bg-brand-card">Research / Study</option>
                  <option value="Documentation" className="bg-brand-card">Documentation</option>
                  <option value="Testing" className="bg-brand-card">Testing & QA</option>
                </select>
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

              {/* Task Documents Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                  Task Documents
                </label>
                
                {/* Existing attached documents */}
                {existingDocuments.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {existingDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-brand-border bg-slate-100/50 dark:bg-slate-900/10 text-xs">
                        <span className="text-brand-text font-semibold flex items-center gap-1.5 truncate max-w-[280px]">
                          <FiFileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          {doc.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setExistingDocuments(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Newly selected files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-brand-border bg-emerald-500/5 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 truncate max-w-[280px]">
                          <FiUpload className="w-3.5 h-3.5 flex-shrink-0 animate-bounce" />
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="file"
                    id="task-docs"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setSelectedFiles(prev => [...prev, ...newFiles]);
                      }
                    }}
                  />
                  <label
                    htmlFor="task-docs"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-brand-border hover:border-primary bg-slate-50/30 dark:bg-slate-900/10 text-brand-text-muted hover:text-brand-text text-xs font-bold cursor-pointer transition-colors"
                  >
                    <FiPaperclip className="w-4 h-4" />
                    <span>Upload Task Documents</span>
                  </label>
                </div>
              </div>

              {/* Task Reference Links */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                  Task Reference Links
                </label>

                {/* List of links */}
                {referenceLinks.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {referenceLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-brand-border bg-slate-100/50 dark:bg-slate-900/10 text-xs">
                        <span className="text-brand-text font-semibold flex items-center gap-1.5 truncate max-w-[280px]">
                          <FiLink className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                          <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">{link}</a>
                        </span>
                        <button
                          type="button"
                          onClick={() => setReferenceLinks(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://example.com/resource"
                    className="flex-1 px-4 py-2 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-slate-400 focus:outline-none focus:border-primary/50 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (linkInput.trim() && (linkInput.startsWith('http://') || linkInput.startsWith('https://'))) {
                        setReferenceLinks(prev => [...prev, linkInput.trim()]);
                        setLinkInput('');
                      } else {
                        showToast('Please enter a valid link starting with http:// or https://', 'error');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-brand-text font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
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
                  <span>{editingTask ? 'Save Changes' : 'Assign Task'}</span>
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
