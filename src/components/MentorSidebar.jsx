import { 
  FiHome, FiUsers, FiFileText, FiEdit3, 
  FiSettings, FiUser, FiLogOut, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const MentorSidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, onLogout }) => {
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { id: 'active-teams', label: 'Active Teams', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FiFileText className="w-5 h-5" /> },
    { id: 'suggestions', label: 'Suggestions', icon: <FiEdit3 className="w-5 h-5" /> },
  ];

  const bottomMenuItems = [
    { id: 'settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <FiUser className="w-5 h-5" /> },
  ];

  const renderMenuItem = (item) => {
    const isActive = 
      activeTab === item.id || 
      (item.id === 'active-teams' && activeTab === 'team-details') ||
      (item.id === 'reports' && activeTab === 'report-review');

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 group cursor-pointer ${
          isActive
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/15 text-cyan-500 border-l-4 border-cyan-500'
            : 'text-brand-text-muted hover:text-brand-text hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
        }`}
      >
        <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-cyan-500' : 'text-brand-text-muted'}`}>
          {item.icon}
        </div>
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
      className={`hidden md:flex flex-col justify-between h-[calc(100vh-112px)] sticky top-[112px] z-30 border-r border-brand-border bg-brand-card transition-all duration-300 p-4 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Menu List */}
      <div className="space-y-2 pt-1">
        {mainMenuItems.map(renderMenuItem)}
      </div>

      {/* Bottom Menu List */}
      <div className="space-y-4 pb-8 flex-shrink-0">
        <div className="space-y-2 border-t border-brand-border/40 pt-4">
          {bottomMenuItems.map(renderMenuItem)}
          
          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-all duration-300 group cursor-pointer"
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
      </div>
    </aside>
  );
};

export default MentorSidebar;
