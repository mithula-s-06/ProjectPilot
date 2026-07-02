import { 
  FiHome, FiFolder, FiUsers, FiCheckSquare, 
  FiTarget, FiFileText, FiBarChart2, FiSettings, 
  FiUser, FiLogOut, FiChevronLeft, FiChevronRight,
  FiCpu
} from 'react-icons/fi';

const TeamLeaderSidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, onLogout }) => {
  
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <FiFolder className="w-5 h-5" /> },
    { id: 'members', label: 'Team Members', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <FiCheckSquare className="w-5 h-5" /> },
    { id: 'milestones', label: 'Milestones', icon: <FiTarget className="w-5 h-5" /> },
    { id: 'reports', label: 'Weekly Reports', icon: <FiFileText className="w-5 h-5" /> },
    { id: 'performance', label: 'Performance', icon: <FiBarChart2 className="w-5 h-5" /> },
    { id: 'chat-guru', label: 'Chat Guru', icon: <FiCpu className="w-5 h-5 text-indigo-500" /> },
  ];

  const bottomMenuItems = [
    { id: 'settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <FiUser className="w-5 h-5" /> },
  ];

  const renderMenuItem = (item) => {
    const isActive = 
      activeTab === item.id || 
      (item.id === 'projects' && activeTab === 'project-details');

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 group cursor-pointer ${
          isActive
            ? 'bg-gradient-to-r from-primary/20 to-secondary/15 text-primary border-l-4 border-primary'
            : 'text-brand-text-muted hover:text-brand-text hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
        }`}
      >
        <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : 'text-brand-text-muted'}`}>
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
      className={`hidden md:flex flex-col justify-between h-[calc(100vh-112px)] sticky top-[112px] z-30 border-r border-brand-border bg-brand-card/45 backdrop-blur-md transition-all duration-300 p-4 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Menu list */}
      <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-0.5">
        {mainMenuItems.map(renderMenuItem)}
      </div>

      {/* Bottom Menu list */}
      <div className="space-y-4 pt-4 border-t border-brand-border/40 flex-shrink-0">
        <div className="space-y-1.5">
          {bottomMenuItems.map(renderMenuItem)}
          
          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-all duration-300 group cursor-pointer"
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

        {/* Expand/Collapse sidebar trigger */}
        <div className="border-t border-brand-border pt-3 flex justify-end">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 focus:outline-none cursor-pointer"
          >
            {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default TeamLeaderSidebar;
