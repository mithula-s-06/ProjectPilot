import React, { useState } from 'react';
import { FiActivity, FiChevronDown, FiChevronUp, FiCpu, FiTrendingUp } from 'react-icons/fi';

const HealthScoreCard = ({ health, healthDetails, onUpdateHealth }) => {
  const [expanded, setExpanded] = useState(false);
  const [tempHealth, setTempHealth] = useState(health);
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isMentor = currentUser.role === 'Mentor' || currentUser.role === 'MENTOR';

  const handleSaveHealth = async () => {
    if (onUpdateHealth) {
      setSaving(true);
      try {
        await onUpdateHealth(tempHealth);
      } finally {
        setSaving(false);
      }
    }
  };

  React.useEffect(() => {
    setTempHealth(health);
  }, [health]);

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
        onClick={isMentor ? () => setExpanded(!expanded) : undefined}
        className={`px-6 py-5 flex items-center justify-between select-none ${
          isMentor 
            ? 'cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300' 
            : ''
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <FiActivity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Project Health Score
            </h3>
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
          {isMentor && (
            <div className="text-brand-text-muted">
              {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Panel */}
      {expanded && isMentor && (
        <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 space-y-6 animate-fade-in max-h-[500px] overflow-y-auto custom-scrollbar text-left">
          
          {/* Mentor Update Form (Only visible to Mentor) */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Update Project Health Score
            </h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={tempHealth} 
                onChange={(e) => setTempHealth(parseInt(e.target.value))}
                className="w-full sm:max-w-xs accent-primary"
              />
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={tempHealth} 
                  onChange={(e) => setTempHealth(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="px-2.5 py-1 rounded-lg border border-brand-border bg-brand-card text-brand-text text-xs font-extrabold w-16 text-center focus:border-cyan-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveHealth}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default HealthScoreCard;
