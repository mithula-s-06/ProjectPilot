import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-brand-bg/40">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Midnight Gradient CTA Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-[#10253F] to-slate-950 text-white border border-primary/20 p-12 md:p-16 text-center shadow-2xl">
          
          {/* Inner Glowing Blobs */}
          <div className="absolute -top-36 -left-36 w-80 h-80 rounded-full bg-primary/20 blur-[100px] pointer-events-none animate-glow" />
          <div className="absolute -bottom-36 -right-36 w-80 h-80 rounded-full bg-secondary/30 blur-[100px] pointer-events-none animate-glow" style={{ animationDelay: '-3s' }} />
          
          {/* Grid Overlay inside card */}
          <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            


            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Ready to Build Better Projects?
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Start using ProjectPilot to receive AI-powered project guidance, improve collaboration, monitor project health, and successfully complete your software projects.
            </p>

            {/* Button */}
            <button className="px-8 py-4 rounded-xl bg-white text-[#081A2F] font-bold text-base shadow-xl hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover-lift hover:bg-slate-100 transition-all duration-300 flex items-center justify-center gap-2 group">
              Get Started
              <FiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            
          </div>
        </div>

      </div>
    </section>
  );
};

export default CTA;
