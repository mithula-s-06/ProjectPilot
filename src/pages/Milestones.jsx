import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCheck, FiCalendar, FiFlag, FiTrash2, FiEdit, FiArrowLeft } from 'react-icons/fi';
import { addNotification } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';

const Milestones = ({ project, _teamName, projects = [], onUpdateMilestones }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);

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

  useEffect(() => {
    if (selectedProject) {
      setMilestones(selectedProject.milestones || []);
    } else {
      setMilestones([]);
    }
  }, [selectedProject]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    priority: 'High'
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

  const handleToggleStatus = (id) => {
    const ms = milestones.find(m => m.id === id);
    if (!ms) return;
    const isCompleted = ms.status === 'Completed';
    const nextStatus = isCompleted ? 'Pending' : 'Completed';
    const nextProgress = isCompleted ? 0 : 100;

    setConfirmModalState({
      isOpen: true,
      title: 'Update Milestone Status?',
      message: `Do you want to mark "${ms.name}" as ${nextStatus}?`,
      confirmText: 'Update Status',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        const nextMilestones = milestones.map(m =>
          m.id === id ? { ...m, status: nextStatus, progress: nextProgress } : m
        );
        setMilestones(nextMilestones);
        if (selectedProject) {
          selectedProject.milestones = nextMilestones;
          setSelectedProject({ ...selectedProject });
        }
        if (onUpdateMilestones && selectedProject) {
          onUpdateMilestones(nextMilestones, selectedProject.id);
        }
        showToast(`Milestone updated to ${nextStatus}!`, 'success');
      }
    });
  };

  const handleDeleteMilestone = (id) => {
    const ms = milestones.find(m => m.id === id);
    const msName = ms ? ms.name : 'this milestone';

    setConfirmModalState({
      isOpen: true,
      title: 'Delete Milestone?',
      message: `Are you sure you want to permanently delete "${msName}"? This action cannot be undone.`,
      confirmText: 'Delete Milestone',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        const nextMilestones = milestones.filter(m => m.id !== id);
        setMilestones(nextMilestones);
        if (selectedProject) {
          selectedProject.milestones = nextMilestones;
          setSelectedProject({ ...selectedProject });
        }
        if (onUpdateMilestones && selectedProject) {
          onUpdateMilestones(nextMilestones, selectedProject.id);
        }
        showToast('Milestone deleted successfully!', 'success');
      }
    });
  };

  const handleCreateClick = () => {
    setEditingMilestone(null);
    setFormData({
      name: '',
      description: '',
      dueDate: '',
      priority: 'High',
      progress: 0,
      status: 'Pending'
    });
    setModalOpen(true);
  };

  const handleEditClick = (ms) => {
    setEditingMilestone(ms);
    setFormData({
      name: ms.name,
      description: ms.description || '',
      dueDate: ms.dueDate,
      priority: ms.priority || 'High',
      progress: ms.progress || 0,
      status: ms.status || 'Pending'
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dueDate) {
      showToast('Milestone Name and Due Date are required.', 'error');
      return;
    }

    if (!editingMilestone && formData.dueDate < todayStr) {
      showToast('Due date cannot be in the past. Please select today or a future date.', 'error');
      return;
    }

    const actionTitle = editingMilestone ? 'Update Milestone?' : 'Declare New Milestone?';
    const actionMessage = editingMilestone 
      ? `Do you want to save changes for "${formData.name}"?`
      : `Do you want to add "${formData.name}" with due date ${formData.dueDate}?`;
    const actionConfirmText = editingMilestone ? 'Save Changes' : 'Declare Milestone';

    setConfirmModalState({
      isOpen: true,
      title: actionTitle,
      message: actionMessage,
      confirmText: actionConfirmText,
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        
        let nextMilestones;
        if (editingMilestone) {
          const statusVal = formData.status;
          const progressVal = statusVal === 'Completed' ? 100 : 0;
          nextMilestones = milestones.map(m =>
            m.id === editingMilestone.id ? {
              ...m,
              name: formData.name,
              dueDate: formData.dueDate,
              priority: formData.priority,
              description: formData.description,
              progress: progressVal,
              status: statusVal
            } : m
          );
          showToast('Milestone updated successfully!', 'success');
        } else {
          nextMilestones = [
            ...milestones,
            {
              id: `ms-${Date.now()}`,
              name: formData.name,
              dueDate: formData.dueDate,
              priority: formData.priority,
              description: formData.description,
              progress: 0,
              status: 'Pending'
            }
          ];

          try {
            const targetTeam = selectedProject ? selectedProject.teamName : _teamName;
            if (targetTeam) {
              addNotification(
                'New Milestone Declared',
                `Milestone "${formData.name}" has been declared for your team.`,
                null,
                targetTeam,
                'info'
              );
            }
          } catch (err) {
            console.error('Failed to dispatch milestone notification:', err);
          }

          showToast('Milestone declared successfully!', 'success');
        }

        setMilestones(nextMilestones);
        if (selectedProject) {
          selectedProject.milestones = nextMilestones;
          setSelectedProject({ ...selectedProject });
        }
        if (onUpdateMilestones && selectedProject) {
          onUpdateMilestones(nextMilestones, selectedProject.id);
        }
        setModalOpen(false);
        setEditingMilestone(null);
        setFormData({ name: '', description: '', dueDate: '', priority: 'High', progress: 0, status: 'Pending' });
      }
    });
  };

  if (!selectedProject) {
    return (
      <div className="space-y-6 w-full text-left animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Team Projects
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Select a project below to view its milestones.
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
                    View Milestones
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
            Project Milestones
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Declare target execution phases, review timeline roadmaps, and monitor sprint deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateClick}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 inline-flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Declare New Milestone</span>
        </button>
      </div>

      {/* Timeline listing grid */}
      <div className="relative pl-8 space-y-6 border-l-2 border-brand-border ml-3 pt-2">
        {milestones.map((ms) => {
          const isCompleted = ms.status === 'Completed' || ms.progress === 100;
          return (
            <div key={ms.id} className="relative group text-left">
              
              {/* timeline point dot */}
              <span className={`absolute -left-[41px] top-0.5 p-1 rounded-full border transition-all duration-300 ${
                isCompleted
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-glow-emerald'
                  : 'bg-brand-card text-brand-text-muted/40 border-brand-border'
              }`}>
                <FiFlag className="w-4 h-4" />
              </span>

              {/* details card */}
              <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md hover:border-primary/20 transition-all duration-300 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className={`text-sm font-extrabold tracking-tight ${isCompleted ? 'text-brand-text-muted' : 'text-brand-text'}`}>
                    {ms.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(ms.id)}
                      className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border cursor-pointer transition-colors ${
                        isCompleted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                      }`}
                    >
                      {ms.status}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditClick(ms)}
                      className="p-1 rounded-lg text-brand-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit Milestone"
                    >
                      <FiEdit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMilestone(ms.id)}
                      className="p-1 rounded-lg text-brand-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete Milestone"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {ms.description && (
                  <p className="text-xs text-brand-text-muted leading-relaxed whitespace-pre-wrap py-1">
                    {ms.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs font-semibold text-brand-text-muted">
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3.5 h-3.5 text-primary" /> Due: {ms.dueDate}
                  </span>
                  <span>•</span>
                  <span>Completion: <strong>{ms.progress}%</strong></span>
                </div>

                {/* Progress bar inside timeline card */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                    style={{ width: `${ms.progress}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Declare Milestone Modal */}
      {modalOpen && (
        <>
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[450px] max-h-[90vh] overflow-y-auto rounded-2xl border border-brand-border bg-brand-card shadow-2xl p-6 z-50 text-left animate-scale-up custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-brand-border mb-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
                {editingMilestone ? 'Edit Target Milestone' : 'Declare Target Milestone'}
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
              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Milestone Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Phase 2 local test suites complete"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  min={editingMilestone ? undefined : todayStr}
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                >
                  <option value="High" className="bg-brand-card">High Target</option>
                  <option value="Medium" className="bg-brand-card">Medium Target</option>
                  <option value="Low" className="bg-brand-card">Low Target</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Details of the milestone achievements..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>
              {editingMilestone && (
                <div>
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    <option value="Pending" className="bg-brand-card">Pending</option>
                    <option value="Completed" className="bg-brand-card">Completed</option>
                  </select>
                </div>
              )}

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
                  <span>{editingMilestone ? 'Save Changes' : 'Create Milestone'}</span>
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

export default Milestones;
