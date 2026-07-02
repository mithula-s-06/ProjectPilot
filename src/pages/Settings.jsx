import React, { useState } from 'react';
import { FiSliders, FiBell, FiLock, FiCpu, FiCheck, FiShield } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import { useTheme } from '../hooks/useTheme';

const Settings = () => {
  const { currentPage } = usePage();
  const { theme, toggleTheme, setPlatformThemeDefault } = useTheme();
  const [toast, setToast] = useState(null);

  const [settingsState, setSettingsState] = useState(() => {
    // Lazily resolve default theme setting value from localStorage
    const savedDefault = localStorage.getItem('userThemePreference') || localStorage.getItem('platformThemeDefault') || 'light';
    const displayDefault = savedDefault.charAt(0).toUpperCase() + savedDefault.slice(1);

    return {
      // Shared / Admin
      siteName: 'ProjectPilot Core',
      maintenanceMode: false,
      themeDefault: displayDefault,
      emailAlerts: true,
      weeklyReportAlerts: true,
      riskAlerts: true,
      plagiarismThreshold: 30,
      // Student Specific
      profileVisible: true,
      allowRepoAudits: true,
      twoFactorEnabled: false,
    };
  });

  const handleToggle = (key) => {
    setSettingsState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelect = (key, val) => {
    setSettingsState((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const isPlatformAdmin = localStorage.getItem('currentUser') && JSON.parse(localStorage.getItem('currentUser')).role === 'System Administrator';

    if (isPlatformAdmin) {
      localStorage.setItem('platformThemeDefault', settingsState.themeDefault.toLowerCase());
      if (setPlatformThemeDefault) {
        setPlatformThemeDefault(settingsState.themeDefault);
      }
    } else {
      // User action: update individual override preference
      const targetTheme = settingsState.themeDefault.toLowerCase();
      localStorage.setItem('userThemePreference', targetTheme);
      if (theme !== targetTheme) {
        toggleTheme();
      }
    }

    setToast('Settings saved successfully!');
    setTimeout(() => setToast(null), 3500);
  };

  const renderStudentSettings = () => {
    return (
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Theme Settings */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiCpu className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Theme Settings
            </h3>
          </div>

          <div className="space-y-3.5 pt-1">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
                Default Application Mode
              </label>
              <select
                value={settingsState.themeDefault}
                onChange={(e) => handleSelect('themeDefault', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
              >
                <option value="Light" className="bg-brand-card">Light Mode</option>
                <option value="Dark" className="bg-brand-card">Dark Mode</option>
              </select>
            </div>
            <div className="py-1">
              <span className="text-[11px] text-brand-text-muted block">
                Layout changes will cache within your active session window.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Notification Settings */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiBell className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-brand-text">Feedback Notifications</h4>
                <p className="text-[11px] text-brand-text-muted">Notify me when mentors leave review comments</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('emailAlerts')}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none ${
                  settingsState.emailAlerts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  settingsState.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-brand-text">Report Due Alerts</h4>
                <p className="text-[11px] text-brand-text-muted">Remind me when weekly report deadlines approach</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('weeklyReportAlerts')}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none ${
                  settingsState.weeklyReportAlerts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  settingsState.weeklyReportAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Privacy Settings */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiShield className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Privacy Settings
            </h3>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-brand-text">Profile Visibility</h4>
                <p className="text-[11px] text-brand-text-muted">Allow other students to discover my team index</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('profileVisible')}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none ${
                  settingsState.profileVisible ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  settingsState.profileVisible ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-brand-text">Repo Audits</h4>
                <p className="text-[11px] text-brand-text-muted">Allow mentor review bots to read active branches</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowRepoAudits')}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none ${
                  settingsState.allowRepoAudits ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  settingsState.allowRepoAudits ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Account Settings */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiLock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Account Preferences
            </h3>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-brand-text">Two-Factor Authentication</h4>
                <p className="text-[11px] text-brand-text-muted">Enforce secondary login verification checks</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('twoFactorEnabled')}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none ${
                  settingsState.twoFactorEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  settingsState.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setToast('Smart card keys refreshed!');
                  setTimeout(() => setToast(null), 3500);
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Regenerate API Dev keys
              </button>
            </div>
          </div>
        </div>

      </form>
    );
  };

  const renderAdminSettings = () => {
    return (
      <div className="space-y-8 max-w-4xl">
        
        {/* Section 1: Account Settings */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiSliders className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Account & Platform Config
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
                Platform Name
              </label>
              <input
                type="text"
                value={settingsState.siteName}
                onChange={(e) => setSettingsState({ ...settingsState, siteName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
                Default Application Mode
              </label>
              <select
                value={settingsState.themeDefault}
                onChange={(e) => handleSelect('themeDefault', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
              >
                <option value="Light" className="bg-brand-card">Light Mode</option>
                <option value="Dark" className="bg-brand-card">Dark Mode</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-brand-border/40 pt-4">
            <div>
              <h4 className="text-sm font-bold text-brand-text">Maintenance Mode</h4>
              <p className="text-[11px] text-brand-text-muted">Restrict access to system administrators only</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('maintenanceMode')}
              className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none ${
                settingsState.maintenanceMode ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
              }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                settingsState.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Section 2: Project Preferences */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiCpu className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Project Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
                Plagiarism Warning Threshold ({settingsState.plagiarismThreshold}%)
              </label>
              <input
                type="range"
                min="10"
                max="60"
                value={settingsState.plagiarismThreshold}
                onChange={(e) => setSettingsState({ ...settingsState, plagiarismThreshold: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[10px] text-brand-text-muted block mt-1.5">
                Plagiarism rate above this threshold will flag automated warnings on report submissions.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Settings */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiBell className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Notifications Config
            </h3>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-sm font-bold text-brand-text">New Team Alerts</h4>
              <p className="text-[11px] text-brand-text-muted">Notify admin when teams request registrations</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('emailAlerts')}
              className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none ${
                settingsState.emailAlerts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
              }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                settingsState.emailAlerts ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6 w-full text-left relative">
      {toast && (
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center justify-between animate-fade-in w-full">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="text-brand-text-muted hover:text-brand-text ml-2">×</button>
        </div>
      )}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          {currentPage === 'admin' ? 'System Settings' : currentPage === 'team-leader' ? 'Team Leader Preferences' : 'Student Preferences'}
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          {currentPage === 'admin' 
            ? 'Configure platform properties, notifications, and security preferences.' 
            : 'Configure notification alerts, default theme modes, and GitHub privacy integrations.'}
        </p>
      </div>

      {currentPage === 'admin' ? renderAdminSettings() : renderStudentSettings()}

      {/* Save Action Footer */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow hover:shadow-glow-primary hover-lift transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
        >
          <FiCheck className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
