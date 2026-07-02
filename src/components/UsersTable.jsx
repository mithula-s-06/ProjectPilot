import React from 'react';
import { FiEye, FiTrash2 } from 'react-icons/fi';

const UsersTable = ({ users = [], onViewUser, onDeleteUser }) => {

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/30 dark:bg-slate-900/20">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted w-16">
                Profile
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Name
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Email
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Role
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                Team
              </th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-brand-text-muted text-center w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60">
            {users.map((user) => (
              <tr 
                key={user.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors duration-300"
              >
                {/* Profile Circle */}
                <td className="px-6 py-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border border-brand-border ${user.avatarBg}`}>
                    {user.avatarInitials}
                  </div>
                </td>
                
                {/* Name */}
                <td className="px-6 py-4 text-sm font-bold text-brand-text">
                  {user.name}
                </td>
                
                {/* Email */}
                <td className="px-6 py-4 text-sm text-brand-text-muted font-semibold">
                  {user.email}
                </td>
                
                {/* Role */}
                <td className="px-6 py-4 text-sm font-bold text-brand-text">
                  {user.role}
                </td>
                
                {/* Team */}
                <td className="px-6 py-4 text-sm text-brand-text-muted font-medium">
                  {user.team}
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onViewUser(user)}
                      className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 cursor-pointer"
                      title="View Profile"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      className="p-1.5 rounded-lg border border-brand-border text-rose-500 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-colors duration-300 cursor-pointer"
                      title="Delete User"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
