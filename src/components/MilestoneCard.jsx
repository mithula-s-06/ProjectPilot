import React, { useState } from 'react';
import { 
  FiCalendar, 
  FiChevronDown, 
  FiChevronUp, 
  FiCheckCircle, 
  FiClock, 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiX, 
  FiCheck 
} from 'react-icons/fi';
import ConfirmModal from './ConfirmModal';
import { addNotification } from '../utils/api';

const MilestoneCard = ({ milestones = [], onUpdateMilestones }) => {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAuthorized = currentUser.role === 'TEAM_LEADER' || currentUser.role === 'Team Leader' || currentUser.role === 'Mentor' || currentUser.role === 'Admin' || currentUser.role === 'System Administrator';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    priority: 'High',
    progress: 0,
    status: 'Pending'
  });
  
  const [toast, setToast] = useState(null);
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

  const handleEditClick = (e, ms) => {
    e.stopPropagation();
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

  const handleCreateClick = (e) => {
    e.stopPropagation();
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

  const handleDeleteMilestone = (e, id) => {
    e.stopPropagation();
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
        if (onUpdateMilestones) {
          onUpdateMilestones(nextMilestones);
        }
        showToast('Milestone deleted successfully!', 'success');
      }
    });
  };

  const handleToggleStatus = (e, id) => {
    e.stopPropagation();
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
        if (onUpdateMilestones) {
          onUpdateMilestones(nextMilestones);
        }
        showToast(`Milestone updated to ${nextStatus}!`, 'success');
      }
    });
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
          const progressVal = Number(formData.progress);
          const statusVal = progressVal === 100 ? 'Completed' : formData.status;
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
            // Dispatch notification
            addNotification(
              'New Milestone Declared',
              `Milestone "${formData.name}" has been declared.`,
              null,
              null,
              'info'
            );
          } catch (err) {
            console.error('Failed to dispatch milestone notification:', err);
          }
        }

        if (onUpdateMilestones) {
          onUpdateMilestones(nextMilestones);
        }
        setModalOpen(false);
        setEditingMilestone(null);
        setFormData({ name: '', description: '', dueDate: '', priority: 'High', progress: 0, status: 'Pending' });
      }
    });
  };

  // Find currently active milestone (first pending one)
  const activeMilestone = milestones.find((m) => m.status === 'Pending') || milestones[milestones.length - 1] || {};

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300">
      
      {/* Header (Always Visible) */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Upcoming Milestones
            </h3>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold text-brand-text block">
              Next: <strong className="text-secondary">{activeMilestone.name || 'None'}</strong>
            </span>
            <span className="text-[10px] text-brand-text-muted mt-0.5 block font-semibold">
              Due: {activeMilestone.dueDate || '--'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthorized && (
              <button
                type="button"
                onClick={handleCreateClick}
                className="p-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 transition-all cursor-pointer"
                title="Declare New Milestone"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            )}
            <div className="text-brand-text-muted">
              {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Panel */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 animate-fade-in text-left">
          
          {/* Vertical Timeline line container */}
          <div className="relative pl-8 space-y-6 pt-4 ml-3">
            {milestones.length === 0 ? (
              <div className="py-4 text-center text-xs text-brand-text-muted italic">
                No milestones declared yet.
              </div>
            ) : (
              milestones.map((ms) => {
                const isCompleted = ms.status === 'Completed' || ms.progress === 100;
                return (
                  <div key={ms.id} className="relative group">
                    
                    {/* Timeline Dot Icon */}
                    <span className={`absolute -left-[41px] top-0.5 p-1 rounded-full border transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-glow-emerald'
                        : 'bg-brand-card text-brand-text-muted/40 border-brand-border'
                    }`}>
                      {isCompleted ? <FiCheckCircle className="w-4 h-4" /> : <FiClock className="w-4 h-4" />}
                    </span>

                    {/* Details Card */}
                    <div className="p-4 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 hover:border-primary/20 transition-all duration-300 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-extrabold tracking-tight text-brand-text">
                            {ms.name}
                          </h4>
                          {ms.description && (
                            <p className="text-[10px] text-brand-text-muted mt-1 leading-normal">
                              {ms.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isAuthorized ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleToggleStatus(e, ms.id)}
                                className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border cursor-pointer transition-colors ${
                                  isCompleted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                }`}
                              >
                                {ms.status}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleEditClick(e, ms)}
                                className="p-1 rounded-lg text-brand-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                title="Edit Milestone"
                              >
                                <FiEdit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDeleteMilestone(e, ms.id)}
                                className="p-1 rounded-lg text-brand-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete Milestone"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                              isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary/10 text-secondary'
                            }`}>
                              {isCompleted ? 'Completed' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress slider info */}
                      <div className="flex items-center gap-4 text-[10px] font-semibold text-brand-text-muted">
                        <span>Completion: <strong>{ms.progress}%</strong></span>
                        <span>•</span>
                        <span>Due Date: <strong>{ms.dueDate}</strong></span>
                        {ms.priority && (
                          <>
                            <span>•</span>
                            <span>Priority: <strong className={ms.priority === 'High' ? 'text-rose-500' : ms.priority === 'Medium' ? 'text-amber-500' : 'text-slate-500'}>{ms.priority}</strong></span>
                          </>
                        )}
                      </div>

                      {/* Mini progress bar inside panel */}
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-secondary'}`}
                          style={{ width: `${ms.progress}%` }}
                        />
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Declare/Edit Milestone Modal */}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-brand-text-muted uppercase block mb-1.5">Progress (%)</label>
                    <input
                      type="number"
                      name="progress"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                      required
                    />
                  </div>
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

export default MilestoneCard;
