import React from 'react';
import { 
  FiCheckCircle, FiInfo, FiAlertTriangle, 
  FiAlertOctagon, FiArrowRight, FiX 
} from 'react-icons/fi';

const getNotificationTimestamp = (notif) => {
  if (!notif) return 0;
  let baseDate = notif.date ? new Date(notif.date) : new Date();
  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }
  const timeStr = notif.time || '';
  const ampmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3];
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    baseDate.setHours(hours, minutes, 0, 0);
  } else if (timeStr.toLowerCase().includes('just now')) {
    baseDate.setHours(23, 59, 59, 999);
  } else if (timeStr.toLowerCase().includes('ago')) {
    baseDate.setHours(12, 0, 0, 0);
  }
  return baseDate.getTime();
};

const NotificationDropdown = ({ isOpen, onClose, notifications, onSeeAll }) => {
  if (!isOpen) return null;

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userEmail = currentUser.email || 'default';
  const notifPrefs = JSON.parse(localStorage.getItem(`notifPrefs_${userEmail.toLowerCase()}`) || '{}');

  const filteredNotifications = notifications.filter((notif) => {
    if (!notif) return false;
    const titleLower = (notif.title || '').toLowerCase();
    const msgLower = (notif.message || '').toLowerCase();

    // Check feedback notifications
    if (notifPrefs.feedbackNotifications === false) {
      if (titleLower.includes('feedback') || titleLower.includes('review') || titleLower.includes('comment') || msgLower.includes('feedback') || msgLower.includes('graded')) {
        return false;
      }
    }

    // Check deadline / report due alerts
    if (notifPrefs.reportDueAlerts === false) {
      if (titleLower.includes('reminder') || titleLower.includes('deadline') || titleLower.includes('due') || msgLower.includes('deadline') || msgLower.includes('due')) {
        return false;
      }
    }

    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    return getNotificationTimestamp(b) - getNotificationTimestamp(a);
  });
  const displayedNotifications = sortedNotifications.slice(0, 5);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-4.5 h-4.5 text-emerald-500" />;
      case 'warning':
        return <FiAlertTriangle className="w-4.5 h-4.5 text-amber-500" />;
      case 'danger':
        return <FiAlertOctagon className="w-4.5 h-4.5 text-rose-500" />;
      case 'info':
      default:
        return <FiInfo className="w-4.5 h-4.5 text-blue-500" />;
    }
  };

  const getBgClass = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'danger':
        return 'bg-rose-500/10 border-rose-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="absolute right-0 mt-3.5 w-[320px] sm:w-[380px] rounded-2xl border border-brand-border bg-brand-card shadow-2xl p-5 z-50 text-left animate-scale-up origin-top-right">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-brand-border mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-text">
            Platform Alerts Log
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 cursor-pointer"
          title="Close Alerts"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="max-h-[280px] overflow-y-auto space-y-3 pr-0.5 custom-scrollbar">
        {displayedNotifications.length > 0 ? (
          displayedNotifications.map((notif) => (
            <div
              key={notif.id}
              className="p-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/25 hover:bg-slate-100/50 dark:hover:bg-slate-900/55 transition-colors duration-300 flex items-start gap-3.5 cursor-pointer"
            >
              {/* Icon Container */}
              <div className={`p-2 rounded-lg border mt-0.5 flex-shrink-0 ${getBgClass(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
              
              {/* Details */}
              <div className="text-left flex-grow space-y-0.5">
                <h4 className="text-xs font-bold text-brand-text leading-tight">
                  {notif.title}
                </h4>
                <p className="text-[11px] text-brand-text-muted leading-relaxed">
                  {notif.message}
                </p>
                <span className="text-[9px] font-semibold text-brand-text-muted/50 block pt-1">
                  {notif.time}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-brand-text-muted font-semibold">
            Zero notification alerts in inbox.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3.5 border-t border-brand-border text-center">
        <button 
          onClick={() => { onClose(); onSeeAll(); }}
          className="w-full py-2.5 rounded-xl border border-brand-border text-xs font-bold text-primary hover:bg-primary/5 hover:border-primary/30 inline-flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
        >
          <span>See All Notifications</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

export default NotificationDropdown;
