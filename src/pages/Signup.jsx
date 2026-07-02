import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import GoogleSignupButton from '../components/GoogleSignupButton';
import SignupForm from '../components/SignupForm';
import { usePage } from '../hooks/usePage';

const Signup = () => {
  const { navigateTo } = usePage();
  const [showTerms, setShowTerms] = useState(false);

  return (
    <AuthLayout
      illustrationHeading="Your AI Project Mentor"
      illustrationDescription="ProjectPilot continuously analyzes your project, monitors GitHub activity, evaluates project health, detects plagiarism, identifies AI-generated reports, predicts project risks, and recommends the next best task to keep your team moving forward."
    >
      <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-brand-border shadow-2xl flex flex-col items-center">
        
        {!showTerms && (
          <>
            {/* Brand Logo Circular Badge */}
            <div className="flex items-center justify-center p-3 rounded-full border border-primary/20 bg-primary/5 mb-4 select-none">
              <svg
                className="w-7 h-7"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="signup-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#17D4E8" />
                    <stop offset="100%" stopColor="#4E9BD4" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 12L88 34L76 76L50 88L24 76L12 34L50 12Z"
                  stroke="url(#signup-logo-gradient)"
                  strokeWidth="5.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M50 28L72 65L50 54L28 65L50 28Z"
                  fill="url(#signup-logo-gradient)"
                />
                <circle cx="50" cy="45" r="4.5" fill="#FFFFFF" />
              </svg>
            </div>

            {/* Small Joined Tag */}
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-2.5">
              Join ProjectPilot
            </span>

            {/* Main Header */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text mb-2 tracking-tight">
              Create Your Account
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-brand-text-muted text-center max-w-sm mb-6 leading-relaxed">
              Start your AI-powered project journey with ProjectPilot.
            </p>
          </>
        )}

        {/* Standard Email Registration Form */}
        <div className="w-full">
          <SignupForm showTerms={showTerms} setShowTerms={setShowTerms} />
        </div>

        {!showTerms && (
          <p className="text-xs sm:text-sm text-brand-text-muted mt-8 font-semibold">
            Already have an account?{' '}
            <button
              onClick={() => navigateTo('login')}
              className="text-primary font-bold hover:underline ml-1 focus:outline-none cursor-pointer"
            >
              Login
            </button>
          </p>
        )}

      </div>
    </AuthLayout>
  );
};

export default Signup;
