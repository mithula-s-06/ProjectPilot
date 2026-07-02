import React, { useState } from 'react';
import { FiActivity, FiChevronDown, FiChevronUp, FiCpu, FiTrendingUp } from 'react-icons/fi';

const HealthScoreCard = ({ health, healthDetails }) => {
  const [expanded, setExpanded] = useState(false);

  const getHealthBadgeClass = (score) => {
    if (score >= 95) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (score >= 80) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  };

  const getHealthStatus = (score) => {
    if (score >= 90) return 'Healthy';
    if (score >= 70) return 'Review';
    return 'Warning';
  };

  // Generate SVG path coordinate points for [78, 82, 85, 89, 93, 96] or props scores
  const scores = healthDetails?.scores || [78, 82, 85, 89, 93, 96];
  const months = healthDetails?.months || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const width = 500;
  const height = 150;
  const padding = 20;

  // Map scores into SVG space (x: index, y: inverted score)
  const points = scores.map((val, idx) => {
    const x = padding + (idx * (width - 2 * padding)) / (scores.length - 1);
    // Invert y: y=0 is top, y=height is bottom. Map 40-100 to height-padding to padding
    const minVal = 40;
    const maxVal = 100;
    const y = height - padding - ((val - minVal) * (height - 2 * padding)) / (maxVal - minVal);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300">
      
      {/* Header (Always Visible) */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <FiActivity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Project Health Score
            </h3>
            <span className="text-xs text-brand-text-muted">Click to view trend details</span>
          </div>
        </div>

        {/* Right side Info Summary */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xl font-extrabold text-brand-text block">
              {health}%
            </span>
            <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase border ${getHealthBadgeClass(health)}`}>
              {getHealthStatus(health)}
            </span>
          </div>
          <div className="text-brand-text-muted">
            {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable Panel */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 space-y-6 animate-fade-in max-h-[500px] overflow-y-auto custom-scrollbar text-left">
          
          {/* 1. SVG Line Chart */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
              Historical Score Trend
            </h4>
            
            <div className="w-full bg-slate-50/50 dark:bg-slate-900/10 border border-brand-border rounded-xl p-3 flex justify-center">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg overflow-visible">
                {/* Grid Lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" strokeDasharray="3,3" className="text-brand-border/40" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" strokeDasharray="3,3" className="text-brand-border/40" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeDasharray="3,3" className="text-brand-border/40" />

                {/* Score Path Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#chart-glow-gradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Gradients */}
                <defs>
                  <linearGradient id="chart-glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#17D4E8" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>

                {/* Points Circle Dots */}
                {points.map((p, idx) => (
                  <g key={idx} className="group/dot cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      className="hover:r-6 transition-all duration-300"
                    />
                    {/* Tooltip on dot */}
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="text-[9px] font-extrabold fill-brand-text opacity-0 group-hover/dot:opacity-100 transition-opacity duration-300"
                    >
                      {p.val}%
                    </text>
                  </g>
                ))}

                {/* X Axis Labels */}
                {points.map((p, idx) => (
                  <text
                    key={idx}
                    x={p.x}
                    y={height - 2}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-brand-text-muted"
                  >
                    {months[idx]}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* 2. Monthly Progress Indicators list */}
          <div className="grid grid-cols-3 gap-3">
            {scores.slice(-3).map((val, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-center"
              >
                <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider block">
                  {months[months.length - 3 + idx]} Score
                </span>
                <span className="text-lg font-extrabold text-brand-text mt-0.5 block">
                  {val}%
                </span>
              </div>
            ))}
          </div>

          {/* 3. AI Summary */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit border border-primary/10 flex-shrink-0">
              <FiCpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                AI Diagnostic Summary
              </h4>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                {healthDetails?.aiSummary || 'Analysis indicates stable parameter updates. Sprints are completing within bounds, and code metrics meet platform specifications.'}
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default HealthScoreCard;
