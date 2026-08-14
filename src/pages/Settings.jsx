import React, { useState } from 'react';
import { FiSliders, FiBell, FiLock, FiCpu, FiCheck } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import { useTheme } from '../hooks/useTheme';
import ConfirmModal from '../components/ConfirmModal';

const Settings = () => {
  const { currentPage } = usePage();
  const { theme, toggleTheme, setPlatformThemeDefault } = useTheme();
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userEmail = currentUser.email || 'default';
  const notifStorageKey = `notifPrefs_${userEmail.toLowerCase()}`;

  const [settingsState, setSettingsState] = useState(() => {
    const savedDefault = localStorage.getItem('userThemePreference') || localStorage.getItem('platformThemeDefault') || 'light';
    const displayDefault = savedDefault.charAt(0).toUpperCase() + savedDefault.slice(1);

    // Load user persistent notification preferences
    const savedNotifs = JSON.parse(localStorage.getItem(notifStorageKey) || '{}');

    return {
      // Shared / Admin
      siteName: localStorage.getItem('platformSiteName') || 'ProjectPilot Core',
      maintenanceMode: localStorage.getItem('platformMaintenanceMode') === 'true',
      themeDefault: displayDefault,
      feedbackNotifications: savedNotifs.feedbackNotifications !== undefined ? savedNotifs.feedbackNotifications : true,
      reportDueAlerts: savedNotifs.reportDueAlerts !== undefined ? savedNotifs.reportDueAlerts : true,
      riskAlerts: savedNotifs.riskAlerts !== undefined ? savedNotifs.riskAlerts : true,
      plagiarismThreshold: Number(localStorage.getItem('platformPlagiarismThreshold') || 30),
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

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const executeSave = () => {
    setShowConfirmModal(false);
    const isPlatformAdmin = currentUser.role === 'System Administrator' || currentUser.role === 'Admin';

    // 1. Save Notification Preferences permanently
    const notifPrefs = {
      feedbackNotifications: settingsState.feedbackNotifications,
      reportDueAlerts: settingsState.reportDueAlerts,
      riskAlerts: settingsState.riskAlerts,
    };
    localStorage.setItem(notifStorageKey, JSON.stringify(notifPrefs));
    localStorage.setItem('userNotificationPreferences', JSON.stringify(notifPrefs));

    // 3. Admin platform properties
    if (isPlatformAdmin) {
      localStorage.setItem('platformSiteName', settingsState.siteName);
      localStorage.setItem('platformMaintenanceMode', settingsState.maintenanceMode ? 'true' : 'false');
      localStorage.setItem('platformPlagiarismThreshold', String(settingsState.plagiarismThreshold));
      localStorage.setItem('platformThemeDefault', settingsState.themeDefault.toLowerCase());
      if (setPlatformThemeDefault) {
        setPlatformThemeDefault(settingsState.themeDefault);
      }
    } else {
      const targetTheme = settingsState.themeDefault.toLowerCase();
      localStorage.setItem('userThemePreference', targetTheme);
      if (theme !== targetTheme) {
        toggleTheme();
      }
    }

    setToast('Settings saved and updated successfully!');
    setTimeout(() => setToast(null), 3500);
  };

  const renderStudentSettings = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
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
                Your theme preference will automatically persist across all sessions.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Notification Preferences */}
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
                onClick={() => handleToggle('feedbackNotifications')}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none cursor-pointer ${
                  settingsState.feedbackNotifications ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  settingsState.feedbackNotifications ? 'translate-x-5' : 'translate-x-0'
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
                onClick={() => handleToggle('reportDueAlerts')}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none cursor-pointer ${
                  settingsState.reportDueAlerts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  settingsState.reportDueAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  };

  const renderAdminSettings = () => {
    return (
      <div className="space-y-8 max-w-4xl">
        
        {/* Section 1: Account & Platform Config */}
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
        </div>

        {/* Section 3: Notification Preferences */}
        <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
            <FiBell className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Notifications Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-brand-text">Feedback & System Alerts</h4>
                <p className="text-[11px] text-brand-text-muted">Receive platform notifications for feedback and submissions</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('feedbackNotifications')}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none cursor-pointer ${
                  settingsState.feedbackNotifications ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  settingsState.feedbackNotifications ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-brand-text">Report & Milestone Due Alerts</h4>
                <p className="text-[11px] text-brand-text-muted">Receive reminders for approaching deadlines and milestones</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('reportDueAlerts')}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none cursor-pointer ${
                  settingsState.reportDueAlerts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                  settingsState.reportDueAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
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
          {currentPage === 'admin' ? 'System Settings' : currentPage === 'team-leader' ? 'Team Leader Preferences' : currentPage === 'mentor' ? 'Mentor Preferences' : 'Student Preferences'}
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Configure notification alerts, theme appearance, and account preferences.
        </p>
      </div>

      {currentPage === 'admin' ? renderAdminSettings() : renderStudentSettings()}

      {/* Save Action Footer */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleOpenConfirm}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow hover:shadow-glow-primary hover-lift transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
        >
          <FiCheck className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Save Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Save Changes?"
        message="Are you sure you want to update your preferences and platform configuration?"
        confirmText="Save Preferences"
        cancelText="Cancel"
        variant="primary"
        onConfirm={executeSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default Settings;
