import React from 'react';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

const ProfileMenu = ({ isOpen, onClose, setActiveTab, onLogout, roleLabel = 'Administrator', emailLabel = 'admin@pp.edu', nameLabel = '' }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Click outside overlay to close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Dropdown Container */}
      <div className="absolute right-0 top-full mt-3 w-52 rounded-2xl border border-brand-border bg-brand-card shadow-2xl p-2.5 z-50 text-left animate-fade-in origin-top-right">
        
        {/* Info label */}
        <div className="px-3.5 py-2 border-b border-brand-border mb-1">
          <h4 className="text-xs font-bold text-brand-text">{nameLabel || roleLabel}</h4>
          <div className="text-[10px] text-brand-text-muted mt-0.5 space-y-0.5">
            {nameLabel && <span className="block font-semibold">{roleLabel}</span>}
            <span className="block">{emailLabel}</span>
          </div>
        </div>

        {/* View Profile */}
        <button
          onClick={() => { setActiveTab('profile'); onClose(); }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-brand-text-muted hover:text-brand-text hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-colors duration-300"
        >
          <FiUser className="w-4 h-4 text-brand-text-muted" />
          <span>View Profile</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => { setActiveTab('settings'); onClose(); }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-brand-text-muted hover:text-brand-text hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-colors duration-300"
        >
          <FiSettings className="w-4 h-4 text-brand-text-muted" />
          <span>Settings</span>
        </button>

        {/* Divider */}
        <div className="h-[1px] bg-brand-border my-1.5" />

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors duration-300"
        >
          <FiLogOut className="w-4 h-4 text-rose-500" />
          <span>Logout</span>
        </button>

      </div>
    </>
  );
};

export default ProfileMenu;
