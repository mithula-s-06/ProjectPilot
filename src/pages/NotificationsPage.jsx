import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiTrash2, FiCheckCircle, FiInfo, FiAlertTriangle, FiAlertOctagon } from 'react-icons/fi';

const NotificationsPage = ({ notifications = [], onClearAll, onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const itemsPerPage = 10;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'danger':
        return <FiAlertOctagon className="w-5 h-5 text-rose-500" />;
      case 'info':
      default:
        return <FiInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColorClass = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/[0.02]';
      case 'warning':
        return 'border-amber-500/20 hover:border-amber-500/40 bg-amber-500/[0.02]';
      case 'danger':
        return 'border-rose-500/20 hover:border-rose-500/40 bg-rose-500/[0.02]';
      case 'info':
      default:
        return 'border-blue-500/20 hover:border-blue-500/40 bg-blue-500/[0.02]';
    }
  };

  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [notifications.length, totalPages]);

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 w-full text-left max-w-4xl animate-fade-in relative">
      
      {/* Title Header with Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer"
            title="Go Back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
              Notification Log Center
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-muted">
              Inspect historical activity logs, security diagnostics, and system events.
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={() => {
              setDeleteConfirm({
                type: 'logs',
                message: 'Are you sure you want to clear your entire notification history?',
                onConfirm: () => {
                  onClearAll();
                }
              });
            }}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-500/30 text-rose-500 hover:text-white hover:bg-rose-500 hover:border-rose-500 text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Clear History Logs</span>
          </button>
        )}
      </div>

      {/* Main Container list */}
      <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-6">
        {paginatedNotifications.length > 0 ? (
          <div className="space-y-3.5">
            {paginatedNotifications.map((notif, idx) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 ${getBorderColorClass(notif.type)}`}
              >
                {/* Icon Column */}
                <div className="p-2.5 rounded-xl bg-brand-card border border-brand-border/40 shadow-sm flex-shrink-0">
                  {getIcon(notif.type)}
                </div>

                {/* Details Column */}
                <div className="flex-grow space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-bold text-brand-text leading-snug">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-bold text-brand-text-muted/65 bg-slate-200/40 dark:bg-slate-800/40 px-2 py-0.5 rounded border border-brand-border/30 select-none">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted leading-relaxed max-w-2xl">
                    {notif.message || notif.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-brand-border/20 select-none">
                {/* Prev Button */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`p-2 rounded-lg border font-bold text-xs transition-all duration-300 flex items-center justify-center focus:outline-none ${
                    currentPage === 1
                      ? 'border-brand-border text-brand-text-muted/40 cursor-not-allowed opacity-50'
                      : 'border-brand-border text-brand-text hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                  }`}
                  title="Previous Page"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg border font-extrabold text-xs transition-all duration-300 flex items-center justify-center focus:outline-none cursor-pointer ${
                      currentPage === page
                        ? 'border-primary bg-primary text-white shadow-glow-primary'
                        : 'border-brand-border text-brand-text hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={`p-2 rounded-lg border font-bold text-xs transition-all duration-300 flex items-center justify-center focus:outline-none ${
                    currentPage === totalPages
                      ? 'border-brand-border text-brand-text-muted/40 cursor-not-allowed opacity-50'
                      : 'border-brand-border text-brand-text hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                  }`}
                  title="Next Page"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-brand-text-muted font-medium flex flex-col items-center justify-center gap-2">
            <FiInfo className="w-8 h-8 text-brand-text-muted/40 animate-bounce" />
            <span>No notifications registered in logs.</span>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <>
          <div 
            onClick={() => setDeleteConfirm(null)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] transition-opacity duration-300 animate-fade-in" 
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[400px] rounded-3xl border border-brand-border bg-brand-card shadow-2xl p-6 z-[10000] text-center animate-scale-up">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-brand-text">
                Confirm Deletion
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed max-w-xs">
                {deleteConfirm.message}
              </p>
              <div className="flex items-center gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-brand-border bg-brand-card text-brand-text font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConfirm.onConfirm();
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white hover:brightness-110 font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default NotificationsPage;
