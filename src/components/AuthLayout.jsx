import React from 'react';
import { 
  FiArrowLeft, FiGithub, FiCheckCircle, FiFileText, 
  FiCalendar, FiUser, FiActivity, FiCpu, FiTrendingUp, 
  FiAlertTriangle, FiMessageSquare 
} from 'react-icons/fi';
import { RiSparklingLine } from 'react-icons/ri';
import ThemeToggle from './ThemeToggle';
import { usePage } from '../hooks/usePage';

const AuthLayout = ({ children, illustrationHeading, illustrationDescription }) => {
  const { navigateTo } = usePage();

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-brand-bg text-brand-text transition-colors duration-300">
      
      {/* 1. Animated Background Blobs */}
      <div className="absolute top-1/6 left-1/10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px] sm:blur-[120px] -z-10 animate-glow" />
      <div className="absolute bottom-1/6 right-1/10 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-secondary/15 dark:bg-secondary/5 blur-[80px] sm:blur-[120px] -z-10 animate-glow" style={{ animationDelay: '-3s' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-[0.15] dark:opacity-[0.07] pointer-events-none -z-20" />

      {/* 2. Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-2 text-sm font-semibold text-brand-text-muted hover:text-brand-text transition-all duration-300 group"
        >
          <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>
        <ThemeToggle />
      </header>

      {/* 3. Main Center Content Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center z-10">
        
        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 w-full items-center justify-center">
          
          {/* LEFT: Centered Authentication Card */}
          <div className="lg:col-span-6 flex justify-center items-center w-full">
            <div className="w-full max-w-[480px] animate-fade-in">
              {children}
            </div>
          </div>

          {/* RIGHT: Attractive Illustration Section (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col h-[650px] justify-between p-8 rounded-3xl border border-brand-border/40 bg-brand-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/20 transition-all duration-500 shadow-xl">
            
            {/* Inner glow blobs */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-secondary/15 blur-[80px] pointer-events-none" />

            {/* Illustration Graphic Area with 8 Floating Cards */}
            <div className="relative flex-grow flex items-center justify-center select-none scale-95 xl:scale-100">
              
              {/* Rotating Orbit rings */}
              <div className="w-80 h-80 rounded-full border border-dashed border-primary/20 animate-spin absolute" style={{ animationDuration: '60s' }} />
              <div className="w-56 h-56 rounded-full border border-dashed border-secondary/20 animate-spin absolute" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />

              {/* Glowing Center Core */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/35 flex items-center justify-center shadow-glow-primary border border-primary/30 animate-pulse">
                <RiSparklingLine className="w-10 h-10 text-primary animate-pulse" />
                <span className="absolute w-2 h-2 rounded-full bg-primary top-2 left-4 animate-ping" />
                <span className="absolute w-1.5 h-1.5 rounded-full bg-secondary bottom-3 right-6 animate-pulse" />
              </div>

              {/* FLOATING GLOW CARDS (8 total) */}
              
              {/* 1. AI Assistant */}
              <div
                className="absolute top-2 left-8 p-2 rounded-lg border border-brand-border bg-slate-900/90 dark:bg-brand-card/90 text-white flex items-center gap-2 shadow-md animate-bounce"
                style={{ animationDuration: '6s' }}
              >
                <FiCpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-semibold">AI Assistant: Online</span>
              </div>

              {/* 2. GitHub Repository */}
              <div
                className="absolute top-16 right-16 p-2 rounded-lg border border-brand-border bg-slate-900/90 dark:bg-brand-card/90 text-white flex items-center gap-2 shadow-md animate-pulse"
                style={{ animationDuration: '4s' }}
              >
                <FiGithub className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[10px] font-semibold">Repo: active</span>
              </div>

              {/* 3. Project Health Score */}
              <div
                className="absolute top-36 -left-4 p-2 rounded-lg border border-brand-border bg-slate-900/90 dark:bg-brand-card/90 text-white flex items-center gap-2 shadow-md animate-bounce"
                style={{ animationDuration: '5s', animationDelay: '-1s' }}
              >
                <FiActivity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-semibold">Health Score: 95%</span>
              </div>

              {/* 4. Weekly Report */}
              <div
                className="absolute top-44 right-0 p-2 rounded-lg border border-brand-border bg-slate-900/90 dark:bg-brand-card/90 text-white flex items-center gap-2 shadow-md animate-pulse"
                style={{ animationDuration: '5.5s', animationDelay: '-3s' }}
              >
                <FiFileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-semibold">Report: Approved</span>
              </div>

              {/* 5. Mentor Feedback */}
              <div
                className="absolute bottom-28 left-6 p-2 rounded-lg border border-brand-border bg-slate-900/90 dark:bg-brand-card/90 text-white flex items-center gap-2 shadow-md animate-bounce"
                style={{ animationDuration: '6.5s', animationDelay: '-2s' }}
              >
                <FiMessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-semibold">Mentor: 2 Reviews</span>
              </div>

              {/* 6. Risk Prediction */}
              <div
                className="absolute bottom-16 right-12 p-2 rounded-lg border border-brand-border bg-slate-900/90 dark:bg-brand-card/90 text-white flex items-center gap-2 shadow-md animate-pulse"
                style={{ animationDuration: '4.5s', animationDelay: '-1.5s' }}
              >
                <FiAlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[10px] font-semibold">Risk Level: Low</span>
              </div>

              {/* 7. Team Progress */}
              <div
                className="absolute bottom-2 -left-2 p-2 rounded-lg border border-brand-border bg-slate-900/90 dark:bg-brand-card/90 text-white flex items-center gap-2 shadow-md animate-bounce"
                style={{ animationDuration: '7.5s' }}
              >
                <FiTrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-semibold">Progress: 88%</span>
              </div>

              {/* 8. Milestone Tracking */}
              <div
                className="absolute bottom-2 right-4 p-2 rounded-lg border border-brand-border bg-slate-900/90 dark:bg-brand-card/90 text-white flex items-center gap-2 shadow-md animate-pulse"
                style={{ animationDuration: '6s', animationDelay: '-0.5s' }}
              >
                <FiCalendar className="w-3.5 h-3.5 text-secondary" />
                <span className="text-[10px] font-semibold">Milestone 3: On Time</span>
              </div>

            </div>

            {/* Description Text Panel */}
            <div className="text-left z-10 mt-4">
              <h3 className="text-2xl font-bold tracking-tight text-brand-text mb-3">
                {illustrationHeading}
              </h3>
              <p className="text-sm text-brand-text-muted leading-relaxed">
                {illustrationDescription}
              </p>
            </div>
            
          </div>
          
        </div>
      </main>

      {/* 4. Minimal Footer */}
      <footer className="w-full py-4 text-center text-xs text-brand-text-muted/60 select-none">
        © {new Date().getFullYear()} ProjectPilot. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
