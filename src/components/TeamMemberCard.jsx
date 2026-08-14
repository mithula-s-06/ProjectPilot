import React from 'react';
import { FiCheckSquare, FiEdit, FiTrash2 } from 'react-icons/fi';

const TeamMemberCard = ({ member, onEdit, onDelete }) => {
  const getStatusBadgeClass = (status) => {
    if (status === 'Active') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    return 'bg-slate-500/10 text-brand-text-muted border-brand-border';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const isMe = (() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const currentUserEmail = currentUser.email || '';
      const currentUserName = currentUser.fullName || currentUser.name || '';
      
      const isMeByEmail = member.email && currentUserEmail && member.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase();
      const isMeByName = member.name && currentUserName && member.name.trim().toLowerCase() === currentUserName.trim().toLowerCase();
      return isMeByEmail || isMeByName;
    } catch (e) {
      return false;
    }
  })();

  return (
    <div className="group rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md p-6 flex flex-col justify-between hover:border-primary/20 hover:shadow-glow-primary hover:-translate-y-1 transition-all duration-500 relative overflow-hidden text-left h-full">
      {/* Top accent glow */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 blur-xl pointer-events-none rounded-full" />

      <div className="space-y-4">
        {/* Header Name & Role */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full border border-secondary/35 bg-gradient-to-tr from-secondary/15 to-primary/10 text-secondary flex items-center justify-center font-extrabold text-xs select-none">
              {getInitials(member.name)}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-brand-text leading-tight group-hover:text-primary transition-colors duration-300">
                {member.name}{isMe ? ' (You)' : ''}
              </h3>
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mt-0.5">
                {member.role || 'Developer'}
              </span>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase border select-none ${getStatusBadgeClass(member.status || 'Active')}`}>
            {member.status || 'Active'}
          </span>
        </div>



        {/* Current Tasks list */}
        <div className="space-y-2 pt-2 border-t border-brand-border/40">
          <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider block">
            Current Assignments
          </span>
          <div className="space-y-1.5">
            {(member.currentTasks || ['Reviewing repo schemas']).map((task, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-brand-text-muted leading-tight">
                <FiCheckSquare className="w-3.5 h-3.5 text-cyan-500 mt-0.5 flex-shrink-0" />
                <span>{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action row */}
        {(onEdit || onDelete) && (
          <div className="pt-4 border-t border-brand-border/40 mt-4 flex items-center justify-end gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-3.5 py-2 rounded-xl border border-brand-border hover:border-primary/30 text-brand-text-muted hover:text-brand-text hover:bg-slate-200/40 dark:hover:bg-slate-800/40 font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                title="Edit Member"
              >
                <FiEdit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3.5 py-2 rounded-xl border border-red-500/10 hover:border-red-500/30 text-rose-500 hover:bg-rose-500/10 font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                title="Remove Member"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TeamMemberCard;
