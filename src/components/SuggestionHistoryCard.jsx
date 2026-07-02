import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const SuggestionHistoryCard = ({ teamName }) => {
  const [expanded, setExpanded] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  const loadSuggestions = () => {
    try {
      const storedNotifs = localStorage.getItem('notifications');
      if (storedNotifs && teamName) {
        const parsed = JSON.parse(storedNotifs);
        const filtered = parsed.filter(n => {
          const isRecommendation = 
            (n.title && n.title.toLowerCase().includes('recommendation')) ||
            (n.title && n.title.toLowerCase().includes('feedback')) ||
            (n.title && n.title.toLowerCase().includes('evaluated'));
          
          const matchesTeam = n.targetTeam && n.targetTeam.toLowerCase() === teamName.toLowerCase();
          return isRecommendation && matchesTeam;
        });
        setSuggestions(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSuggestions();
    
    // Refresh Suggestions when window is focused or storage event fires!
    const handleFocus = () => loadSuggestions();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleFocus);
    };
  }, [teamName]);

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300">
      
      {/* Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <FiMessageSquare className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Advisor Suggestions History
            </h3>
            <span className="text-xs text-brand-text-muted">Past guidelines and directives received</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase border bg-cyan-500/5 border-cyan-500/10 text-cyan-500">
            {suggestions.length} {suggestions.length === 1 ? 'Suggestion' : 'Suggestions'}
          </span>
          <div className="text-brand-text-muted">
            {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Timeline list */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 space-y-4 animate-fade-in max-h-[350px] overflow-y-auto custom-scrollbar text-left">
          {suggestions.length > 0 ? (
            <div className="relative border-l border-brand-border/40 ml-3 pl-6 space-y-6 pt-2">
              {suggestions.map((s) => (
                <div key={s.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full border border-cyan-500 bg-brand-bg transition-transform duration-300 group-hover:scale-125 shadow-glow-cyan" />
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-brand-text">
                        {s.title}
                      </span>
                      <span className="text-[10px] font-semibold text-brand-text-muted inline-flex items-center gap-1">
                        <FiClock className="w-3 h-3" /> {s.time}
                      </span>
                    </div>
                    <p className="text-xs text-brand-text-muted leading-relaxed">
                      {s.message || s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-brand-text-muted font-medium italic">
              No suggestions or directive records found for this team.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SuggestionHistoryCard;
