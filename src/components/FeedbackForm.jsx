import React, { useState } from 'react';
import { FiCheck, FiSend, FiMessageSquare } from 'react-icons/fi';

const FeedbackForm = ({ onSubmitFeedback }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setError('Please enter some feedback comments before sending.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      if (onSubmitFeedback) {
        onSubmitFeedback(feedbackText);
      }
      
      // Auto close/reset animation after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setFeedbackText('');
      }, 3000);

    }, 1200);
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md p-6 shadow-md text-left w-full relative overflow-hidden">
      
      {/* 1. Success Confirmation Animation overlay */}
      {showSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-glow-emerald animate-bounce">
            <FiCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-brand-text">
              Feedback Sent Successfully!
            </h4>
            <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
              Comments have been saved and dispatched to the team notifications dashboard.
            </p>
          </div>
        </div>
      ) : (
        /* 2. Feedback Form Layout */
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex items-center gap-2 pb-2.5 border-b border-brand-border/40">
            <FiMessageSquare className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Mentor Feedback Review Comments
            </h3>
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-semibold animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
              Suggestions & Remarks
            </label>
            <textarea
              rows="4"
              value={feedbackText}
              onChange={(e) => {
                setFeedbackText(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your comments and suggestions for the team..."
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-xs leading-relaxed"
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-cyan hover-lift disabled:opacity-50 transition-all duration-300 inline-flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <FiSend className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default FeedbackForm;
