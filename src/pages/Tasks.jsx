import React, { useState } from 'react';
import { FiPlus, FiX, FiCheck, FiClock, FiUser, FiFileText, FiTrash2 } from 'react-icons/fi';
import { api } from '../utils/api';

const Tasks = ({ project, teamName, projects = [], onUpdateTasks }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedModalProject, setSelectedModalProject] = useState(project || projects[0] || null);

  React.useEffect(() => {
    if (modalOpen) {
      setSelectedModalProject(project || projects[0] || null);
    }
  }, [modalOpen, project, projects]);

  React.useEffect(() => {
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

  React.useEffect(() => {
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

  React.useEffect(() => {
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
    const nextTasks = tasks.map(t => {
      if (t.id === id) {
        let nextStatus = 'In Progress';
        if (t.status === 'Pending') nextStatus = 'In Progress';
        else if (t.status === 'In Progress') nextStatus = 'Completed';
        else nextStatus = 'Pending';
        return { ...t, status: nextStatus };
      }
      return t;
    });

    setTasks(nextTasks);
    if (onUpdateTasks && project) {
      onUpdateTasks(nextTasks, project.id);
    }
  };

  const handleDeleteTask = async (id) => {
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.deadline) {
      showToast('Task Name and Deadline are required.', 'error');
      return;
    }

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

    showToast('Task assigned successfully!', 'success');
    setModalOpen(false);
    setFormData({ name: '', student: '', priority: 'High', deadline: '', description: '' });
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
            Assign project work packages, set priorities, and audit live workload executions.
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

      {/* Tasks listing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md hover:border-primary/20 hover:shadow-glow-primary/5 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3.5 text-left">
              
              {/* Header Title Row */}
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-extrabold text-brand-text leading-snug">
                  {task.name}
                </h4>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(task.id)}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase border cursor-pointer hover:brightness-110 transition-all select-none ${getStatusBadge(task.status)}`}
                  title="Click to toggle status"
                >
                  {task.status}
                </button>
              </div>

              {/* Assignee info */}
              <div className="flex items-center justify-between gap-2 text-xs text-brand-text-muted">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FiUser className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                  <span className="truncate">
                    Assigned: <strong className="text-brand-text">{task.student}</strong>
                  </span>
                </div>
                {(task.projectName || project?.name) && (
                  <span 
                    className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 truncate max-w-[150px] flex-shrink-0" 
                    title={task.projectName || project?.name}
                  >
                    {task.projectName || project?.name}
                  </span>
                )}
              </div>

              {/* Priority & Deadline tags */}
              <div className="flex items-center justify-between pt-1 border-t border-brand-border/40 text-brand-text-muted">
                <div className="flex items-center gap-4 text-[10px] font-semibold">
                  <span className={`px-2 py-0.2 rounded border uppercase font-extrabold ${getPriorityBadge(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5" /> Due: {task.deadline}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all duration-300 cursor-pointer"
                  title="Delete Task"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Submitted Report Details */}
              {task.reportSubmitted && task.reportDetails && (
                <div className="mt-3 p-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/20 space-y-2 text-[11px] text-left">
                  <div className="flex items-center justify-between gap-2 border-b border-brand-border/20 pb-1.5 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-500">
                      Submitted Report Details
                    </span>
                    <span className="text-[9px] text-brand-text-muted/65">
                      Date: {task.reportDetails.submittedDate || '2026-07-01'}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div>
                      <span className="font-bold text-brand-text block">Title: {task.reportDetails.week}</span>
                      <p className="text-brand-text-muted/80 leading-relaxed mt-0.5 whitespace-pre-line">
                        Remarks: {task.reportDetails.remarks}
                      </p>
                    </div>

                    {task.reportDetails.fileName && (
                      <div className="pt-1.5 flex items-center justify-between gap-4 border-t border-brand-border/10 mt-1.5">
                        <div className="flex items-center gap-1.5 text-brand-text-muted/90 truncate">
                          <FiFileText className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span className="truncate max-w-[180px] font-semibold">
                            {task.reportDetails.fileName}
                          </span>
                          <span className="text-[9px] text-brand-text-muted/50 shrink-0">
                            ({task.reportDetails.fileSize ? `${parseFloat(task.reportDetails.fileSize).toFixed(2)} MB` : '1.12 MB'})
                          </span>
                        </div>
                        <a
                          href={task.reportDetails.fileUrl || '#'}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-brand-text uppercase transition-colors shrink-0"
                          download
                        >
                          Download
                        </a>
                      </div>
                    )}
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
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[450px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 z-50 text-left animate-scale-up custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Assign Project Task
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 focus:outline-none cursor-pointer">
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Select Project / Team</label>
                  <select
                    value={selectedModalProject?.id || ''}
                    onChange={(e) => {
                      const selectedProjId = e.target.value;
                      const matchedProj = projects.find(p => p.id === selectedProjId);
                      if (matchedProj) {
                        setSelectedModalProject(matchedProj);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.teamName || 'No Team'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Task Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Build integration test files"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Assign To</label>
                  <select
                    name="student"
                    value={formData.student}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    {teamMembers.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Task Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Task Description</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detail work package specs..."
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
                  <span>Assign Task</span>
                </button>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default Tasks;
