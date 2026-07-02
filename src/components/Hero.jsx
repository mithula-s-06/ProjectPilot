import React from 'react';
import { FiArrowRight, FiPlay, FiGithub, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { RiSparklingLine } from 'react-icons/ri';
import { usePage } from '../hooks/usePage';

const Hero = () => {
  const { navigateTo } = usePage();
  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-24 flex flex-col justify-center items-center overflow-hidden grid-bg"
    >
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px] md:blur-[120px] -z-10 animate-glow" />
      <div className="absolute top-1/3 right-1/4 w-[250px] md:w-[450px] h-[250px] md:h-[450px] rounded-full bg-secondary/15 dark:bg-secondary/5 blur-[80px] md:blur-[120px] -z-10 animate-glow" style={{ animationDelay: '-4s' }} />

      <div className="max-w-5xl mx-auto px-6 text-center z-10">

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-brand-text mb-6 max-w-4xl mx-auto leading-[1.15]">
          Navigate Every Student Project{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            with Artificial Intelligence
          </span>
        </h1>

        {/* Sub-heading Paragraph 1 */}
        <p className="text-base sm:text-lg md:text-xl text-brand-text-muted font-normal max-w-3xl mx-auto leading-relaxed mb-6">
          ProjectPilot is an AI-powered student project mentoring platform that guides students, mentors, and institutions throughout the entire software development lifecycle. It helps teams know exactly what to do next while continuously monitoring project progress and quality.
        </p>

        {/* Sub-heading Paragraph 2 */}
        <p className="text-sm sm:text-base text-brand-text-muted/80 font-normal max-w-3xl mx-auto leading-relaxed mb-10">
          ProjectPilot intelligently analyzes project reports, GitHub repositories, documentation quality, milestone completion, plagiarism, AI-generated content, team contribution, project health, and risk levels. Based on the current project status, it recommends the next best task for students while helping mentors identify potential issues before projects fail.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={() => navigateTo('login')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-base shadow-lg hover:shadow-glow-primary hover-lift hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Get Started <FiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Hero;
