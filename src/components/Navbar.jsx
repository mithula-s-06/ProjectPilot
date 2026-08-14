import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { usePage } from '../hooks/usePage';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navigateTo } = usePage();

  useEffect(() => {
    const handleScroll = () => {
      // Add shadow & glass background when scrolled
      setIsScrolled(window.scrollY > 20);

      // Section spy to highlight active menu item
      const sections = ['home', 'features', 'about'];
      const scrollPosition = window.scrollY + 120; // offset for nav height

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-[var(--bg-card)] border-b border-[var(--color-border)] ${
        isScrolled
          ? 'py-4 shadow-md'
          : 'py-6 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left Side: Brand Logo & Name */}
        <div
          onClick={scrollToTop}
          className="flex items-center cursor-pointer select-none group"
        >
          {/* Custom SVG Logo */}
          <svg
            className="w-8 h-8 mr-2.5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#17D4E8" />
                <stop offset="100%" stopColor="#4E9BD4" />
              </linearGradient>
            </defs>
            <path
              d="M50 12L88 34L76 76L50 88L24 76L12 34L50 12Z"
              stroke="url(#logo-gradient)"
              strokeWidth="5"
              strokeLinejoin="round"
              className="transition-all duration-300 group-hover:stroke-primary"
            />
            <path
              d="M50 28L72 65L50 54L28 65L50 28Z"
              fill="url(#logo-gradient)"
              className="transition-all duration-300 group-hover:fill-secondary"
            />
            <circle cx="50" cy="45" r="4.5" fill="#FFFFFF" />
          </svg>

          {/* ProjectPilot Typography */}
          <span className="text-xl font-bold tracking-tight">
            <span className="text-secondary transition-all duration-300 group-hover:text-primary">Project</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-0.5">
              Pilot
            </span>
          </span>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-8">
          {['Home', 'Features', 'About'].map((link) => {
            const id = link.toLowerCase();
            const isActive = activeSection === id;
            return (
              <button
                key={link}
                onClick={() => scrollToSection(id)}
                className={`text-sm font-medium tracking-wide transition-all duration-300 relative py-1.5 ${
                  isActive ? 'text-primary' : 'text-brand-text-muted hover:text-brand-text'
                }`}
              >
                {link}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={() => navigateTo('login')}
            className="rounded-full px-5 py-2 border border-primary text-brand-text font-medium text-xs tracking-wider uppercase transition-all duration-300 hover:bg-primary/10 hover:shadow-glow-primary"
          >
            Login
          </button>
          <button
            onClick={() => navigateTo('signup')}
            className="rounded-full px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white font-medium text-xs tracking-wider uppercase hover-lift hover:shadow-glow-primary hover:brightness-110 transition-all duration-300"
          >
            Sign Up
          </button>
        </div>

        {/* Hamburger Menu Trigger (Mobile) */}
        <div className="flex md:hidden items-center space-x-3">
          <ThemeToggle className="mr-1" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full border border-brand-border text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors duration-300 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Slide-Down Mobile Drawer Menu */}
      <div
        className={`absolute top-full left-0 w-full bg-[var(--bg-card)] border-b border-[var(--color-border)] shadow-2xl py-6 px-8 flex flex-col gap-4 md:hidden transition-all duration-300 ease-in-out origin-top transform ${
          mobileMenuOpen
            ? 'scale-y-100 opacity-100 visible'
            : 'scale-y-95 opacity-0 invisible pointer-events-none'
        }`}
      >
        {['Home', 'Features', 'About'].map((link) => {
          const id = link.toLowerCase();
          const isActive = activeSection === id;
          return (
            <button
              key={link}
              onClick={() => scrollToSection(id)}
              className={`text-left text-base font-semibold py-2 transition-all duration-300 border-b border-brand-border/40 ${
                isActive ? 'text-primary pl-2' : 'text-brand-text-muted hover:text-brand-text pl-0'
              }`}
            >
              {link}
            </button>
          );
        })}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={() => { setMobileMenuOpen(false); navigateTo('login'); }}
            className="w-full rounded-full py-2.5 border border-primary text-brand-text font-semibold text-sm transition-all duration-300 hover:bg-primary/10"
          >
            Login
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); navigateTo('signup'); }}
            className="w-full rounded-full py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:brightness-110 shadow-lg"
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
