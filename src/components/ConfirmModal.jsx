import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'Do you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'danger' | 'primary' | 'warning' | 'success'
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <FiAlertTriangle className="w-6 h-6 text-rose-500" />,
          iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
        };
      case 'warning':
        return {
          icon: <FiAlertTriangle className="w-6 h-6 text-amber-500" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
        };
      case 'success':
        return {
          icon: <FiCheckCircle className="w-6 h-6 text-emerald-500" />,
          iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
        };
      default:
        return {
          icon: <FiInfo className="w-6 h-6 text-primary" />,
          iconBg: 'bg-primary/10 border-primary/20 text-primary',
          btnBg: 'bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white shadow-primary/20',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-6 shadow-2xl space-y-5 animate-scale-up text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border ${styles.iconBg} flex-shrink-0`}>
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-base font-bold text-brand-text leading-snug">
              {title}
            </h3>
            <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-brand-text-muted hover:text-brand-text p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${styles.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
