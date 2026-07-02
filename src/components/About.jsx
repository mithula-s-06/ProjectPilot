import React from 'react';
import { FiXCircle, FiCheckCircle } from 'react-icons/fi';

const About = () => {
  const comparisonList = [
    {
      challenge: 'Teams lose direction between meetings.',
      solution: 'Continuous AI task recommendations keep momentum.',
      iconChallenge: <FiXCircle className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" />,
      iconSolution: <FiCheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />,
    },
    {
      challenge: 'Documentation and reports are inconsistent.',
      solution: 'Automated scans verify layout and content authenticity.',
      iconChallenge: <FiXCircle className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" />,
      iconSolution: <FiCheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />,
    },
    {
      challenge: 'Mentors cannot monitor every team daily.',
      solution: 'Actionable alerts flag struggling projects instantly.',
      iconChallenge: <FiXCircle className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" />,
      iconSolution: <FiCheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />,
    },
    {
      challenge: 'Project risks remain hidden until deadlines.',
      solution: 'Predictive analytics flag delays weeks in advance.',
      iconChallenge: <FiXCircle className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" />,
      iconSolution: <FiCheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />,
    },
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-brand-bg/40">
      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[130px] -z-10 animate-glow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading and description */}
          <div className="lg:col-span-5 text-left">
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-3 py-1 border border-primary/20 rounded-full bg-primary/5">
              The Platform Vision
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text mt-5 mb-6">
              Why ProjectPilot?
            </h2>
            <div className="space-y-6 text-base text-brand-text-muted leading-relaxed">
              <p>
                Student projects often fail because teams lose direction, documentation becomes inconsistent, mentors cannot continuously monitor every project, and project risks remain unnoticed until deadlines approach.
              </p>
              <p>
                ProjectPilot solves these problems using Artificial Intelligence by providing continuous project monitoring, intelligent recommendations, automated analysis, and actionable insights throughout the project lifecycle.
              </p>
            </div>
            
            {/* Callout box */}
            <div className="mt-8 p-5 rounded-xl border border-primary/20 bg-primary/5 flex items-start space-x-3">
              <span className="text-xl">💡</span>
              <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                By bridging the gap between student repositories and mentor dashboards, ProjectPilot automates the tedious parts of supervision so you can focus on building great software.
              </p>
            </div>
          </div>

          {/* Right Column: Comparative Grid */}
          <div className="lg:col-span-7">
            <div className="w-full glass-panel rounded-2xl p-6 md:p-8 border border-brand-border">
              <h3 className="text-xl font-bold text-brand-text mb-6 pb-4 border-b border-brand-border">
                The Shift in Project Mentorship
              </h3>
              
              <div className="space-y-6">
                {comparisonList.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-brand-border/40 last:border-b-0 last:pb-0">
                    {/* The Traditional Way */}
                    <div className="flex items-start">
                      {item.iconChallenge}
                      <div>
                        <h4 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">Traditional</h4>
                        <p className="text-xs sm:text-sm text-brand-text-muted">{item.challenge}</p>
                      </div>
                    </div>

                    {/* The ProjectPilot Way */}
                    <div className="flex items-start">
                      {item.iconSolution}
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">ProjectPilot</h4>
                        <p className="text-xs sm:text-sm text-brand-text font-medium">{item.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
