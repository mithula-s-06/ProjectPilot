import React from 'react';
import { FiUser, FiActivity, FiEdit, FiTrash2 } from 'react-icons/fi';

const ProjectCard = ({ project, onViewDetails, onEdit, onDelete }) => {
  if (!project) return null;

  const getHealthBadgeClass = (score = 0) => {
    if (score >= 95) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (score >= 80) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  };

  const getStatusBadgeClass = (status = 'Active') => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Warning':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Review':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Active':
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="group rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md p-6 flex flex-col justify-between hover:border-primary/20 hover:shadow-glow-primary hover:-translate-y-1 transition-all duration-500 relative overflow-hidden text-left h-full">
      {/* Decorative gradient side bar */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-secondary" />

      {/* Core details */}
      <div className="space-y-4">
        {/* Title and Badge row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-grow">
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
              {project.domain || 'General Domain'}
            </span>
            <h3 className="text-base font-extrabold text-brand-text leading-snug group-hover:text-primary transition-colors duration-300">
              {project.name || 'Untitled Project'}
            </h3>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border select-none h-fit ${getStatusBadgeClass(project.status || 'Active')}`}>
            {project.status || 'Active'}
          </span>
        </div>

        {/* Mentor Row */}
        <div className="flex items-center gap-2 text-xs text-brand-text-muted font-medium">
          <FiUser className="w-3.5 h-3.5 text-primary" />
          <span>Mentor: <strong className="text-brand-text">{!project.mentor ? 'Not Assigned' : project.mentor}</strong></span>
        </div>

        {/* Health Index Row */}
        <div className="flex items-center gap-2 text-xs text-brand-text-muted font-medium">
          <FiActivity className="w-3.5 h-3.5 text-secondary" />
          <span>Health Score:</span>
          <span className={`px-2 py-0.2 rounded-full border text-[10px] font-extrabold ${getHealthBadgeClass(project.health || 0)}`}>
            {project.health || 0}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-text-muted">
            <span>Overall Progress</span>
            <span className="text-brand-text">{project.progress || 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" 
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Button Row */}
      <div className="pt-5 border-t border-brand-border/40 mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onViewDetails}
          className="flex-grow py-2.5 rounded-xl border border-brand-border hover:border-primary/40 bg-transparent text-brand-text hover:bg-slate-200/30 dark:hover:bg-slate-800/30 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer text-center block"
        >
          View Project
        </button>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-2.5 rounded-xl border border-brand-border hover:border-primary/40 text-brand-text-muted hover:text-brand-text hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all duration-300 cursor-pointer"
            title="Edit Project"
          >
            <FiEdit className="w-4 h-4" />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2.5 rounded-xl border border-brand-border hover:border-rose-500 hover:bg-rose-500/10 text-rose-500 transition-all duration-300 cursor-pointer"
            title="Delete Project"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
