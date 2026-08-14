import React, { useState } from 'react';
import { FiGithub, FiChevronDown, FiChevronUp, FiGitCommit, FiGitPullRequest, FiCheckCircle } from 'react-icons/fi';

const GithubContributionCard = ({ github = {} }) => {
  const [expanded, setExpanded] = useState(false);

  // Simple deterministic hash for repoUrl to simulate custom commits per repo URL
  const getHash = (str) => {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const repoUrl = github.repoUrl || '';
  const seed = getHash(repoUrl || 'default-seed');

  // Use the actual database values directly, no mock overrides
  const commits = github.commits || 0;
  const prs = github.prs || 0;
  const issues = github.issuesClosed || github.issues || 0;
  const contributionPercentage = github.contributionPercentage || 0;

  if (!repoUrl) {
    return (
      <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden shadow-md transition-all duration-300 h-full p-6 text-center flex flex-col items-center justify-center min-h-[220px]">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 text-brand-text-muted border border-brand-border mb-3">
          <FiGithub className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-text mb-1">
          GitHub Contribution
        </h3>
        <p className="text-[11px] leading-relaxed text-brand-text-muted max-w-[280px]">
          No GitHub repository has been linked to this project yet. Edit project details to add a repository URL.
        </p>
      </div>
    );
  }

  // Generate mock heatmap grouped by monthly blocks (Jul 2025 to Jun 2026)
  const renderHeatmap = () => {
    const months = [
      { name: 'Jul', year: 2025 },
      { name: 'Aug', year: 2025 },
      { name: 'Sep', year: 2025 },
      { name: 'Oct', year: 2025 },
      { name: 'Nov', year: 2025 },
      { name: 'Dec', year: 2025 },
      { name: 'Jan', year: 2026 },
      { name: 'Feb', year: 2026 },
      { name: 'Mar', year: 2026 },
      { name: 'Apr', year: 2026 },
      { name: 'May', year: 2026 },
      { name: 'Jun', year: 2026 }
    ];

    return (
      <div className="flex items-start gap-3 overflow-x-auto pb-3 pt-2 custom-scrollbar justify-start select-none">
        {months.map((m, mIdx) => {
          // Adjust activity weighting dynamically to simulate a realistic contribution history
          let activityWeight = 0.08;
          if (m.name === 'Jun') activityWeight = 0.65;
          else if (m.name === 'May') activityWeight = 0.4;
          else if (m.name === 'Mar') activityWeight = 0.25;

          const colsCount = 4; // 4 columns per month block
          const cols = [];

          for (let c = 0; c < colsCount; c++) {
            const colSquares = [];
            for (let r = 0; r < 7; r++) {
              // Deterministic pseudo-random value based on repoUrl seed and cell coordinates
              const cellSeed = (seed + mIdx * 137 + c * 47 + r * 19) % 100;
              const hasCommit = commits > 0 && cellSeed < (activityWeight * 100);
              let submissions = 0;
              
              // Default inactive GitHub style colors
              let colorClass = 'bg-slate-200 dark:bg-[#161b22] hover:border-slate-400 dark:hover:border-slate-600';
              
              if (hasCommit) {
                // Deterministic commits count (1 to 4)
                const val = (cellSeed % 4) + 1;
                submissions = val;
                if (val === 1) {
                  colorClass = 'bg-emerald-500/30 dark:bg-[#0e4429] hover:border-emerald-300 dark:hover:border-[#26a641]';
                } else if (val === 2) {
                  colorClass = 'bg-emerald-500/60 dark:bg-[#006d32] hover:border-emerald-300 dark:hover:border-[#26a641]';
                } else if (val === 3) {
                  colorClass = 'bg-emerald-400 dark:bg-[#26a641] hover:border-emerald-200 dark:hover:border-[#39d353]';
                } else {
                  colorClass = 'bg-emerald-300 dark:bg-[#39d353] hover:border-white';
                }
              }

              // Realistic day index offset
              const dayOffset = (c * 7 + r) % 28 + 1;
              const dateString = `${m.name} ${dayOffset}, ${m.year}`;

              colSquares.push(
                <div
                  key={`${c}-${r}`}
                  className={`w-2.5 h-2.5 rounded-sm border border-transparent transition-all duration-200 cursor-pointer ${colorClass}`}
                  title={`${submissions > 0 ? `${submissions} commits` : 'No commits'} on ${dateString}`}
                />
              );
            }
            cols.push(
              <div key={c} className="flex flex-col gap-0.5">
                {colSquares}
              </div>
            );
          }

          return (
            <div key={m.name} className="flex flex-col items-center gap-2 flex-shrink-0">
              {/* 4 columns layout inside month block */}
              <div className="flex gap-0.5">
                {cols}
              </div>
              {/* Centered Month label underneath */}
              <span className="text-[10px] font-bold text-brand-text-muted/60 select-none">
                {m.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300 h-full">
      
      {/* Header (Always Visible) */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-slate-900/90 text-white dark:bg-brand-card dark:text-slate-200 border border-brand-border">
            <FiGithub className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              GitHub Contribution
            </h3>
          </div>
        </div>

        {/* Right Info Summary */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-base font-extrabold text-brand-text block">
              {commits} Commits
            </span>

          </div>
          <div className="text-brand-text-muted">
            {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable Panel */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 space-y-5 animate-fade-in text-left">
          
          {/* Key Metrics grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            
            <div className="p-3 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 text-center flex flex-col items-center justify-center">
              <FiGitCommit className="w-5 h-5 text-primary mb-1" />
              <span className="text-[8px] font-bold text-brand-text-muted uppercase tracking-wider block">
                Commits
              </span>
              <span className="text-sm font-extrabold text-brand-text mt-0.5">
                {commits}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 text-center flex flex-col items-center justify-center">
              <FiGitPullRequest className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-[8px] font-bold text-brand-text-muted uppercase tracking-wider block">
                PRs Open
              </span>
              <span className="text-sm font-extrabold text-brand-text mt-0.5">
                {prs}
              </span>
            </div>

          </div>



        </div>
      )}

    </div>
  );
};

export default GithubContributionCard;
