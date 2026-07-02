import React from 'react';
import { 
  FiHome, FiUsers, FiUser, FiSettings, 
  FiLogOut, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, onLogout }) => {
  
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { id: 'teams', label: 'Teams', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <FiUser className="w-5 h-5" /> },
  ];

  const bottomMenuItems = [
    { id: 'settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <FiUser className="w-5 h-5" /> },
  ];

  const renderMenuItem = (item) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 group ${
          isActive
            ? 'bg-gradient-to-r from-primary/20 to-secondary/15 text-primary border-l-4 border-primary'
            : 'text-brand-text-muted hover:text-brand-text hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
        }`}
      >
        {/* Icon Container */}
        <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : 'text-brand-text-muted'}`}>
          {item.icon}
        </div>
        
        {/* Label (Fade out when collapsed) */}
        {!collapsed && (
          <span className="transition-opacity duration-300 whitespace-nowrap opacity-100">
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-[calc(100vh-112px)] sticky top-[112px] z-30 border-r border-brand-border bg-brand-card/45 backdrop-blur-md transition-all duration-300 p-4 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Menu list */}
      <div className="space-y-2">
        {mainMenuItems.map(renderMenuItem)}
      </div>

      {/* Spacing & Bottom Menu list */}
      <div className="space-y-6">
        <div className="space-y-2">
          {bottomMenuItems.map(renderMenuItem)}
          
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-all duration-300 group"
          >
            <div className="transition-transform duration-300 group-hover:translate-x-0.5">
              <FiLogOut className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="transition-opacity duration-300 whitespace-nowrap opacity-100">
                Logout
              </span>
            )}
          </button>
        </div>

        {/* Divider & Collapse toggle button at the bottom */}
        <div className="border-t border-brand-border pt-4 flex justify-end">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 focus:outline-none"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
