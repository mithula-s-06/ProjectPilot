import React, { useState } from 'react';
import { FiArrowLeft, FiTrendingDown, FiSliders, FiCpu, FiCheck } from 'react-icons/fi';

const RiskTeamDetails = ({ team, onBack, onSendRecommendation }) => {
  const [recommendationText, setRecommendationText] = useState('');
  
  if (!team) return null;

  // health trend drop values
  const scores = [85, 78, 70, 62, 54, 48];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const width = 500;
  const height = 150;
  const padding = 20;

  const points = scores.map((val, idx) => {
    const x = padding + (idx * (width - 2 * padding)) / (scores.length - 1);
    const minVal = 40;
    const maxVal = 100;
    const y = height - padding - ((val - minVal) * (height - 2 * padding)) / (maxVal - minVal);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmitRecommendation = (e) => {
    e.preventDefault();
    if (!recommendationText.trim()) {
      showToast('Please enter recommendations text before sending.', 'error');
      return;
    }
    if (onSendRecommendation) {
      onSendRecommendation(team.id, recommendationText.trim());
    }
    showToast('Recommendations dispatched to the team dashboard successfully!', 'success');
    setRecommendationText('');
  };

  return (
    <div className="space-y-6 w-full text-left animate-fade-in pb-12">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Risk Teams</span>
      </button>

      {/* Header */}
      <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-2xl rounded-full" />
        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">
          Flagged Critical Diagnostics
        </span>
        <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
          Risk Details: {team.name}
        </h2>
        <p className="text-xs text-brand-text-muted">
          Project: <strong className="text-brand-text">{team.project || team.projectName}</strong>
        </p>
      </div>

      {/* Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Trend Column */}
        <div className="lg:col-span-7 space-y-6 w-full">
          
          {/* Trend graph card */}
          <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-brand-border/40">
              <FiTrendingDown className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
                Health Score Decrease Trend
              </h3>
            </div>

            <div className="w-full bg-slate-50/50 dark:bg-slate-900/10 border border-brand-border rounded-xl p-3 flex justify-center">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg overflow-visible">
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" strokeDasharray="3,3" className="text-brand-border/40" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" strokeDasharray="3,3" className="text-brand-border/40" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeDasharray="3,3" className="text-brand-border/40" />

                {/* Drop path line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Points Circle Dots */}
                {points.map((p, idx) => (
                  <g key={idx} className="group/dot cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#F43F5E"
                      strokeWidth="2.5"
                    />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="text-[9px] font-extrabold fill-rose-500 opacity-0 group-hover/dot:opacity-100 transition-opacity duration-300"
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

          {/* AI analysis */}
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 h-fit border border-rose-500/20 flex-shrink-0">
              <FiCpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">
                AI Diagnostic Risk Analysis
              </h4>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Lagging commit frequency has been detected. Core milestone target 'Smart Contract local deployments' is currently 8 days overdue. 
                Pending report warnings have triggered high-priority notifications.
              </p>
            </div>
          </div>

        </div>

        {/* Deadlines Column */}
        <div className="lg:col-span-5 space-y-6 w-full">
          
          <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-brand-border/40">
              <FiSliders className="w-5 h-5 text-cyan-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
                Upcoming Deadlines
              </h3>
            </div>

            <div className="space-y-3.5 pt-1 text-xs text-brand-text-muted">
              <div className="flex justify-between border-b border-brand-border/20 pb-2">
                <span>Smart Contract Draft</span>
                <span className="text-rose-500 font-bold uppercase">Overdue</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/20 pb-2">
                <span>Sprint 4 Review Report</span>
                <span className="text-brand-text font-bold">In 2 days</span>
              </div>
              <div className="flex justify-between">
                <span>Alpha Release Audit</span>
                <span className="text-brand-text font-bold">July 15, 2026</span>
              </div>
            </div>
          </div>

          {/* Recommendations Form */}
          <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text pb-2.5 border-b border-brand-border/40">
              Submit Recommendations
            </h3>
            
            {toast && (
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold animate-fade-in w-full ${
                toast.type === 'error'
                  ? 'border-rose-500/20 bg-rose-500/10 text-rose-500'
                  : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
              }`}>
                <span>{toast.message}</span>
                <button type="button" onClick={() => setToast(null)} className="text-brand-text-muted hover:text-brand-text ml-2">×</button>
              </div>
            )}

            <form onSubmit={handleSubmitRecommendation} className="space-y-4">
              <textarea
                rows="3"
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                placeholder="Enter suggestions or corrective actions for the team..."
                className="w-full px-3 py-2 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-cyan-500/50 text-xs"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-rose transition-all duration-300 inline-flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  <span>Send Directives</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RiskTeamDetails;
