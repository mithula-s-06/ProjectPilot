import React, { useState, useEffect } from 'react';
import { FiBell, FiMenu, FiShield } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import ProfileMenu from './ProfileMenu';
import ThemeToggle from './ThemeToggle';

const AdminNavbar = ({ 
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

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClose = () => {
      setNotificationOpen(false);
      setProfileOpen(false);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const toggleSidebar = (e) => {
    e.stopPropagation();
    if (window.innerWidth >= 768) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setMobileSidebarOpen(!mobileSidebarOpen);
    }
  };

  const handleBrandClick = (e) => {
    e.stopPropagation();
    setActiveTab('dashboard');
  };

  return (
    <nav className="sticky top-0 left-0 w-full z-50 bg-brand-card border-b border-brand-border py-8 px-6 flex items-center justify-between select-none transition-all duration-300 shadow-sm">
      
      {/* LEFT: Sidebar Toggle Button + Brand Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 focus:outline-none cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <div
          onClick={handleBrandClick}
          className="flex items-center cursor-pointer select-none group"
        >
          {/* Logo SVG */}
          <svg
            className="w-7 h-7 mr-2.5 transition-transform duration-500 group-hover:rotate-12"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="navbar-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#17D4E8" />
                <stop offset="100%" stopColor="#4E9BD4" />
              </linearGradient>
            </defs>
            <path
              d="M50 12L88 34L76 76L50 88L24 76L12 34L50 12Z"
              stroke="url(#navbar-logo-gradient)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d="M50 28L72 65L50 54L28 65L50 28Z"
              fill="url(#navbar-logo-gradient)"
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

      {/* RIGHT: Theme, Notifications, and Profile */}
      <div className="flex items-center gap-4">
        
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setProfileOpen(false);
            }}
            className="p-2 rounded-full border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 relative focus:outline-none cursor-pointer"
            aria-label="View notifications"
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

        {/* Profile Avatar */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
            aria-label="User Profile"
          >
            <div className="w-9 h-9 rounded-full border border-primary/30 bg-primary/5 text-primary flex items-center justify-center transition-all duration-300 group-hover:border-primary/60 group-hover:shadow-glow-primary">
              <FiShield className="w-4.5 h-4.5" />
            </div>
          </button>
          
          <ProfileMenu 
            isOpen={profileOpen} 
            onClose={() => setProfileOpen(false)} 
            setActiveTab={setActiveTab} 
            onLogout={onLogout}
          />
        </div>

      </div>

    </nav>
  );
};

export default AdminNavbar;
