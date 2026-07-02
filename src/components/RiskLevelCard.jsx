import React, { useState } from 'react';
import { FiAlertTriangle, FiChevronDown, FiChevronUp, FiSliders, FiCpu } from 'react-icons/fi';

const RiskLevelCard = ({ riskDetails }) => {
  const [expanded, setExpanded] = useState(false);

  const riskLevel = riskDetails?.riskLevel || 'Low Risk';
  const prediction = riskDetails?.prediction || 12; // percentage value
  const factors = riskDetails?.factors || [];
  const aiExplanation = riskDetails?.aiExplanation || '';

  const getRiskColor = (level) => {
    const lvl = level.toLowerCase();
    if (lvl.includes('low')) return 'text-emerald-500';
    if (lvl.includes('medium') || lvl.includes('mod')) return 'text-amber-500';
    return 'text-rose-500';
  };

  // SVG Dial parameters
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (prediction / 100) * circumference;

  const dialColor = prediction < 30 ? '#10B981' : prediction < 70 ? '#F59E0B' : '#F43F5E';

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300">
      
      {/* Header (Always Visible) */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <FiAlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Project Risk Level
            </h3>
            <span className="text-xs text-brand-text-muted">Click to view risk metrics</span>
          </div>
        </div>

        {/* Right side Info Summary */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`text-lg font-extrabold block ${getRiskColor(riskLevel)}`}>
              {riskLevel}
            </span>
            <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase border bg-rose-500/5 border-rose-500/10 text-rose-500">
              {prediction}% Probability
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
          
          {/* Grid split */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            
            {/* SVG Ring Gauge Dial */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center pt-2">
              <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full transform -rotate-90">
                  {/* Backdrop Ring */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-brand-border/40"
                  />
                  {/* Colored Active Ring */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={dialColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Score text inside ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-extrabold text-brand-text leading-none">
                    {prediction}%
                  </span>
                  <span className="text-[8px] font-bold text-brand-text-muted uppercase tracking-wider mt-0.5 leading-none">
                    Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Risk factors list */}
            <div className="sm:col-span-8 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted flex items-center gap-1.5">
                <FiSliders className="w-4 h-4" /> Detected Risk Factors
              </h4>
              <div className="flex flex-wrap gap-2">
                {factors.length > 0 ? (
                  factors.map((factor, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-brand-text-muted"
                    >
                      {factor}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-brand-text-muted italic">
                    No critical risk factors detected by AI.
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* AI Explanation block */}
          {aiExplanation && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit border border-primary/10 flex-shrink-0">
                <FiCpu className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  AI Risk Prediction Insights
                </h4>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  {aiExplanation}
                </p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default RiskLevelCard;
