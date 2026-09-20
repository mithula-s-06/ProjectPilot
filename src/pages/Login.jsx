import React from 'react';
import { FiLogIn } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';

const Login = () => {
  const { navigateTo } = usePage();

  return (
    <AuthLayout
      illustrationHeading="Welcome Back to ProjectPilot"
      illustrationDescription="Continue tracking your project progress, receive AI-powered recommendations, monitor GitHub contributions, detect plagiarism, evaluate project health, and successfully complete your project with intelligent guidance."
    >
      <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-brand-border shadow-2xl flex flex-col items-center">
        
        {/* ProjectPilot Logo Circular Badge */}
        <div className="flex items-center justify-center p-3 rounded-full border border-primary/20 bg-primary/5 mb-4 select-none">
          <svg
            className="w-7 h-7"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="login-pg-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#17D4E8" />
                <stop offset="100%" stopColor="#4E9BD4" />
              </linearGradient>
            </defs>
            <path
              d="M50 12L88 34L76 76L50 88L24 76L12 34L50 12Z"
              stroke="url(#login-pg-logo-gradient)"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <path
              d="M50 28L72 65L50 54L28 65L50 28Z"
              fill="url(#login-pg-logo-gradient)"
            />
            <circle cx="50" cy="45" r="4.5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Greeting Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text mb-2 tracking-tight">
          Welcome Back 👋
        </h1>

        {/* Greeting Subheading */}
        <p className="text-xs sm:text-sm text-brand-text-muted text-center max-w-sm mb-6 leading-relaxed">
          Sign in to continue your AI-powered project journey with ProjectPilot.
        </p>

        {/* Circular Login User Icon */}
        <div className="flex items-center justify-center p-2 rounded-full border border-secondary/20 bg-secondary/5 mb-2 select-none">
          <FiLogIn className="w-5 h-5 text-secondary" />
        </div>

        {/* login tag */}
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-text-muted/60 mb-5">
          Login to ProjectPilot
        </span>

        {/* LoginForm component */}
        <div className="w-full">
          <LoginForm />
        </div>

        {/* Sign Up Redirect link */}
        <p className="text-xs sm:text-sm text-brand-text-muted mt-8 font-semibold">
          New User?{' '}
          <button
            onClick={() => navigateTo('signup')}
            className="text-primary font-bold hover:underline ml-1 focus:outline-none cursor-pointer"
          >
            Sign Up
          </button>
        </p>

      </div>
    </AuthLayout>
  );
};

export default Login;
