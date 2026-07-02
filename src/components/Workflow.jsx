import React from 'react';
import { FiSettings, FiUsers, FiBriefcase, FiTerminal } from 'react-icons/fi';

const Workflow = () => {
  const steps = [
    {
      id: '01',
      role: 'Admin',
      icon: <FiSettings className="w-6 h-6" />,
      description: 'Creates users, manages teams, milestones, departments, and system settings.',
      colorClass: 'text-primary border-primary/20 bg-primary/5',
      glowClass: 'group-hover:shadow-[0_0_20px_rgba(23,212,232,0.3)]',
    },
    {
      id: '02',
      role: 'Mentor',
      icon: <FiUsers className="w-6 h-6" />,
      description: 'Reviews reports, evaluates progress, provides feedback, and monitors project quality.',
      colorClass: 'text-secondary border-secondary/20 bg-secondary/5',
      glowClass: 'group-hover:shadow-[0_0_20px_rgba(78,155,212,0.3)]',
    },
    {
      id: '03',
      role: 'Team Leader',
      icon: <FiBriefcase className="w-6 h-6" />,
      description: 'Assigns tasks, coordinates team activities, submits weekly reports, and manages milestones.',
      colorClass: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
      glowClass: 'group-hover:shadow-[0_0_20px_rgba(192,132,252,0.3)]',
    },
    {
      id: '04',
      role: 'Student',
      icon: <FiTerminal className="w-6 h-6" />,
      description: 'Receives AI recommendations, completes assigned tasks, improves documentation, and follows project guidance.',
      colorClass: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
      glowClass: 'group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]',
    },
  ];

  const DesktopArrow = () => (
    <div className="hidden lg:flex items-center justify-center flex-shrink-0 w-16 select-none">
      <svg className="w-10 h-6" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 12H36M36 12L26 4M36 12L26 20"
          stroke="url(#arrow-gradient-horiz)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="arrow-gradient-horiz" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#17D4E8" />
            <stop offset="100%" stopColor="#4E9BD4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  const MobileArrow = () => (
    <div className="flex lg:hidden items-center justify-center py-4 select-none">
      <svg className="w-6 h-10" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2V36M12 36L4 26M12 36L20 26"
          stroke="url(#arrow-gradient-vert)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="arrow-gradient-vert" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#17D4E8" />
            <stop offset="100%" stopColor="#4E9BD4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  return (
    <section className="py-24 relative overflow-hidden bg-brand-bg/60">
      {/* Background grids and blurs */}
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px] -z-10 animate-glow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-3 py-1 border border-primary/20 rounded-full bg-primary/5">
            Operational Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text mt-5 mb-4">
            How ProjectPilot Works
          </h2>
          <p className="text-base text-brand-text-muted leading-relaxed">
            A cohesive platform connecting all stakeholders in the academic software development lifecycle with AI at the core.
          </p>
        </div>

        {/* Workflow steps */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              {/* Workflow Card */}
              <div className="group w-full max-w-[280px] lg:max-w-xs flex flex-col items-center text-center">
                {/* Visual Card Container */}
                <div
                  className={`w-full glass-panel p-6 rounded-2xl border hover-lift transition-all duration-300 ${step.glowClass} hover:border-brand-text/20 relative`}
                >
                  {/* Step ID Badge */}
                  <span className="absolute top-4 right-4 text-xs font-mono font-bold text-brand-text-muted/40">
                    STEP {step.id}
                  </span>

                  {/* Icon */}
                  <div className={`p-4 rounded-full border inline-flex mb-5 transition-transform duration-300 group-hover:scale-110 ${step.colorClass}`}>
                    {step.icon}
                  </div>

                  {/* Role name */}
                  <h3 className="text-lg font-bold text-brand-text mb-3">
                    {step.role}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Arrow (Skip for the last card) */}
              {idx < steps.length - 1 && (
                <>
                  <DesktopArrow />
                  <MobileArrow />
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;
