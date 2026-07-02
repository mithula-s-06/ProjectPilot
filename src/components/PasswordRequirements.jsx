import React from 'react';
import { FiCheck } from 'react-icons/fi';

const PasswordRequirements = ({ password = '' }) => {
  const requirements = [
    { label: 'Minimum 8 characters', isMet: password.length >= 8 },
    { label: 'One uppercase letter', isMet: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', isMet: /[a-z]/.test(password) },
    { label: 'One number', isMet: /[0-9]/.test(password) },
    { label: 'One special character', isMet: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-2.5 p-3.5 rounded-xl border border-brand-border bg-slate-50 dark:bg-slate-900/30 text-left">
      <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-2">
        Password must contain:
      </span>
      <ul className="space-y-1.5">
        {requirements.map((req, idx) => (
          <li key={idx} className="flex items-center text-xs">
            <span className={`mr-2.5 p-0.5 rounded-full border transition-all duration-300 ${
              req.isMet
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-slate-200/50 dark:bg-slate-800 text-brand-text-muted/30 border-brand-border'
            }`}>
              <FiCheck className="w-3 h-3" />
            </span>
            <span className={`transition-colors duration-300 ${
              req.isMet ? 'text-brand-text font-semibold' : 'text-brand-text-muted/60'
            }`}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
