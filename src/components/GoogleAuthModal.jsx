import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const GoogleAuthModal = ({ isOpen, onClose, onSuccess, fixedRole }) => {
  const [role, setRole] = useState(fixedRole || 'Student');
  const [status, setStatus] = useState('idle'); // 'idle' | 'success'
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleContinue = () => {
    setStatus('success');
    setTimeout(() => {
      onSuccess(role);
    }, 1600);
  };

  const handleSwitchAccount = () => {
    setMessage('Account switching is a mockup feature.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={status === 'idle' ? onClose : undefined}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center transition-opacity duration-300"
      >
        {/* Modal dialogue box */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="w-[calc(100vw-32px)] max-w-[400px] rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 text-center animate-scale-up"
        >
          {status === 'idle' ? (
            <div className="space-y-5 text-left">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 select-none">
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800">
                    Sign in with Google
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {message && (
                <div className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold text-center animate-fade-in">
                  {message}
                </div>
              )}

              {/* Account details card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-3.5 animate-fade-in select-none">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-sm">
                  G
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">ProjectPilot User</h4>
                  <span className="text-[10px] text-slate-500">user@gmail.com</span>
                </div>
              </div>

              {/* Role selection dropdown (shown if role is not fixed) */}
              {!fixedRole && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Choose Login Role Redirect
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    <option value="Student">Student Dashboard</option>
                    <option value="Mentor">Mentor Dashboard</option>
                    <option value="Team Leader">Team Leader Dashboard</option>
                  </select>
                </div>
              )}

              {/* Action trigger footer */}
              <div className="space-y-2.5 pt-3">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary transition-all duration-300 cursor-pointer focus:outline-none"
                >
                  Continue as this account
                </button>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer focus:outline-none"
                  >
                    Switch account
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-6 text-center animate-fade-in select-none">
              
              {/* Success Checkmark */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center animate-scale-up">
                  <svg className="w-8 h-8 text-emerald-500 animate-draw-checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest animate-pulse">
                  Signing you into ProjectPilot...
                </h3>
                <p className="text-[10px] text-slate-500">
                  Redirecting based on simulated routing permissions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GoogleAuthModal;
