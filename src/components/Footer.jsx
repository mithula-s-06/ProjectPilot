import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-brand-border bg-brand-bg/60 py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          
          {/* Brand Info (col-span-6) */}
          <div className="md:col-span-6 text-left">
            <div
              onClick={handleScrollToTop}
              className="flex items-center cursor-pointer select-none group mb-4 inline-flex"
            >
              {/* Logo SVG */}
              <svg
                className="w-7 h-7 mr-2 transition-transform duration-500 group-hover:rotate-12"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="footer-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#17D4E8" />
                    <stop offset="100%" stopColor="#4E9BD4" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 12L88 34L76 76L50 88L24 76L12 34L50 12Z"
                  stroke="url(#footer-logo-gradient)"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
                <path
                  d="M50 28L72 65L50 54L28 65L50 28Z"
                  fill="url(#footer-logo-gradient)"
                />
                <circle cx="50" cy="45" r="4.5" fill="#FFFFFF" />
              </svg>

              {/* Text */}
              <span className="text-lg font-bold tracking-tight">
                <span className="text-secondary">Project</span>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-0.5">
                  Pilot
                </span>
              </span>
            </div>

            <p className="text-sm text-brand-text-muted max-w-sm mb-6 leading-relaxed">
              AI Powered Student Project Mentoring Platform guiding teams throughout the entire software development lifecycle.
            </p>
          </div>

          {/* Navigation Links Columns (col-span-6) */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 text-left">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-4">Product</h4>
              <ul className="space-y-2.5 text-xs text-brand-text-muted">
                <li><a href="#features" className="hover:text-primary transition-colors duration-300">Features</a></li>
                <li><a href="#home" className="hover:text-primary transition-colors duration-300">Pricing</a></li>
                <li><a href="#home" className="hover:text-primary transition-colors duration-300">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs text-brand-text-muted">
                <li><a href="#about" className="hover:text-primary transition-colors duration-300">Why Us?</a></li>
                <li><a href="#home" className="hover:text-primary transition-colors duration-300">Documentation</a></li>
                <li><a href="#home" className="hover:text-primary transition-colors duration-300">API Reference</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-4">Legal</h4>
              <ul className="space-y-2.5 text-xs text-brand-text-muted font-normal">
                <li><a href="#home" className="hover:text-primary transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#home" className="hover:text-primary transition-colors duration-300">Terms of Use</a></li>
                <li><a href="#home" className="hover:text-primary transition-colors duration-300">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="h-[1px] bg-brand-border/60 w-full mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright Info */}
          <span className="text-xs text-brand-text-muted text-center sm:text-left">
            © {currentYear} ProjectPilot. All rights reserved. Designed for excellence.
          </span>


        </div>

      </div>
    </footer>
  );
};

export default Footer;
