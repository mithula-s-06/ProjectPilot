import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCheck, FiCalendar, FiFlag } from 'react-icons/fi';

const Milestones = ({ project, teamName, onUpdateMilestones }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [milestones, setMilestones] = useState(() => {
    if (project && project.milestones) {
      return project.milestones;
    }
    return [];
  });

  useEffect(() => {
    if (project && project.milestones) {
      setMilestones(project.milestones);
    }
  }, [project]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dueDate) {
      showToast('Milestone Name and Due Date are required.', 'error');
      return;
    }

    const nextMilestones = [
      ...milestones,
      {
        id: `ms-${Date.now()}`,
        name: formData.name,
        dueDate: formData.dueDate,
        progress: 0,
        status: 'Pending'
      }
    ];

    setMilestones(nextMilestones);
    if (onUpdateMilestones) {
      onUpdateMilestones(nextMilestones);
    }

    showToast('Milestone declared successfully!', 'success');
    setModalOpen(false);
    setFormData({ name: '', description: '', dueDate: '', priority: 'High' });
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
            Project Milestones
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Declare target execution phases, review timeline roadmaps, and monitor sprint deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
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
                  <h4 className={`text-sm font-extrabold tracking-tight ${isCompleted ? 'text-brand-text-muted line-through' : 'text-brand-text'}`}>
                    {ms.name}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                    isCompleted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20 animate-pulse'
                  }`}>
                    {ms.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-brand-text-muted">
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3.5 h-3.5" /> Due: {ms.dueDate}
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
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[450px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 z-50 text-left animate-scale-up custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Declare Target Milestone
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
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Milestone Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Phase 2 local test suites complete"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                >
                  <option value="High">High Target</option>
                  <option value="Medium">Medium Target</option>
                  <option value="Low">Low Target</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Details of the milestone achievements..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>

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
                  <span>Create Milestone</span>
                </button>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default Milestones;
