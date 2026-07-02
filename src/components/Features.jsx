import React from 'react';
import { FiCompass, FiActivity, FiCopy, FiEye, FiGitBranch, FiAlertTriangle } from 'react-icons/fi';

const Features = () => {
  const featuresList = [
    {
      icon: <FiCompass className="w-6 h-6" />,
      title: 'AI Project Guidance',
      description: 'Suggests the next task students should perform after analyzing project progress and codebase development.',
      colorClass: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    },
    {
      icon: <FiActivity className="w-6 h-6" />,
      title: 'Project Health Score',
      description: 'Calculates an overall health score using milestone completeness, documentation depth, GitHub activity, weekly reports, and task velocity.',
      colorClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    },
    {
      icon: <FiCopy className="w-6 h-6" />,
      title: 'Plagiarism Detection',
      description: 'Detects copied reports and duplicated system documentation across all student projects, ensuring absolute academic integrity.',
      colorClass: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    },
    {
      icon: <FiEye className="w-6 h-6" />,
      title: 'AI Content Detection',
      description: 'Identifies AI-generated reports and code blocks to encourage authentic student learning and critical thinking.',
      colorClass: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    },
    {
      icon: <FiGitBranch className="w-6 h-6" />,
      title: 'GitHub Contribution Analytics',
      description: "Measures each team member's direct contribution using commits, pull requests, issue resolution, and repository activity metrics.",
      colorClass: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    },
    {
      icon: <FiAlertTriangle className="w-6 h-6" />,
      title: 'Risk Prediction',
      description: 'Predicts potential project delays and identifies teams at risk of failing milestones before important deadlines are missed.',
      colorClass: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-brand-bg/40">
      {/* Decorative Glow Blob */}
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-secondary/5 blur-[120px] -z-10 animate-glow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-3 py-1 border border-primary/20 rounded-full bg-primary/5">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text mt-5 mb-4">
            Intelligence Packed Features
          </h2>
          <p className="text-base text-brand-text-muted leading-relaxed">
            ProjectPilot provides an all-in-one suite of AI tools to monitor, guide, and evaluate software engineering projects, transforming how students build and mentors guide.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature, idx) => (
            <div
              key={idx}
              className="glass-panel p-8 rounded-2xl flex flex-col hover-lift hover:shadow-glow-primary hover:border-primary/40 group transition-all duration-300"
            >
              {/* Icon Container */}
              <div className={`p-4 rounded-xl border inline-flex self-start mb-6 transition-all duration-300 group-hover:scale-110 ${feature.colorClass}`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-brand-text mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-brand-text-muted leading-relaxed flex-grow">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
