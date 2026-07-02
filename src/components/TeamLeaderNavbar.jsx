import React, { useState } from 'react';
import { FiBell, FiMenu, FiUser, FiChevronDown } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import ProfileMenu from './ProfileMenu';
import ThemeToggle from './ThemeToggle';

const TeamLeaderNavbar = ({ 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  mobileSidebarOpen, 
  setMobileSidebarOpen, 
  onLogout,
  notifications,
  onSeeAllNotifications
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setMobileSidebarOpen(!mobileSidebarOpen);
    }
  };

  return (
    <nav className="sticky top-0 left-0 w-full z-50 bg-brand-card border-b border-brand-border py-8 px-6 flex items-center justify-between select-none">
      
      {/* LEFT: brand logo */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 focus:outline-none cursor-pointer"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center cursor-pointer group"
        >
          {/* Logo SVG */}
          <svg
            className="w-7 h-7 mr-2.5 transition-transform duration-500 group-hover:rotate-12"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="tl-navbar-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#17D4E8" />
                <stop offset="100%" stopColor="#4E9BD4" />
              </linearGradient>
            </defs>
            <path
              d="M50 12L88 34L76 76L50 88L24 76L12 34L50 12Z"
              stroke="url(#tl-navbar-logo-gradient)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d="M50 28L72 65L50 54L28 65L50 28Z"
              fill="url(#tl-navbar-logo-gradient)"
            />
            <circle cx="50" cy="45" r="4.5" fill="#FFFFFF" />
          </svg>

          {/* Title */}
          <span className="text-lg font-bold tracking-tight">
            <span className="text-secondary">Project</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-0.5">
              Pilot
            </span>
          </span>
        </div>
      </div>

      {/* RIGHT: bell alerts & avatar */}
      <div className="flex items-center gap-5">
        
        {/* Global Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-full border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 relative focus:outline-none cursor-pointer"
          >
            <FiBell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-brand-card animate-pulse" />
            )}
          </button>
          
          <NotificationDropdown 
            isOpen={notificationOpen} 
            onClose={() => setNotificationOpen(false)} 
            notifications={notifications}
            onSeeAll={onSeeAllNotifications}
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-brand-border" />

        {/* Avatar Profile menu */}
        <div className="relative">
          {/* User profile dropdown trigger */}
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-200/30 dark:hover:bg-slate-800/35 transition-colors duration-300 focus:outline-none cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full border border-primary/35 bg-gradient-to-tr from-primary/15 to-secondary/10 text-primary flex items-center justify-center font-extrabold text-sm transition-all duration-300 group-hover:border-primary/60 group-hover:shadow-glow-primary">
              {(() => {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const userFullName = currentUser.fullName || 'Ankit Sharma';
                return userFullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              })()}
            </div>
            
            <div className="hidden sm:block text-left">
              <h4 className="text-xs font-bold text-brand-text leading-tight group-hover:text-primary transition-colors duration-300">
                {(() => {
                  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                  return currentUser.fullName || 'Ankit Sharma';
                })()}
              </h4>
              <span className="text-[10px] text-brand-text-muted font-medium block">
                {(() => {
                  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                  return currentUser.role || 'Team Leader';
                })()}
              </span>
            </div>
            <FiChevronDown className="w-3.5 h-3.5 text-brand-text-muted hidden sm:block" />
          </button>

          {(() => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userFullName = currentUser.fullName || 'Ankit Sharma';
            const userRole = currentUser.role || 'Team Leader';
            const userEmail = currentUser.email || 'ankit.s@pp.edu';
            return (
              <ProfileMenu 
                isOpen={profileOpen} 
                onClose={() => setProfileOpen(false)} 
                setActiveTab={setActiveTab} 
                onLogout={onLogout}
                roleLabel={userRole}
                emailLabel={userEmail}
                nameLabel={userFullName}
              />
            );
          })()}
        </div>

      </div>

    </nav>
  );
};

export default TeamLeaderNavbar;
